import { Connection, PublicKey, Transaction } from '@solana/web3.js';
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
  }

  // Get supported tokens
  getTokens(): Token[] {
    return this.tokens;
  }

  // Get quote for token swap
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

      // Convert amount to smallest unit
      const inputAmount = Math.floor(amount * Math.pow(10, inputToken.decimals));

      const response = await fetch(
        `${this.jupiterApiUrl}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${inputAmount}&slippageBps=${slippageBps}`
      );

      if (!response.ok) {
        throw new Error('Failed to get quote');
      }

      const quoteData = await response.json();

      return {
        inputMint,
        outputMint,
        inputAmount: amount,
        outputAmount: parseInt(quoteData.outAmount) / Math.pow(10, outputToken.decimals),
        priceImpact: parseFloat(quoteData.priceImpactPct || '0'),
        fee: parseFloat(quoteData.platformFee || '0'),
        route: quoteData.routePlan?.map((step: any) => step.swapInfo?.label) || []
      };
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw error;
    }
  }

  // Execute token swap
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
      // Get quote first
      const quote = await this.getSwapQuote(inputMint, outputMint, amount, slippageBps);
      
      // Get swap transaction from Jupiter
      const swapResponse = await fetch(`${this.jupiterApiUrl}/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: walletInfo.publicKey,
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: 'auto'
        }),
      });

      if (!swapResponse.ok) {
        throw new Error('Failed to get swap transaction');
      }

      const swapData = await swapResponse.json();
      
      // Deserialize transaction
      const transaction = Transaction.from(Buffer.from(swapData.swapTransaction, 'base64'));
      
      // Sign transaction with user's wallet
      const signedTransaction = await wallet.signTransaction(transaction);
      
      // Send transaction
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        }
      );

      // Wait for confirmation
      await this.connection.confirmTransaction(signature);

      return {
        signature,
        inputAmount: quote.inputAmount,
        outputAmount: quote.outputAmount,
        fee: quote.fee
      };
    } catch (error) {
      console.error('Swap execution error:', error);
      throw error;
    }
  }

  // Get token balance for user
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
      console.error('Error getting token balance:', error);
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
        console.error(`Error getting balance for ${token.symbol}:`, error);
      }
    }
    
    return balances;
  }

  // Calculate price impact warning
  getPriceImpactWarning(priceImpact: number): string {
    if (priceImpact > 5) {
      return 'High price impact - consider reducing trade size';
    } else if (priceImpact > 2) {
      return 'Moderate price impact';
    } else if (priceImpact > 0.5) {
      return 'Low price impact';
    }
    return 'Minimal price impact';
  }

  // Get token info by address
  getTokenInfo(address: string): Token | undefined {
    return this.tokens.find(token => token.address === address);
  }
}

export const swapService = new SwapService(); 