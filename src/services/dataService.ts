import { Agent, SecurityLog, Transaction, NetworkMetrics, SystemAlert, TaskQueue } from '../types/dashboard';
import { SolanaApiService, EnhancedSolanaTransaction } from './solanaApiService';

// Simulate realistic data generation
export class DataService {
  private static instance: DataService;
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Map<string, (data: any) => void> = new Map();
  private solanaApiService: SolanaApiService;
  private useLiveData: boolean = true; // Toggle for live vs mock data
  private agents: Agent[] = []; // Persistent agents array

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  constructor() {
    this.solanaApiService = new SolanaApiService();
    // Load agents from localStorage on initialization
    this.loadAgentsFromStorage();
  }

  // Load agents from localStorage
  private loadAgentsFromStorage(): void {
    try {
      const storedAgents = localStorage.getItem('visen_agents');
      if (storedAgents) {
        this.agents = JSON.parse(storedAgents);
        console.log('🔄 Loaded', this.agents.length, 'agents from localStorage');
      }
    } catch (error) {
      console.error('Error loading agents from localStorage:', error);
      this.agents = [];
    }
  }

  // Save agents to localStorage
  private saveAgentsToStorage(): void {
    try {
      localStorage.setItem('visen_agents', JSON.stringify(this.agents));
      console.log('💾 Saved', this.agents.length, 'agents to localStorage');
    } catch (error) {
      console.error('Error saving agents to localStorage:', error);
    }
  }

  // Toggle between live Solana data and mock data
  setLiveDataMode(enabled: boolean): void {
    this.useLiveData = enabled;
  }

  // 🚀 ENHANCED TRANSACTION GENERATION WITH MULTI-API DATA
  async generateTransactions(): Promise<Transaction[]> {
    if (this.useLiveData) {
      try {
        // Get enhanced transactions from our multi-API service
        const enhancedTransactions = await this.solanaApiService.getEnhancedTransactions(8);
        
        if (enhancedTransactions.length > 0) {
          // Convert enhanced transactions to our Transaction interface
          const solanaTransactions: Transaction[] = enhancedTransactions.map(tx => ({
            hash: tx.hash,
            type: tx.type,
            status: tx.status,
            timestamp: tx.timestamp,
            amount: tx.amount,
            gasUsed: tx.gasUsed,
            blockNumber: tx.blockNumber
          }));

          // Mix with AI agent transactions
          const aiTransactions = this.generateMockAITransactions(2);
          
          return [...solanaTransactions, ...aiTransactions]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);
        }
      } catch (error) {
        console.error('Falling back to mock data due to Solana API error:', error);
      }
    }
    
