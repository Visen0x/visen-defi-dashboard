import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { walletService } from './walletService';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inputAmount: number;
  outputAmount: number;
  priceImpact: number;
  fee: number;
  route: string[];
}

export interface SwapResult {
  signature: string;
  inputAmount: number;
  outputAmount: number;
  fee: number;
}

class SwapService {
  private connection: Connection;
  private jupiterApiUrl = 'https://quote-api.jup.ag/v6';
  
  // Popular tokens on Solana
  private tokens: Token[] = [
    {
      address: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
    },
    {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
    },
    {
      address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png'
    },
    {
      address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
      symbol: 'mSOL',
      name: 'Marinade staked SOL',
      decimals: 9,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png'
    },
    {
      address: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
      symbol: 'JitoSOL',
      name: 'Jito Staked SOL',
      decimals: 9,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn/logo.png'
    }
  ];

  constructor() {
    this.connection = walletService.getConnection();
    console.log('🔄 SwapService initialized with QuickNode RPC');
  }

  // Get supported tokens
  getTokens(): Token[] {
    return this.tokens;
  }

  // Get real quote for token swap using Jupiter API
  async getSwapQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50 // 0.5% slippage
  ): Promise<SwapQuote> {
    try {
      const inputToken = this.tokens.find(t => t.address === inputMint);
      const outputToken = this.tokens.find(t => t.address === outputMint);
      
      if (!inputToken || !outputToken) {
        throw new Error('Token not supported');
      }

      // Convert amount to smallest unit (lamports/micro-tokens)
      const inputAmount = Math.floor(amount * Math.pow(10, inputToken.decimals));

      console.log(`🔄 Getting quote: ${amount} ${inputToken.symbol} → ${outputToken.symbol}`);

      const response = await fetch(
        `${this.jupiterApiUrl}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${inputAmount}&slippageBps=${slippageBps}&onlyDirectRoutes=false&asLegacyTransaction=false`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Jupiter API error:', errorText);
        throw new Error(`Failed to get quote: ${response.status} ${response.statusText}`);
      }

      const quoteData = await response.json();
      console.log('📊 Quote received:', quoteData);

      const outputAmount = parseInt(quoteData.outAmount) / Math.pow(10, outputToken.decimals);
      const priceImpact = parseFloat(quoteData.priceImpactPct || '0');
      const fee = parseFloat(quoteData.platformFee || '0') / Math.pow(10, 9); // Convert lamports to SOL

      return {
        inputMint,
        outputMint,
        inputAmount: amount,
        outputAmount,
        priceImpact,
        fee,
        route: quoteData.routePlan?.map((step: any) => step.swapInfo?.label || 'Unknown') || []
      };
    } catch (error) {
      console.error('❌ Error getting swap quote:', error);
      throw new Error(`Failed to get swap quote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Execute real token swap using Jupiter API
  async executeSwap(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50
  ): Promise<SwapResult> {
    const wallet = walletService.getWallet();
    const walletInfo = walletService.getWalletInfo();
    
    if (!wallet || !walletInfo.connected) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log(`🔄 Executing swap: ${amount} tokens`);
      
      // First get a fresh quote
      const inputToken = this.tokens.find(t => t.address === inputMint);
      const outputToken = this.tokens.find(t => t.address === outputMint);
      
      if (!inputToken || !outputToken) {
        throw new Error('Token not supported');
      }

      const inputAmount = Math.floor(amount * Math.pow(10, inputToken.decimals));

      // Get quote
      const quoteResponse = await fetch(
        `${this.jupiterApiUrl}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${inputAmount}&slippageBps=${slippageBps}&onlyDirectRoutes=false&asLegacyTransaction=false`
      );

      if (!quoteResponse.ok) {
        throw new Error(`Failed to get quote: ${quoteResponse.status}`);
      }

      const quoteData = await quoteResponse.json();
      console.log('📊 Fresh quote for swap:', quoteData);

      // Get swap transaction
      const swapResponse = await fetch(`${this.jupiterApiUrl}/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: quoteData,
          userPublicKey: walletInfo.publicKey,
          wrapAndUnwrapSol: true,
          computeUnitPriceMicroLamports: 'auto',
          asLegacyTransaction: false
        }),
      });

      if (!swapResponse.ok) {
        const errorText = await swapResponse.text();
        console.error('Jupiter swap API error:', errorText);
        throw new Error(`Failed to get swap transaction: ${swapResponse.status}`);
      }

      const swapData = await swapResponse.json();
      console.log('📡 Swap transaction received');

      // Handle both legacy and versioned transactions
      let transaction: Transaction | VersionedTransaction;
      
      if (swapData.swapTransaction) {
        // This is a versioned transaction - use Uint8Array instead of Buffer for browser compatibility
        const swapTransactionBuf = Uint8Array.from(atob(swapData.swapTransaction), c => c.charCodeAt(0));
        transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      } else {
        throw new Error('No transaction data received from Jupiter');
      }

      console.log('📝 Signing transaction...');

      // Sign transaction
      let signedTransaction;
      if (transaction instanceof VersionedTransaction) {
        signedTransaction = await wallet.signTransaction(transaction);
      } else {
        signedTransaction = await wallet.signTransaction(transaction);
      }

      console.log('📡 Sending transaction...');

      // Send transaction
      const rawTransaction = signedTransaction.serialize();
      const signature = await this.connection.sendRawTransaction(rawTransaction, {
        skipPreflight: false,
        preflightCommitment: 'processed'
      });

      console.log(`⏳ Confirming transaction: ${signature}`);

      // Wait for confirmation
      const latestBlockHash = await this.connection.getLatestBlockhash();
      const confirmation = await this.connection.confirmTransaction({
        signature,
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight
      });

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      const outputAmount = parseInt(quoteData.outAmount) / Math.pow(10, outputToken.decimals);
      const fee = parseFloat(quoteData.platformFee || '0') / Math.pow(10, 9);

      console.log(`✅ Swap completed: ${signature}`);

      return {
        signature,
        inputAmount: amount,
        outputAmount,
        fee
      };
      
    } catch (error) {
      console.error('❌ Swap execution error:', error);
      throw new Error(`Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get real token balance for user
  async getTokenBalance(tokenMint: string): Promise<number> {
    const walletInfo = walletService.getWalletInfo();
    
    if (!walletInfo.connected) {
      return 0;
    }

    try {
      const userPublicKey = new PublicKey(walletInfo.publicKey);
      
      // Handle SOL balance
      if (tokenMint === 'So11111111111111111111111111111111111111112') {
        return walletInfo.balance;
      }

      // Get token account for other tokens
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        userPublicKey,
        { mint: new PublicKey(tokenMint) }
      );

      if (tokenAccounts.value.length === 0) {
        return 0;
      }

      const tokenAccount = tokenAccounts.value[0];
      const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;

      return balance || 0;
    } catch (error) {
      console.error('❌ Error getting token balance:', error);
      return 0;
    }
  }

  // Get all token balances for user
  async getAllTokenBalances(): Promise<{ [symbol: string]: number }> {
    const balances: { [symbol: string]: number } = {};
    
    for (const token of this.tokens) {
      try {
        const balance = await this.getTokenBalance(token.address);
        if (balance > 0) {
          balances[token.symbol] = balance;
        }
      } catch (error) {
        console.error(`❌ Error getting balance for ${token.symbol}:`, error);
      }
    }
    
    return balances;
  }

  // Get price impact warning message
  getPriceImpactWarning(priceImpact: number): string {
    if (priceImpact > 5) {
      return 'High price impact! Consider reducing swap amount.';
    } else if (priceImpact > 2) {
      return 'Moderate price impact. Please review before proceeding.';
    } else {
      return 'Low price impact. Good swap conditions.';
    }
  }

  // Get token info by address
  getTokenInfo(address: string): Token | undefined {
    return this.tokens.find(token => token.address === address);
  }

  // Get conversion rate between two tokens
  async getConversionRate(
    inputMint: string,
    outputMint: string,
    amount: number = 1
  ): Promise<number> {
    try {
      const quote = await this.getSwapQuote(inputMint, outputMint, amount, 50);
      return quote.outputAmount / quote.inputAmount;
    } catch (error) {
      console.error('❌ Error getting conversion rate:', error);
      return 0;
    }
  }
}

export const swapService = new SwapService(); 