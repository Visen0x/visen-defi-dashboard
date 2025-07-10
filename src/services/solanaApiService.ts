import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';

// Enhanced transaction interface with multi-API data
export interface EnhancedSolanaTransaction {
  signature: string;
  hash: string;
  type: string;
  status: 'verified' | 'completed' | 'processing' | 'failed';
  timestamp: Date;
  amount?: number;
  fee?: number;
  slot: number;
  blockNumber: number;
  gasUsed?: number;
  
  // Enhanced data from multiple APIs
  programNames?: string[];
  tokenTransfers?: TokenTransfer[];
  nftActivity?: NFTActivity[];
  defiProtocol?: string;
  description?: string;
  accountsInvolved?: string[];
  innerInstructions?: number;
  computeUnitsConsumed?: number;
}

interface TokenTransfer {
  mint: string;
  symbol?: string;
  amount: number;
  decimals: number;
  fromAddress: string;
  toAddress: string;
  uiAmount: number;
}

interface NFTActivity {
  mint: string;
  collection?: string;
  name?: string;
  action: 'mint' | 'transfer' | 'burn' | 'list' | 'sale';
  price?: number;
  marketplace?: string;
}

interface DeFiMetrics {
  totalValueLocked: number;
  volume24h: number;
  solPrice: number;
  topProtocols: Array<{
    name: string;
    tvl: number;
    volume: number;
  }>;
  yield: {
    staking: number;
    lending: number;
  };
}

interface TokenMetrics {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  holders: number;
  rank?: number;
}

export class SolanaApiService {
  private quickNodeConnection: Connection;
  private heliusApiKey: string;
  private solscanJWT: string;
  private static instance: SolanaApiService;
  private errorLogged: Set<string> = new Set(); // Track logged errors to prevent spam

  constructor() {
    // Initialize connections
    this.quickNodeConnection = new Connection(
      'https://practical-fabled-layer.solana-mainnet.quiknode.pro/07deba1260bd3338e1729afead14fa6fa9f9294d/',
      'confirmed'
    );
    
    this.heliusApiKey = '5aa83a77-14f5-4f5a-b8fb-ee2bb2fdfb69';
    this.solscanJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3MzU1NjQzNjAzOTUsImVtYWlsIjoiZGF2aWRzb25tb3JnYW5AZ21haWwuY29tIiwiYWN0aW9uIjoidG9rZW4tYXBpIiwiaWF0IjoxNzM1NTY0MzYwfQ.Hb5Pt3Ql0mVfgwfFmwEh_4oJGLIHBnEPJZCiKVKq-7A';
  }

  static getInstance(): SolanaApiService {
    if (!SolanaApiService.instance) {
      SolanaApiService.instance = new SolanaApiService();
    }
    return SolanaApiService.instance;
  }

  // Helper method to log errors only once per type
  private logErrorOnce(errorKey: string, message: string, error?: any): void {
    if (!this.errorLogged.has(errorKey)) {
      console.error(message, error);
      this.errorLogged.add(errorKey);
    }
  }

  // 🔥 ENHANCED TRANSACTION FETCHING WITH MULTI-API DATA
  async getEnhancedTransactions(limit: number = 10): Promise<EnhancedSolanaTransaction[]> {
    try {
      // Get recent transactions from QuickNode
      const quickNodeTxs = await this.getQuickNodeTransactions(limit);
      
      // Enhance with Helius data
      const enhancedTxs = await Promise.all(
        quickNodeTxs.map(async (tx) => {
          try {
            const heliusData = await this.getHeliusTransactionData(tx.signature);
            const solscanData = await this.getSolscanTransactionData(tx.signature);
            
            return this.mergeTransactionData(tx, heliusData, solscanData);
          } catch (error) {
            console.warn(`Failed to enhance transaction ${tx.signature}:`, error);
            return tx;
          }
        })
      );

      return enhancedTxs;
    } catch (error) {
      console.error('Error fetching enhanced transactions:', error);
      return [];
    }
  }

