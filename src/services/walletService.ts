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
    // Use premium QuickNode RPC for better reliability and performance
    this.connection = new Connection(
      'https://practical-fabled-layer.solana-mainnet.quiknode.pro/07deba1260bd3338e1729afead14fa6fa9f9294d/',
      'confirmed'
    );
    
    // Test RPC connection
    this.testConnection();
  }

  // Test RPC connection
  private async testConnection(): Promise<void> {
    try {
      console.log('🔌 Testing RPC connection...');
      const slot = await this.connection.getSlot();
      console.log('✅ RPC connection successful, current slot:', slot);
      
      // Test with a known address to verify balance fetching works
      const testAddress = 'E14VV7A1NVaQtKKoGwHVuMVYRKXgVp3xTV2a';
      console.log('🧪 Testing balance fetch for address:', testAddress);
      try {
        const testBalance = await this.connection.getBalance(new PublicKey(testAddress));
        console.log('✅ Test balance fetch successful:', testBalance, 'lamports =', testBalance / 1e9, 'SOL');
      } catch (balanceError) {
        console.error('❌ Test balance fetch failed:', balanceError);
      }
    } catch (error) {
      console.error('❌ RPC connection test failed:', error);
    }
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
      console.log('🔗 Connecting to Phantom wallet...');
      const response = await phantom.connect({ onlyIfTrusted: false });
      console.log('✅ Phantom connected, public key:', response.publicKey.toString());
      
      this.wallet = phantom;
      
      // Fetch balance
      console.log('💰 Fetching balance...');
      const balance = await this.getBalance(response.publicKey);
      
      this.walletInfo = {
        publicKey: response.publicKey.toString(),
        connected: true,
        balance: balance
      };

      console.log('✅ Wallet info updated:', this.walletInfo);
      return this.walletInfo;
    } catch (error) {
      console.error('❌ Wallet connection error:', error);
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
      console.log('🔍 Fetching balance for:', publicKey.toString());
      const balance = await this.connection.getBalance(publicKey);
      console.log('💰 Raw balance (lamports):', balance);
      const solBalance = balance / 1e9; // Convert lamports to SOL
      console.log('💰 SOL balance:', solBalance);
      return solBalance;
    } catch (error) {
      console.error('❌ Error fetching balance:', error);
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
      console.log('⚠️ Cannot refresh balance: wallet not connected or no public key');
      return 0;
    }

    try {
      console.log('🔄 Refreshing balance for:', this.walletInfo.publicKey);
      const publicKey = new PublicKey(this.walletInfo.publicKey);
      const balance = await this.getBalance(publicKey);
      this.walletInfo.balance = balance;
      console.log('✅ Balance refreshed:', balance, 'SOL');
      return balance;
    } catch (error) {
      console.error('❌ Error refreshing balance:', error);
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