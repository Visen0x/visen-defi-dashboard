import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

export interface WalletInfo {
  publicKey: string;
  connected: boolean;
  balance: number;
}

export interface PhantomWallet {
  isPhantom: boolean;
  publicKey: PublicKey;
  connect: (opts?: any) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any[]>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
}

class WalletService {
  private connection: Connection;
  private wallet: PhantomWallet | null = null;
  private walletInfo: WalletInfo = {
    publicKey: '',
    connected: false,
    balance: 0
  };

  constructor() {
    this.connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
  }

  // Check if Phantom wallet is available
  isPhantomAvailable(): boolean {
    return !!(window as any).solana?.isPhantom;
  }

  // Get Phantom wallet instance
  getPhantomWallet(): PhantomWallet | null {
    if (this.isPhantomAvailable()) {
      return (window as any).solana;
    }
    return null;
  }

  // Connect to Phantom wallet (read-only access)
  async connectWallet(): Promise<WalletInfo> {
    try {
      if (!this.isPhantomAvailable()) {
        throw new Error('Phantom wallet not found. Please install Phantom wallet.');
      }

      const phantom = this.getPhantomWallet();
      if (!phantom) {
        throw new Error('Failed to get Phantom wallet instance');
      }

      // Request connection (only public key access)
      const response = await phantom.connect({ onlyIfTrusted: false });
      
      this.wallet = phantom;
      this.walletInfo = {
        publicKey: response.publicKey.toString(),
        connected: true,
        balance: await this.getBalance(response.publicKey)
      };

      return this.walletInfo;
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  }

  // Disconnect wallet
  async disconnectWallet(): Promise<void> {
    try {
      if (this.wallet) {
        await this.wallet.disconnect();
      }
      this.wallet = null;
      this.walletInfo = {
        publicKey: '',
        connected: false,
        balance: 0
      };
    } catch (error) {
      console.error('Wallet disconnection error:', error);
      throw error;
    }
  }

  // Get SOL balance
  async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }

  // Get current wallet info
  getWalletInfo(): WalletInfo {
    return this.walletInfo;
  }

  // Refresh wallet balance
  async refreshBalance(): Promise<number> {
    if (!this.walletInfo.connected || !this.walletInfo.publicKey) {
      return 0;
    }

    try {
      const publicKey = new PublicKey(this.walletInfo.publicKey);
      const balance = await this.getBalance(publicKey);
      this.walletInfo.balance = balance;
      return balance;
    } catch (error) {
      console.error('Error refreshing balance:', error);
      return 0;
    }
  }

  // Get connection instance for other services
  getConnection(): Connection {
    return this.connection;
  }

  // Get wallet instance for transactions (user maintains control)
  getWallet(): PhantomWallet | null {
    return this.wallet;
  }
}

export const walletService = new WalletService(); 