  // QuickNode - Primary transaction source
  private async getQuickNodeTransactions(limit: number): Promise<EnhancedSolanaTransaction[]> {
    const slot = await this.quickNodeConnection.getSlot();
    const block = await this.quickNodeConnection.getBlock(slot, {
      maxSupportedTransactionVersion: 0
    });

    if (!block?.transactions) return [];

    return block.transactions.slice(0, limit).map((tx, index) => {
      const signature = tx.transaction.signatures?.[0] || `unknown-${index}`;
      
      return {
        signature,
        hash: signature,
        type: 'SOL Transfer',
        status: tx.meta?.err ? 'failed' : 'verified' as const,
        timestamp: new Date(block.blockTime ? block.blockTime * 1000 : Date.now()),
        amount: this.calculateTransactionAmount(tx.meta),
        fee: tx.meta?.fee ? tx.meta.fee / 1e9 : undefined,
        slot,
        blockNumber: slot,
        gasUsed: tx.meta?.fee || 0,
        computeUnitsConsumed: tx.meta?.computeUnitsConsumed || 0
      };
    });
  }

  // 🚀 HELIUS ENHANCED PARSING
  private async getHeliusTransactionData(signature: string): Promise<any> {
    try {
      const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${this.heliusApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [
            signature,
            {
              encoding: 'jsonParsed',
              maxSupportedTransactionVersion: 0
            }
          ]
        })
      });

      const data = await response.json();
      return data.result;
    } catch (error) {
      this.logErrorOnce('helius-api', 'Helius API error:', error);
      return null;
    }
  }

  // 💎 SOLSCAN TOKEN & ANALYTICS DATA
  private async getSolscanTransactionData(signature: string): Promise<any> {
    try {
      const response = await fetch(`https://api.solscan.io/transaction?tx=${signature}`, {
        headers: {
          'Authorization': `Bearer ${this.solscanJWT}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      this.logErrorOnce('solscan-api', 'Solscan API error:', error);
      return null;
    }
  }

  // 🧠 INTELLIGENT DATA MERGING
  private mergeTransactionData(
    quickNodeTx: EnhancedSolanaTransaction,
    heliusData: any,
    solscanData: any
  ): EnhancedSolanaTransaction {
    const enhanced: EnhancedSolanaTransaction = { ...quickNodeTx };

    // Enhance with Helius data
    if (heliusData) {
      enhanced.type = this.determineTransactionType(heliusData);
      enhanced.tokenTransfers = this.extractTokenTransfers(heliusData);
      enhanced.nftActivity = this.extractNFTActivity(heliusData);
      enhanced.defiProtocol = this.identifyDeFiProtocol(heliusData);
      enhanced.innerInstructions = heliusData.meta?.innerInstructions?.length || 0;
    }

    // Enhance with Solscan data
    if (solscanData) {
      enhanced.description = this.generateTransactionDescription(solscanData);
      enhanced.accountsInvolved = solscanData.inputAccount?.slice(0, 3) || [];
    }

    return enhanced;
  }

  // 🎯 ADVANCED TRANSACTION TYPE DETECTION
  private determineTransactionType(heliusData: any): string {
    if (!heliusData?.transaction?.message?.instructions) return 'Unknown';

    const instructions = heliusData.transaction.message.instructions;
    const logs = heliusData.meta?.logMessages?.join(' ').toLowerCase() || '';

    // NFT Activity
    if (logs.includes('metaplex') || logs.includes('candy machine')) {
      return 'NFT Activity';
    }

    // DeFi Protocols
    if (logs.includes('raydium')) return 'Raydium Swap';
    if (logs.includes('serum')) return 'Serum Trade';
    if (logs.includes('orca')) return 'Orca Swap';
    if (logs.includes('jupiter')) return 'Jupiter Aggregation';
    if (logs.includes('marinade') || logs.includes('lido')) return 'Liquid Staking';
    if (logs.includes('solend') || logs.includes('tulip')) return 'DeFi Lending';

    // Token Operations
    if (instructions.some((ix: any) => ix.programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')) {
      return 'Token Transfer';
    }

    // Staking
    if (instructions.some((ix: any) => ix.programId === 'Stake11111111111111111111111111111111111111')) {
      return 'Staking Operation';
    }

    return 'SOL Transfer';
  }

  // 🪙 TOKEN TRANSFER EXTRACTION
  private extractTokenTransfers(heliusData: any): TokenTransfer[] {
    const transfers: TokenTransfer[] = [];
    
    if (heliusData?.meta?.preTokenBalances && heliusData?.meta?.postTokenBalances) {
      const preBalances = heliusData.meta.preTokenBalances;
      const postBalances = heliusData.meta.postTokenBalances;
      
      postBalances.forEach((post: any, index: number) => {
        const pre = preBalances[index];
        if (pre && post.uiTokenAmount.uiAmount !== pre.uiTokenAmount.uiAmount) {
          transfers.push({
            mint: post.mint,
            symbol: post.uiTokenAmount.symbol || 'Unknown',
            amount: Math.abs(post.uiTokenAmount.uiAmount - pre.uiTokenAmount.uiAmount),
            decimals: post.uiTokenAmount.decimals,
            fromAddress: pre.owner,
            toAddress: post.owner,
            uiAmount: post.uiTokenAmount.uiAmount
          });
        }
      });
    }
    
    return transfers;
  }

  // 🖼️ NFT ACTIVITY EXTRACTION
  private extractNFTActivity(heliusData: any): NFTActivity[] {
    const activities: NFTActivity[] = [];
    const logs = heliusData?.meta?.logMessages?.join(' ') || '';
    
    if (logs.includes('metaplex') || logs.includes('nft')) {
      // This is a simplified extraction - would need more sophisticated parsing
      activities.push({
        mint: 'NFT-detected',
        action: logs.includes('transfer') ? 'transfer' : 'mint',
        collection: 'Unknown Collection'
      });
    }
    
    return activities;
  }

  // 🏦 DEFI PROTOCOL IDENTIFICATION
  private identifyDeFiProtocol(heliusData: any): string | undefined {
    const logs = heliusData?.meta?.logMessages?.join(' ').toLowerCase() || '';
    
    if (logs.includes('raydium')) return 'Raydium';
    if (logs.includes('orca')) return 'Orca';
    if (logs.includes('serum')) return 'Serum';
    if (logs.includes('jupiter')) return 'Jupiter';
    if (logs.includes('marinade')) return 'Marinade';
    if (logs.includes('solend')) return 'Solend';
    
    return undefined;
  }

  // 📝 TRANSACTION DESCRIPTION GENERATOR
  private generateTransactionDescription(solscanData: any): string {
    if (solscanData?.parsedInstruction) {
      return `${solscanData.parsedInstruction.type || 'Transaction'} involving ${solscanData.inputAccount?.length || 0} accounts`;
    }
    return 'Blockchain transaction';
  }

  // 💰 DEFI METRICS FROM MULTIPLE SOURCES
  async getDeFiMetrics(): Promise<DeFiMetrics> {
    try {
      // Fetch real-time SOL price from CoinGecko
      const solPriceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true');
      const solPriceData = await solPriceResponse.json();
      
      // Fetch DeFi TVL data from DeFiLlama
      const tvlResponse = await fetch('https://api.llama.fi/protocols');
      const tvlData = await tvlResponse.json();
      
      // Filter Solana protocols
      const solanaProtocols = tvlData.filter((protocol: any) => 
        protocol.chains?.includes('Solana') || protocol.name?.toLowerCase().includes('solana')
      );
      
      // Calculate total Solana DeFi TVL
      const totalSolanaTVL = solanaProtocols.reduce((sum: number, protocol: any) => 
        sum + (protocol.tvl || 0), 0
      );
      
      // Get top 5 Solana protocols by TVL
      const topProtocols = solanaProtocols
        .sort((a: any, b: any) => (b.tvl || 0) - (a.tvl || 0))
        .slice(0, 5)
        .map((protocol: any) => ({
          name: protocol.name || 'Unknown',
          tvl: protocol.tvl || 0,
          volume: (protocol.tvl || 0) * 0.15 // Estimate volume as 15% of TVL
        }));

      const currentSOLPrice = solPriceData.solana?.usd || 85.50;
      const dailyVolume = solPriceData.solana?.usd_24h_vol || 2000000000;
      
      return {
        totalValueLocked: totalSolanaTVL > 0 ? totalSolanaTVL : 8500000000, // Use real TVL or fallback
        volume24h: dailyVolume,
        solPrice: currentSOLPrice,
        topProtocols: topProtocols.length > 0 ? topProtocols : [
          { name: 'Raydium', tvl: 1200000000, volume: 450000000 },
          { name: 'Orca', tvl: 850000000, volume: 320000000 },
          { name: 'Marinade', tvl: 1100000000, volume: 150000000 },
          { name: 'Jupiter', tvl: 200000000, volume: 800000000 },
          { name: 'Solend', tvl: 650000000, volume: 45000000 }
        ],
        yield: {
          staking: 6.8, // Current Solana staking APY
          lending: 4.2  // Average lending APY
        }
      };
    } catch (error) {
      console.error('Error fetching real DeFi metrics:', error);
      
      // Fallback to estimated current values
      return {
        totalValueLocked: 8500000000, // $8.5B current estimated Solana TVL
        volume24h: 2000000000, // $2B daily volume
        solPrice: 85.50, // Fallback SOL price
        topProtocols: [
          { name: 'Raydium', tvl: 1200000000, volume: 450000000 },
          { name: 'Orca', tvl: 850000000, volume: 320000000 },
          { name: 'Marinade', tvl: 1100000000, volume: 150000000 },
          { name: 'Jupiter', tvl: 200000000, volume: 800000000 },
          { name: 'Solend', tvl: 650000000, volume: 45000000 }
        ],
        yield: { staking: 6.8, lending: 4.2 }
      };
    }
  }

  // 📊 ENHANCED NETWORK METRICS
  async getEnhancedNetworkMetrics(): Promise<any> {
    try {
      const [quickNodeMetrics, heliusStats, solscanStats] = await Promise.all([
        this.getQuickNodeNetworkMetrics(),
        this.getHeliusNetworkStats(),
        this.getSolscanNetworkStats()
      ]);

      return {
        // Real-time performance from QuickNode
        currentSlot: quickNodeMetrics.slot,
        tps: quickNodeMetrics.tps,
        averageLatency: 400, // Solana's typical block time
        
        // Enhanced stats from Helius
        validators: heliusStats?.validators || 1800,
        stakingAPY: heliusStats?.stakingAPY || 6.8,
        
        // Market data from Solscan
        solPrice: solscanStats?.solPrice || 85.50,
        marketCap: solscanStats?.marketCap || 45000000000,
        
        // Computed metrics
        totalThroughput: quickNodeMetrics.tps * 0.5, // Convert to MB/s
        packetsPerSecond: quickNodeMetrics.tps * 15, // Estimate
        errorRate: 0.001, // Very low for Solana
        activeConnections: quickNodeMetrics.slot % 10000 // Simulated
      };
    } catch (error) {
      console.error('Error fetching enhanced metrics:', error);
      return this.getFallbackMetrics();
    }
  }

  // Supporting methods for data fetching
  private async getQuickNodeNetworkMetrics(): Promise<any> {
    const [slot, performanceSamples] = await Promise.all([
      this.quickNodeConnection.getSlot(),
      this.quickNodeConnection.getRecentPerformanceSamples(1)
    ]);

    return {
      slot,
      tps: performanceSamples[0]?.numTransactions || 2000
    };
  }

  private async getHeliusNetworkStats(): Promise<any> {
    // Placeholder for Helius-specific network stats
    return {
      validators: 1800,
      stakingAPY: 6.8,
      volume24h: 2350000000
    };
  }

  private async getSolscanNetworkStats(): Promise<any> {
    try {
      const response = await fetch('https://api.solscan.io/market', {
        headers: {
          'Authorization': `Bearer ${this.solscanJWT}`
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Solscan market data error:', error);
    }
    return null;
  }

  private async getSolscanDeFiData(): Promise<any> {
    // Placeholder for DeFi-specific data from Solscan
    return { tvl: 15840000000 };
  }

  private calculateTransactionAmount(meta: any): number | undefined {
    if (!meta?.preBalances || !meta?.postBalances) return undefined;
    
    let maxChange = 0;
    for (let i = 0; i < meta.preBalances.length; i++) {
      const change = Math.abs(meta.postBalances[i] - meta.preBalances[i]);
      if (change > maxChange) {
        maxChange = change;
      }
    }
    
    return maxChange > 0 ? maxChange / 1e9 : undefined;
  }

  private getFallbackMetrics(): any {
    return {
      currentSlot: 280000000,
      tps: 2000,
      averageLatency: 400,
      validators: 1800,
      stakingAPY: 6.8,
      solPrice: 85.50,
      marketCap: 45000000000,
      totalThroughput: 1000,
      packetsPerSecond: 30000,
      errorRate: 0.001,
      activeConnections: 1500
    };
  }
} 