    // Fallback to mock data
    return this.generateMockTransactions();
  }

  // 📊 ENHANCED NETWORK METRICS WITH MULTI-API DATA
  async generateNetworkMetrics(): Promise<NetworkMetrics> {
    if (this.useLiveData) {
      try {
        const enhancedMetrics = await this.solanaApiService.getEnhancedNetworkMetrics();
        
        if (enhancedMetrics) {
          return {
            totalThroughput: enhancedMetrics.totalThroughput || 750,
            averageLatency: enhancedMetrics.averageLatency || 400,
            packetsPerSecond: enhancedMetrics.packetsPerSecond || 65000,
            errorRate: enhancedMetrics.errorRate || 0.001,
            activeConnections: enhancedMetrics.activeConnections || 1500
          };
        }
      } catch (error) {
        console.error('Using mock network metrics due to Solana API error:', error);
      }
    }

    // Fallback to mock data
    return this.generateMockNetworkMetrics();
  }

  // 💎 GET DEFI METRICS (NEW FEATURE)
  async getDeFiMetrics(): Promise<any> {
    if (this.useLiveData) {
      try {
        return await this.solanaApiService.getDeFiMetrics();
      } catch (error) {
        console.error('Error fetching DeFi metrics:', error);
      }
    }
    
    // Fallback DeFi data
    return {
      totalValueLocked: 8500000000,
      volume24h: 2000000000,
      solPrice: 85.50,
      topProtocols: [
        { name: 'Raydium', tvl: 1200000000, volume: 450000000 },
        { name: 'Orca', tvl: 850000000, volume: 320000000 },
        { name: 'Jupiter', tvl: 200000000, volume: 800000000 }
      ],
      yield: { staking: 6.8, lending: 4.2 }
    };
  }

  // Generate Solana-style transaction hash
  private generateSolanaHash(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let hash = '';
    for (let i = 0; i < 88; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }

  // Generate traditional hex transaction hash
  private generateTxHash(): string {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }

  // Generate mock AI agent transactions
  private generateMockAITransactions(count: number): Transaction[] {
    const agentTypes = ['Agent Verification', 'Task Coordination', 'Security Audit', 'AI Model Update'];
    const transactions: Transaction[] = [];
    
    for (let i = 0; i < count; i++) {
      transactions.push({
        hash: this.generateSolanaHash(),
        type: agentTypes[Math.floor(Math.random() * agentTypes.length)],
        status: Math.random() > 0.1 ? 'verified' : 'processing',
        timestamp: new Date(Date.now() - Math.random() * 1800000), // Last 30 minutes
        amount: Math.random() > 0.7 ? Math.random() * 50 : undefined,
        gasUsed: Math.floor(5000 + Math.random() * 15000), // Lower gas for agent operations
        blockNumber: Math.floor(280000000 + Math.random() * 1000000) // Recent Solana slot numbers
      });
    }
    
    return transactions;
  }

  // Original mock transaction generation (renamed for clarity)
  private generateMockTransactions(): Transaction[] {
    const types = ['Agent Verification', 'Task Coordination', 'Security Audit', 'Data Processing', 'Smart Contract'];
    const transactions: Transaction[] = [];
    
    for (let i = 0; i < 10; i++) {
      transactions.push({
        hash: this.generateTxHash(),
        type: types[Math.floor(Math.random() * types.length)],
        status: Math.random() > 0.1 ? (Math.random() > 0.2 ? 'verified' : 'completed') : 'processing',
        timestamp: new Date(Date.now() - Math.random() * 3600000),
        amount: Math.random() > 0.5 ? Math.random() * 1000 : undefined,
        gasUsed: Math.floor(21000 + Math.random() * 200000),
        blockNumber: 18500000 + Math.floor(Math.random() * 100000)
      });
    }
    
    return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Original mock network metrics (renamed for clarity)
  private generateMockNetworkMetrics(): NetworkMetrics {
    return {
      totalThroughput: 500 + Math.random() * 1000, // MB/s
      averageLatency: 10 + Math.random() * 50, // ms
      packetsPerSecond: 10000 + Math.random() * 50000,
      errorRate: Math.random() * 0.01, // 0-1%
      activeConnections: Math.floor(100 + Math.random() * 500)
    };
  }

  // Get current agents (persistent)
  getAgents(): Agent[] {
    return this.agents;
  }

  // Add a new agent
  addAgent(agent: Agent): void {
    this.agents.push(agent);
    this.saveAgentsToStorage();
  }

  // Update an existing agent
  updateAgent(agentId: string, updates: Partial<Agent>): void {
    const index = this.agents.findIndex(a => a.id === agentId);
    if (index !== -1) {
      this.agents[index] = { ...this.agents[index], ...updates };
      this.saveAgentsToStorage();
    }
  }

  // Update agent task description
  updateAgentTask(agentId: string, taskDescription: string): void {
    this.updateAgent(agentId, { task: taskDescription });
  }

  // Remove an agent
  removeAgent(agentId: string): void {
    const beforeCount = this.agents.length;
    this.agents = this.agents.filter(a => a.id !== agentId);
    if (this.agents.length < beforeCount) {
      this.saveAgentsToStorage();
      console.log('🗑️ Agent removed and saved to localStorage');
    }
  }

  // Generate realistic mock agent data (for demo purposes only)
  generateMockAgents(): Agent[] {
    const agentNames = [
      'DataProcessor-Alpha', 'MarketMaker-Beta', 'Coordinator-Gamma', 
      'Auditor-Delta', 'Analyzer-Epsilon', 'Guardian-Zeta'
    ];
    
    return agentNames.map((name, index) => ({
      id: `agent-${index + 1}`,
      name,
      status: this.getRandomStatus(),
      task: this.getRandomTask(),
      performance: 85 + Math.random() * 15,
      securityLevel: this.getRandomSecurityLevel(),
      cpuUsage: Math.random() * 100,
      memoryUsage: 30 + Math.random() * 60,
      networkActivity: Math.random() * 1000,
      uptime: Math.random() * 8760, // hours in a year
      tasksCompleted: Math.floor(Math.random() * 10000),
      lastActivity: new Date(Date.now() - Math.random() * 3600000),
      location: {
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        z: Math.random() * 200 - 100
      },
      connectionQuality: 70 + Math.random() * 30,
      version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`
    }));
  }

  private getRandomStatus(): Agent['status'] {
    const statuses: Agent['status'][] = ['active', 'idle', 'processing', 'error', 'deploying'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private getRandomTask(): string {
    const tasks = [
      'Processing financial transactions',
      'Optimizing liquidity pools',
      'Monitoring network security',
      'Analyzing market patterns',
      'Executing smart contracts',
      'Validating blockchain data',
      'Coordinating multi-sig operations',
      'Running security audits'
    ];
    return tasks[Math.floor(Math.random() * tasks.length)];
  }

  private getRandomSecurityLevel(): Agent['securityLevel'] {
    const levels: Agent['securityLevel'][] = ['high', 'medium', 'low'];
    const weights = [0.6, 0.3, 0.1]; // 60% high, 30% medium, 10% low
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random <= sum) return levels[i];
    }
    return 'high';
  }

  // Generate security logs
  generateSecurityLogs(): SecurityLog[] {
    const logTypes = [
      { type: 'verification', messages: ['Agent verification completed successfully', 'Multi-signature validation passed'] },
      { type: 'access', messages: ['Encrypted communication established', 'Authentication token refreshed'] },
      { type: 'audit', messages: ['Security audit completed', 'Chain-of-thought logging initiated'] },
      { type: 'threat', messages: ['Anomalous behavior detected and blocked', 'Potential intrusion attempt thwarted'] }
    ] as const;

    const logs: SecurityLog[] = [];
    
    for (let i = 0; i < 20; i++) {
      const logType = logTypes[Math.floor(Math.random() * logTypes.length)];
      const message = logType.messages[Math.floor(Math.random() * logType.messages.length)];
      
      logs.push({
        id: `log-${Date.now()}-${i}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        type: logType.type,
        message,
        severity: Math.random() > 0.1 ? 'info' : (Math.random() > 0.5 ? 'warning' : 'critical'),
        agentId: Math.random() > 0.3 ? `agent-${Math.floor(Math.random() * 6) + 1}` : undefined
      });
    }
    
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Generate system alerts
  generateSystemAlerts(): SystemAlert[] {
    const alertTemplates = [
      { type: 'security', title: 'Security Scan Complete', message: 'All systems passed security validation' },
      { type: 'performance', title: 'High CPU Usage', message: 'Agent DataProcessor-Alpha showing elevated CPU usage' },
      { type: 'system', title: 'System Update Available', message: 'New agent software version available for deployment' },
      { type: 'agent', title: 'Agent Connection Lost', message: 'Temporary connection loss to Agent Coordinator-Gamma' }
    ] as const;

    return alertTemplates.map((template, index) => ({
      id: `alert-${index}`,
      type: template.type,
      title: template.title,
      message: template.message,
      severity: Math.random() > 0.7 ? 'high' : (Math.random() > 0.5 ? 'medium' : 'low'),
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      resolved: Math.random() > 0.3
    })) as SystemAlert[];
  }

  // Start real-time updates
  startRealTimeUpdates(): void {
    if (this.updateInterval) return;
    
    this.updateInterval = setInterval(() => {
      this.subscribers.forEach((callback, key) => {
        switch (key) {
          case 'agents':
            callback(this.getAgents());
            break;
          case 'transactions':
            this.generateTransactions().then(callback);
            break;
          case 'security':
            callback(this.generateSecurityLogs());
            break;
          case 'network':
            this.generateNetworkMetrics().then(callback);
            break;
          case 'alerts':
            callback(this.generateSystemAlerts());
            break;
        }
      });
    }, 10000); // Update every 10 seconds instead of 3 seconds to reduce load
  }

  // Subscribe to real-time updates
  subscribe(type: string, callback: (data: any) => void): void {
    this.subscribers.set(type, callback);
  }

  // Stop real-time updates
  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Generic data fetcher with type safety
  async fetchData<T>(dataType: string): Promise<T> {
    switch (dataType) {
      case 'agents':
        return this.getAgents() as unknown as T;
      case 'transactions':
        return await this.generateTransactions() as unknown as T;
      case 'security':
        return this.generateSecurityLogs() as unknown as T;
      case 'network':
        return await this.generateNetworkMetrics() as unknown as T;
      case 'alerts':
        return this.generateSystemAlerts() as unknown as T;
      case 'defi':
        return await this.getDeFiMetrics() as unknown as T;
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }
} 