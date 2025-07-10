export interface Agent {
  id: string;
  name: string;
  type?: 'processor' | 'coordinator' | 'auditor' | 'analyzer';
  status: 'active' | 'idle' | 'processing' | 'error' | 'deploying';
  task?: string;
  lastActive?: string;
  environment?: 'development' | 'staging' | 'production';
  resources?: {
    cpu: number;
    memory: number;
    storage: number;
  };
  tasks?: number;
  performance: number;
  securityLevel?: 'high' | 'medium' | 'low';
  cpuUsage?: number;
  memoryUsage?: number;
  networkActivity?: number;
  uptime?: number;
  tasksCompleted?: number;
  lastActivity?: Date;
  location?: { x: number; y: number; z: number };
  connectionQuality?: number;
  version?: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  type: 'verification' | 'access' | 'threat' | 'audit' | 'deployment' | 'error';
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  agentId?: string;
  details?: any;
}

export interface Transaction {
  hash: string;
  type: string;
  status: 'verified' | 'completed' | 'processing' | 'failed';
  timestamp: Date;
  amount?: number;
  gasUsed?: number;
  blockNumber?: number;
}

export interface NetworkMetrics {
  totalThroughput: number;
  averageLatency: number;
  packetsPerSecond: number;
  errorRate: number;
  activeConnections: number;
}

export interface SystemAlert {
  id: string;
  type: 'security' | 'performance' | 'system' | 'agent';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
}

export interface TaskQueue {
  id: string;
  title: string;
  assignedAgent: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  estimatedCompletion: Date;
} 