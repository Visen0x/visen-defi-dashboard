import { 
  Connection, 
  PublicKey, 
  Transaction, 
  StakeProgram, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Authorized,
  Lockup
} from '@solana/web3.js';
import { walletService } from './walletService';

export interface StakeAccount {
  publicKey: string;
  balance: number;
  state: 'active' | 'inactive' | 'activating' | 'deactivating';
  validator: string;
  rewards: number;
}

export interface ValidatorInfo {
  publicKey: string;
  name: string;
  commission: number;
  apy: number;
  totalStaked: number;
}

class StakingService {
  private connection: Connection;
  
  // Popular and reliable validators
  private validators: ValidatorInfo[] = [
    {
      publicKey: '7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2',
      name: 'Chorus One',
      commission: 8,
      apy: 6.5,
      totalStaked: 1500000
    },
    {
      publicKey: 'StepeLdhJ2znRjHcZdjwMWsC4nTRURNKQY8Nca82LJp',
      name: 'Step Finance',
      commission: 5,
      apy: 7.2,
      totalStaked: 2100000
    },
    {
      publicKey: 'mintrNtxN3PhAB45Pt41XqyKghTTpqcoBkQTZqh96iR',
      name: 'Marinade Finance',
      commission: 6,
      apy: 6.8,
      totalStaked: 1800000
    }
  ];

  constructor() {
    this.connection = walletService.getConnection();
  }

  // Get available validators
  getValidators(): ValidatorInfo[] {
    return this.validators;
  }

  // Create stake account (user maintains full control)
  async createStakeAccount(
    amount: number, 
    validatorPublicKey: string
  ): Promise<string> {
    const wallet = walletService.getWallet();
    const walletInfo = walletService.getWalletInfo();
    
    if (!wallet || !walletInfo.connected) {
      throw new Error('Wallet not connected');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (amount > walletInfo.balance) {
      throw new Error('Insufficient balance');
    }

    try {
      const userPublicKey = new PublicKey(walletInfo.publicKey);
      const validatorPubkey = new PublicKey(validatorPublicKey);
      
      // Create a new stake account
      const stakeAccount = new PublicKey(
        Math.random().toString(36).substring(2, 15) + 
        Math.random().toString(36).substring(2, 15)
      );

      const lamports = amount * LAMPORTS_PER_SOL;
      const minimumRent = await this.connection.getMinimumBalanceForRentExemption(
        StakeProgram.space
      );

      // Create transaction
      const transaction = new Transaction();

      // Create stake account
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: userPublicKey,
          newAccountPubkey: stakeAccount,
          lamports: lamports + minimumRent,
          space: StakeProgram.space,
          programId: StakeProgram.programId,
        })
      );

      // Initialize stake account
      transaction.add(
        StakeProgram.initialize({
          stakePubkey: stakeAccount,
          authorized: new Authorized(userPublicKey, userPublicKey),
          lockup: new Lockup(0, 0, userPublicKey),
        })
      );

      // Delegate stake
      transaction.add(
        StakeProgram.delegate({
          stakePubkey: stakeAccount,
          authorizedPubkey: userPublicKey,
          votePubkey: validatorPubkey,
        })
      );

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPublicKey;

      // Sign transaction with user's wallet
      const signedTransaction = await wallet.signTransaction(transaction);
      
      // Send transaction
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      // Wait for confirmation
      await this.connection.confirmTransaction(signature);

      return signature;
    } catch (error) {
      console.error('Staking error:', error);
      throw error;
    }
  }

  // Get user's stake accounts
  async getUserStakeAccounts(): Promise<StakeAccount[]> {
    const walletInfo = walletService.getWalletInfo();
    
    if (!walletInfo.connected) {
      return [];
    }

    try {
      const userPublicKey = new PublicKey(walletInfo.publicKey);
      
      // Get all stake accounts for the user
      const stakeAccounts = await this.connection.getParsedProgramAccounts(
        StakeProgram.programId,
        {
          filters: [
            {
              memcmp: {
                offset: 12, // Offset for authorized staker
                bytes: userPublicKey.toBase58(),
              },
            },
          ],
        }
      );

      return stakeAccounts.map(account => ({
        publicKey: account.pubkey.toString(),
        balance: account.account.lamports / LAMPORTS_PER_SOL,
        state: this.getStakeState(account.account.data),
        validator: this.getValidatorFromAccount(account.account.data),
        rewards: 0 // Would need additional API calls to calculate exact rewards
      }));
    } catch (error) {
      console.error('Error fetching stake accounts:', error);
      return [];
    }
  }

  // Deactivate stake account
  async deactivateStake(stakeAccountPublicKey: string): Promise<string> {
    const wallet = walletService.getWallet();
    const walletInfo = walletService.getWalletInfo();
    
    if (!wallet || !walletInfo.connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const userPublicKey = new PublicKey(walletInfo.publicKey);
      const stakeAccount = new PublicKey(stakeAccountPublicKey);

      const transaction = new Transaction();
      
      // Deactivate stake
      transaction.add(
        StakeProgram.deactivate({
          stakePubkey: stakeAccount,
          authorizedPubkey: userPublicKey,
        })
      );

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPublicKey;

      // Sign and send transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Deactivation error:', error);
      throw error;
    }
  }

  // Withdraw stake (after deactivation)
  async withdrawStake(stakeAccountPublicKey: string): Promise<string> {
    const wallet = walletService.getWallet();
    const walletInfo = walletService.getWalletInfo();
    
    if (!wallet || !walletInfo.connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const userPublicKey = new PublicKey(walletInfo.publicKey);
      const stakeAccount = new PublicKey(stakeAccountPublicKey);

      // Get stake account info
      const stakeAccountInfo = await this.connection.getAccountInfo(stakeAccount);
      if (!stakeAccountInfo) {
        throw new Error('Stake account not found');
      }

      const transaction = new Transaction();
      
      // Withdraw all lamports
      transaction.add(
        StakeProgram.withdraw({
          stakePubkey: stakeAccount,
          authorizedPubkey: userPublicKey,
          toPubkey: userPublicKey,
          lamports: stakeAccountInfo.lamports,
        })
      );

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPublicKey;

      // Sign and send transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Withdrawal error:', error);
      throw error;
    }
  }

  // Helper methods
  private getStakeState(data: any): 'active' | 'inactive' | 'activating' | 'deactivating' {
    // This would need proper parsing of stake account data
    // For now, return a default state
    return 'active';
  }

  private getValidatorFromAccount(data: any): string {
    // This would need proper parsing of stake account data
    // For now, return the first validator
    return this.validators[0].publicKey;
  }

  // Calculate estimated rewards
  calculateEstimatedRewards(amount: number, apy: number, days: number): number {
    return (amount * apy / 100) * (days / 365);
  }
}

export const stakingService = new StakingService(); 