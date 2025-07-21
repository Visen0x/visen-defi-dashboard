import { 
  Connection, 
  PublicKey, 
  Transaction, 
  StakeProgram, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Authorized,
  Lockup,
  Keypair
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
  
  // Popular and reliable validators on Solana mainnet
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
    },
    {
      publicKey: 'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD',
      name: 'Marinade Native',
      commission: 0,
      apy: 7.0,
      totalStaked: 3200000
    },
    {
      publicKey: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
      name: 'Jito',
      commission: 5,
      apy: 7.5,
      totalStaked: 2800000
    }
  ];

  constructor() {
    this.connection = walletService.getConnection();
    console.log('🏦 StakingService initialized with QuickNode RPC');
  }

  // Get available validators
  getValidators(): ValidatorInfo[] {
    return this.validators;
  }

  // Create real stake account
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
      throw new Error('Insufficient SOL balance');
    }

    // Minimum stake requirement
    if (amount < 0.001) {
      throw new Error('Minimum stake amount is 0.001 SOL');
    }

    try {
      console.log(`🏦 Creating stake account for ${amount} SOL...`);
      
      const userPublicKey = new PublicKey(walletInfo.publicKey);
      const validatorPubkey = new PublicKey(validatorPublicKey);
      
      // Create a new stake account keypair
      const stakeAccountKeypair = Keypair.generate();
      const stakeAccount = stakeAccountKeypair.publicKey;

      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
      
      // Get minimum balance for rent exemption
      const minimumRent = await this.connection.getMinimumBalanceForRentExemption(
        StakeProgram.space
      );

      console.log(`💰 Stake amount: ${lamports} lamports + ${minimumRent} rent`);

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

      // Delegate stake to validator
      transaction.add(
        StakeProgram.delegate({
          stakePubkey: stakeAccount,
          authorizedPubkey: userPublicKey,
          votePubkey: validatorPubkey,
        })
      );

      // Get recent blockhash and set fee payer
      const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPublicKey;

      console.log('📝 Signing transaction...');
      
      // Sign transaction with user's wallet
      const signedTransaction = await wallet.signTransaction(transaction);
      
      // Also sign with the stake account keypair
      signedTransaction.partialSign(stakeAccountKeypair);

      console.log('📡 Sending transaction...');
      
      // Send transaction
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        }
      );

      console.log(`⏳ Confirming transaction: ${signature}`);

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await this.connection.getLatestBlockhash()).lastValidBlockHeight
      });

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      console.log(`✅ Stake account created successfully: ${signature}`);
      return signature;

    } catch (error) {
      console.error('❌ Staking error:', error);
      if (error instanceof Error) {
        throw new Error(`Staking failed: ${error.message}`);
      }
      throw new Error('Staking failed: Unknown error');
    }
  }

  // Get user's real stake accounts
  async getUserStakeAccounts(): Promise<StakeAccount[]> {
    const walletInfo = walletService.getWalletInfo();
    
    if (!walletInfo.connected) {
      return [];
    }

    try {
      const userPublicKey = new PublicKey(walletInfo.publicKey);
      
      console.log('🔍 Fetching stake accounts...');
      
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

      console.log(`📊 Found ${stakeAccounts.length} stake accounts`);

      return stakeAccounts.map(account => {
        const data = account.account.data;
        const parsed = 'parsed' in data ? data.parsed : null;
        const info = parsed?.info;
        
        return {
          publicKey: account.pubkey.toString(),
          balance: account.account.lamports / LAMPORTS_PER_SOL,
          state: this.getStakeState(info),
          validator: this.getValidatorName(info?.stake?.delegation?.voter),
          rewards: 0 // Would need additional API calls to calculate exact rewards
        };
      });

    } catch (error) {
      console.error('❌ Error fetching stake accounts:', error);
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
      console.log(`🔄 Deactivating stake account: ${stakeAccountPublicKey}`);
      
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

      // Get recent blockhash and set fee payer
      const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPublicKey;

      // Sign and send transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      // Wait for confirmation
      await this.connection.confirmTransaction(signature);
      
      console.log(`✅ Stake account deactivated: ${signature}`);
      return signature;

    } catch (error) {
      console.error('❌ Deactivation error:', error);
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
      console.log(`💰 Withdrawing from stake account: ${stakeAccountPublicKey}`);
      
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

      // Get recent blockhash and set fee payer
      const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPublicKey;

      // Sign and send transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      // Wait for confirmation
      await this.connection.confirmTransaction(signature);
      
      console.log(`✅ Stake withdrawal completed: ${signature}`);
      return signature;

    } catch (error) {
      console.error('❌ Withdrawal error:', error);
      throw error;
    }
  }

  // Helper methods
  private getStakeState(info: any): 'active' | 'inactive' | 'activating' | 'deactivating' {
    if (!info) return 'inactive';
    
    const stake = info.stake;
    if (!stake) return 'inactive';
    
    if (stake.delegation) {
      if (stake.delegation.deactivationEpoch === '18446744073709551615') {
        return 'active';
      } else {
        return 'deactivating';
      }
    }
    
    return 'activating';
  }

  private getValidatorName(voterPubkey: string): string {
    if (!voterPubkey) return 'Unknown';
    
    const validator = this.validators.find(v => v.publicKey === voterPubkey);
    return validator ? validator.name : voterPubkey.slice(0, 8) + '...';
  }

  // Calculate estimated rewards
  calculateEstimatedRewards(amount: number, apy: number, days: number): number {
    return (amount * (apy / 100) * days) / 365;
  }
}

export const stakingService = new StakingService(); 