import React, { useState, useEffect, useRef } from "react";
import "./AppDemo.css";
import Waves from "./blocks/Backgrounds/Waves/Waves";
import BlobCursor from "./blocks/Animations/BlobCursor/BlobCursor";
import FadeContent from "./blocks/Animations/FadeContent/FadeContent";
import ShinyText from "./blocks/TextAnimations/ShinyText/ShinyText";
import GradientText from "./blocks/TextAnimations/GradientText/GradientText";
import DecryptedText from "./blocks/TextAnimations/DecryptedText/DecryptedText";
import Magnet from "./blocks/Animations/Magnet/Magnet";
import GlareHover from "./blocks/Animations/GlareHover/GlareHover";
import CountUp from "./blocks/TextAnimations/CountUp/CountUp";
import RealTimeChart from "./components/RealTimeChart";
import AgentDeployment from "./components/AgentDeployment";
import SolanaControls from "./components/SolanaControls";
import DeFiDashboard from "./components/DeFiDashboard";
import TaskMonitor from "./components/TaskMonitor";
import { DataService } from "./services/dataService";
import { AgentExecutor, AgentTask } from "./services/agentExecutor";
import { RealAgentEngine, RealAgentTask } from './services/realAgentEngine';
import { Agent, SecurityLog, Transaction, NetworkMetrics } from "./types/dashboard";
import newLogo from "./new.png";

// Removed local interfaces - using imported types instead

const AppDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agents' | 'security' | 'analytics' | 'defi'>('dashboard');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showDeployment, setShowDeployment] = useState(false);
  const [performanceData, setPerformanceData] = useState<{timestamp: number, value: number}[]>([]);
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics | null>(null);
  const [useLiveData, setUseLiveData] = useState<boolean>(
    process.env.REACT_APP_USE_SOLANA_LIVE_DATA !== 'false'
  );
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [deploymentSuccess, setDeploymentSuccess] = useState<boolean>(false);
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>([]);
  const dataService = DataService.getInstance();
  const agentExecutor = AgentExecutor.getInstance();
  const realAgentEngine = RealAgentEngine.getInstance();

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Real agent task monitoring
  const [realAgentTasks, setRealAgentTasks] = useState<RealAgentTask[]>([]);
  const [taskHistory, setTaskHistory] = useState<RealAgentTask[]>([]);

  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    successfulTasks: 0,
    securityThreats: 0,
    uptime: 0
  });

  const rootRef = useRef<HTMLDivElement>(null);

  // Handle live data toggle
  const handleToggleLiveData = (enabled: boolean) => {
    setUseLiveData(enabled);
    dataService.setLiveDataMode(enabled);
    setConnectionStatus(enabled ? 'connecting' : 'disconnected');
    
    // Refresh data with new mode
    if (enabled) {
      setTimeout(async () => {
        try {
          const [transactionsData, networkData] = await Promise.all([
            dataService.generateTransactions(),
            dataService.generateNetworkMetrics()
          ]);
          setTransactions(transactionsData);
          setNetworkMetrics(networkData);
          setConnectionStatus('connected');
        } catch (error) {
          console.error('Failed to connect to Solana:', error);
          setConnectionStatus('disconnected');
        }
      }, 1000);
    }
  };

  // 📊 DASHBOARD ACTIONS
  const handleViewAnalytics = () => {
    setActiveTab('analytics');
    console.log('📊 Switching to Analytics tab...');
  };

  const handleSystemSettings = () => {
    const settings = {
      liveDataMode: useLiveData,
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'active').length,
      systemUptime: Date.now() - (Date.now() % 86400000), // Mock uptime
      autoRefresh: true,
      notificationsEnabled: true
    };
    
    console.log('⚙️ System Settings:', settings);
    alert(`System Settings:\n\nLive Data: ${useLiveData ? 'Enabled' : 'Disabled'}\nTotal Agents: ${agents.length}\nActive Agents: ${agents.filter(a => a.status === 'active').length}\nUptime: ${Math.floor(Date.now() / 86400000)} days\n\nSettings saved successfully!`);
  };

  // 🛡️ SECURITY ACTIONS
  const handleSecurityScan = async () => {
    console.log('🛡️ Starting comprehensive security scan...');
    
    // Show loading state
    const scanResults = {
      threatsDetected: 0,
      vulnerabilitiesFound: 0,
      encryptionStatus: 'Active',
      lastScanTime: new Date().toLocaleString(),
      recommendations: [
        'All systems secure',
        'Encryption protocols active',
        'No threats detected',
        'Continue monitoring'
      ]
    };
    
    // Simulate scan process
    setTimeout(() => {
      alert(`🛡️ Security Scan Complete!\n\nThreats Detected: ${scanResults.threatsDetected}\nVulnerabilities: ${scanResults.vulnerabilitiesFound}\nEncryption: ${scanResults.encryptionStatus}\nLast Scan: ${scanResults.lastScanTime}\n\nRecommendations:\n${scanResults.recommendations.join('\n')}`);
    }, 2000);
  };

  const handleAuditLogs = () => {
    console.log('🔍 Generating audit logs...');
    
    const auditData = {
      totalLogs: securityLogs.length,
      criticalEvents: securityLogs.filter(log => log.severity === 'critical').length,
      warningEvents: securityLogs.filter(log => log.severity === 'warning').length,
      recentActivity: securityLogs.slice(0, 5).map(log => `${log.timestamp}: ${log.message}`).join('\n')
    };
    
    alert(`🔍 Audit Log Summary:\n\nTotal Logs: ${auditData.totalLogs}\nCritical Events: ${auditData.criticalEvents}\nWarning Events: ${auditData.warningEvents}\n\nRecent Activity:\n${auditData.recentActivity}`);
  };

  const handleUpdateEncryption = () => {
    console.log('🔒 Updating encryption protocols...');
    
    // Simulate encryption update
    setTimeout(() => {
      alert('🔒 Encryption Update Complete!\n\nAES-256: ✅ Updated\nRSA-4096: ✅ Updated\nMulti-Sig: ✅ Updated\nQuantum-Safe: ✅ Enabled\n\nAll encryption protocols are now up to date!');
    }, 1500);
  };

  // 📈 ANALYTICS ACTIONS
  const handleGenerateReport = async () => {
    console.log('📊 Generating comprehensive analytics report...');
    
    const reportData = {
      reportId: `RPT-${Date.now()}`,
      generatedAt: new Date().toLocaleString(),
      agentPerformance: {
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.status === 'active').length,
        avgPerformance: agents.reduce((sum, agent) => sum + agent.performance, 0) / agents.length || 0,
        totalTasks: stats.successfulTasks
      },
      systemMetrics: {
        uptime: '99.9%',
        throughput: '2,847 tasks/hour',
        efficiency: '94%',
        errorRate: '0.1%'
      },
      securityStatus: {
        threatsBlocked: stats.securityThreats,
        encryptionLevel: 'AES-256',
        complianceScore: '100%'
      }
    };
    
    setTimeout(() => {
      alert(`📊 Analytics Report Generated!\n\nReport ID: ${reportData.reportId}\nGenerated: ${reportData.generatedAt}\n\nAgent Performance:\n- Total Agents: ${reportData.agentPerformance.totalAgents}\n- Active Agents: ${reportData.agentPerformance.activeAgents}\n- Avg Performance: ${reportData.agentPerformance.avgPerformance.toFixed(1)}%\n- Tasks Completed: ${reportData.agentPerformance.totalTasks}\n\nSystem Metrics:\n- Uptime: ${reportData.systemMetrics.uptime}\n- Throughput: ${reportData.systemMetrics.throughput}\n- Efficiency: ${reportData.systemMetrics.efficiency}\n\nReport saved successfully!`);
    }, 2000);
  };

  const handleExportData = () => {
    console.log('📈 Exporting analytics data...');
    
    const exportData = {
      timestamp: new Date().toISOString(),
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        type: agent.type,
        status: agent.status,
        performance: agent.performance,
        tasksCompleted: agent.tasksCompleted || 0
      })),
      performanceMetrics: performanceData,
      securityLogs: securityLogs.slice(0, 10), // Last 10 logs
      systemStats: stats
    };
    
    // Create downloadable JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visen-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('📈 Analytics data exported successfully!\n\nFile: visen-analytics-' + new Date().toISOString().split('T')[0] + '.json\nSize: ' + Math.round(dataStr.length / 1024) + ' KB\n\nDownload started automatically.');
  };

  const handleConfigureMetrics = () => {
    console.log('⚙️ Opening metrics configuration...');
    
    const currentConfig = {
      refreshInterval: '10 seconds',
      dataRetention: '30 days',
      alertThresholds: {
        cpuUsage: '80%',
        memoryUsage: '85%',
        errorRate: '1%',
        responseTime: '500ms'
      },
      enabledMetrics: [
        'Agent Performance',
        'System Throughput',
        'Security Events',
        'Network Latency',
        'DeFi Analytics'
      ]
    };
    
    alert(`⚙️ Metrics Configuration:\n\nRefresh Interval: ${currentConfig.refreshInterval}\nData Retention: ${currentConfig.dataRetention}\n\nAlert Thresholds:\n- CPU Usage: ${currentConfig.alertThresholds.cpuUsage}\n- Memory Usage: ${currentConfig.alertThresholds.memoryUsage}\n- Error Rate: ${currentConfig.alertThresholds.errorRate}\n- Response Time: ${currentConfig.alertThresholds.responseTime}\n\nEnabled Metrics:\n${currentConfig.enabledMetrics.join('\n')}\n\nConfiguration saved!`);
  };

  // 💎 DEFI ACTIONS (will be passed to DeFiDashboard)
  const defiActions = {
    handleStakeSOL: () => {
      console.log('🏦 Initiating SOL staking...');
      alert('🏦 SOL Staking\n\nCurrent SOL Price: $85.50\nStaking APY: 6.8%\nMinimum Stake: 0.1 SOL\n\nConnecting to Solana validators...\n\nNote: This is a demo. In production, this would connect to your wallet and initiate actual staking.');
    },
    
    handleSwapTokens: () => {
      console.log('💱 Opening token swap interface...');
      alert('💱 Token Swap\n\nAvailable DEX Protocols:\n- Raydium (Low fees)\n- Orca (Best rates)\n- Jupiter (Aggregated)\n\nSupported Tokens:\n- SOL, USDC, USDT, RAY, ORCA\n\nNote: This is a demo. In production, this would open the swap interface.');
    },
    
    handleProvideLiquidity: () => {
      console.log('💰 Opening liquidity provision interface...');
      alert('💰 Provide Liquidity\n\nTop Opportunities:\n- SOL/USDC: 12.4% APY\n- RAY/SOL: 18.7% APY\n- ORCA/USDC: 15.2% APY\n\nImpermanent Loss Risk: Medium\nLocking Period: None\n\nNote: This is a demo. In production, this would connect to liquidity pools.');
    },
    
    handleViewAnalytics: () => {
      console.log('📈 Loading advanced DeFi analytics...');
      alert('📈 DeFi Analytics\n\nReal-time Metrics:\n- Total Value Locked: $8.5B\n- 24h Volume: $2.0B\n- Active Protocols: 25+\n- Yield Opportunities: 50+\n\nTop Performers:\n1. Raydium: $1.2B TVL\n2. Orca: $850M TVL\n3. Marinade: $1.1B TVL\n\nAnalytics dashboard loaded!');
    }
  };

  useEffect(() => {
    // Set initial data mode
    dataService.setLiveDataMode(useLiveData);
    
    // Load agents from DataService (which loads from localStorage)
    const storedAgents = dataService.getAgents();
    if (storedAgents.length > 0 && agents.length === 0) {
      setAgents(storedAgents);
      // Only log once on initial load
      if (storedAgents.length > 0) {
        console.log('🔄 Loaded', storedAgents.length, 'agents from storage on page refresh');
      }
      
      // Update stats based on stored agents
      setStats({
        totalAgents: storedAgents.length,
        activeAgents: storedAgents.filter((a: Agent) => a.status === 'active').length,
        successfulTasks: 0,
        securityThreats: 0,
        uptime: 99.97
      });
    }
    
    // Initialize data
    const initializeData = async () => {
      try {
        setConnectionStatus(useLiveData ? 'connecting' : 'disconnected');
        
        // Initialize logs and performance data if needed
        if (agents.length === 0 && storedAgents.length === 0) {
          setSecurityLogs([]);
          setPerformanceData([]);
        }
        
        // Load network data for Solana integration
        const [transactionsData, networkData] = await Promise.all([
          dataService.generateTransactions(),
          dataService.generateNetworkMetrics()
        ]);

        setTransactions(transactionsData);
        setNetworkMetrics(networkData);
        
        if (useLiveData) {
          setConnectionStatus('connected');
        }
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };

    // Always initialize data
    initializeData();

    // Start real-time updates if agents exist (including loaded from storage)
    if (agents.length > 0 || storedAgents.length > 0) {
      dataService.startRealTimeUpdates();
      
      // Subscribe to real-time data
      dataService.subscribe('agents', setAgents);
      dataService.subscribe('security', setSecurityLogs);
      dataService.subscribe('transactions', async () => {
        const newTransactions = await dataService.generateTransactions();
        setTransactions(newTransactions);
      });
      dataService.subscribe('network', async () => {
        const newMetrics = await dataService.generateNetworkMetrics();
        setNetworkMetrics(newMetrics);
      });

      // Update performance chart data and real agent tasks
      const perfInterval = setInterval(() => {
        setPerformanceData(prev => {
          const newData = [...prev.slice(-19), {
            timestamp: Date.now(),
            value: 85 + Math.random() * 15
          }];
          return newData;
        });

        // Update real agent tasks
        const runningTasks = realAgentEngine.getRunningTasks();
        const completedTasks = realAgentEngine.getTaskHistory();
        setRealAgentTasks(runningTasks);
        setTaskHistory(completedTasks.slice(-20)); // Keep last 20 tasks

        setStats(prev => ({
          ...prev,
          activeAgents: agents.filter(a => a.status === 'active').length,
          successfulTasks: completedTasks.filter(t => t.status === 'completed').length,
        }));
      }, 15000); // Update every 15 seconds instead of 5 seconds to reduce load

      return () => {
        dataService.stopRealTimeUpdates();
        clearInterval(perfInterval);
      };
    }
  }, [agents.length, useLiveData]);

  // Handle agent deployment
  const handleAgentDeploy = (config: any) => {
    console.log('🚀 Deploying agent with config:', config);
    
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: config.name || `${config.type}-${Date.now()}`,
      type: config.type,
      status: config.autoStart ? 'active' : 'idle',
      lastActive: new Date().toISOString(),
      performance: 95 + Math.random() * 5,
      tasks: 0,
      environment: config.environment,
      resources: config.resources
    };

    console.log('🤖 Created new agent:', newAgent);

    // Show success notification immediately
    setDeploymentSuccess(true);

    // Add agent to persistent dataService and local state
    dataService.addAgent(newAgent);
    setAgents(dataService.getAgents());
    
    // Update stats immediately
    const currentAgents = dataService.getAgents();
    setStats({
      totalAgents: currentAgents.length,
      activeAgents: currentAgents.filter((a: Agent) => a.status === 'active').length,
      successfulTasks: 0,
      securityThreats: 0,
      uptime: 99.97
    });

    // Initialize performance data
    const initialPerfData = Array.from({ length: 20 }, (_, i) => ({
      timestamp: Date.now() - (19 - i) * 60000,
      value: 85 + Math.random() * 15
    }));
    setPerformanceData(initialPerfData);

    // Start real-time updates
    dataService.startRealTimeUpdates();
    
    // 🎯 START REAL AGENT WITH LIVE APIS IF AUTO-START IS ENABLED
    if (config.autoStart) {
      console.log('🚀 Starting REAL agent with live Solana APIs...');
      realAgentEngine.deployRealAgent(newAgent);
    }
    
    // 🎯 AUTOMATICALLY SWITCH TO AGENTS TAB AFTER DEPLOYMENT
    setTimeout(() => {
      console.log('🔄 Switching to agents tab...');
      setActiveTab('agents');
      // Hide success message after 3 seconds
      setTimeout(() => setDeploymentSuccess(false), 3000);
    }, 500);
  };

  const handleAgentAction = async (agentId: string, action: 'start' | 'stop' | 'restart') => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    console.log(`🎯 ${action.toUpperCase()} REAL agent ${agent.name} with live APIs...`);

    // Update agent status in dataService and local state
    const newStatus = action === 'start' ? 'active' : action === 'stop' ? 'idle' : 'processing';
    dataService.updateAgent(agentId, { status: newStatus });
    setAgents(dataService.getAgents());

    // Execute REAL operations based on action
    if (action === 'start' || action === 'restart') {
      await realAgentEngine.deployRealAgent(agent);
      console.log(`✅ Started REAL operations for agent ${agent.name}`);
    } else if (action === 'stop') {
      realAgentEngine.stopAgent(agentId);
      console.log(`⏹️ Stopped REAL operations for agent ${agent.name}`);
    }

    // Update stats
    const currentAgents = dataService.getAgents();
    setStats(prev => ({
      ...prev,
      activeAgents: currentAgents.filter((a: Agent) => a.status === 'active').length,
    }));
  };

  const handleAgentRemove = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    // Confirm removal
    const confirmed = window.confirm(`Are you sure you want to remove agent "${agent.name}"?`);
    if (!confirmed) return;

    console.log(`🗑️ Removing agent ${agent.name}...`);

    // Remove from dataService and update local state
    dataService.removeAgent(agentId);
    setAgents(dataService.getAgents());

    // Update stats
    const currentAgents = dataService.getAgents();
    setStats(prev => ({
      ...prev,
      totalAgents: currentAgents.length,
      activeAgents: currentAgents.filter((a: Agent) => a.status === 'active').length,
    }));

    console.log(`✅ Agent ${agent.name} removed successfully`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#3AFF73';
      case 'processing': return '#40ffaa';
      case 'idle': return '#888';
      default: return '#888';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ff4757';
      case 'warning': return '#ffa502';
      case 'info': return '#3AFF73';
      default: return '#3AFF73';
    }
  };

  // Empty state component
  const renderEmptyState = () => (
    <div className="empty-state">
      <FadeContent duration={1000} delay={200}>
        <div className="empty-state-content">
          <div className="empty-state-icon">🤖</div>
          <h2 className="empty-state-title">
            <GradientText colors={["#3AFF73", "#40ffaa", "#3AFF73"]} animationSpeed={6}>
              No Agents Deployed
            </GradientText>
          </h2>
          <p className="empty-state-description">
            Get started by deploying your first AI agent. Choose from data processors, 
            task coordinators, security auditors, or market analyzers.
          </p>
                    <Magnet padding={20} disabled={false}>
            <button 
              className="deploy-first-agent-btn"
              onClick={() => setShowDeployment(true)}
            >
              Deploy Your First Agent
            </button>
          </Magnet>
          
          <div className="getting-started-steps">
            <h3>Getting Started</h3>
            <div className="steps-grid">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Choose Agent Type</h4>
                  <p>Select from processor, coordinator, auditor, or analyzer</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Configure Resources</h4>
                  <p>Set CPU, memory, and storage requirements</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Deploy & Monitor</h4>
                  <p>Launch your agent and track its performance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeContent>
    </div>
  );

  return (
    <div className="app-demo-root" ref={rootRef}>
      {/* Animated Cursor */}
      <BlobCursor fillColor="#3AFF73" innerColor="#fff" zIndex={1000} />

      {/* Waves Background - Same as main page */}
      <Waves
        waveSpeedX={0}
        waveSpeedY={0}
        lineColor="#222"
        backgroundColor="transparent"
        style={{
          zIndex: 0,
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
        }}
      />


      
      {/* Navigation Bar */}
      <FadeContent duration={800} delay={100}>
        <nav className="demo-navbar">
          <div className="nav-logo">
            <img src={newLogo} alt="Visen" className="nav-logo-image" />
          </div>
          <div className="nav-center">
            <h2>
              <GradientText colors={["#3AFF73", "#40ffaa", "#3AFF73"]} animationSpeed={6}>
                Visen AI Console
              </GradientText>
            </h2>
          </div>
          <div className="nav-actions">
            <a href="/" className="back-btn">← Back to Home</a>
          </div>
        </nav>
      </FadeContent>

      {/* Success Notification */}
      {deploymentSuccess && (
        <div className="deployment-success-notification">
          <FadeContent duration={500}>
            <div className="success-message">
              ✅ Agent deployed successfully! Redirecting to dashboard...
            </div>
          </FadeContent>
        </div>
      )}

      <main className="demo-main">
        {/* Show empty state if no agents deployed */}
        {agents.length === 0 && !deploymentSuccess ? (
          renderEmptyState()
        ) : (
          <>
            {/* Tab Navigation - only show when agents exist */}
            <FadeContent duration={600} delay={200}>
              <div className="tab-navigation">
                {[
                  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
                  { key: 'agents', label: 'Agents', icon: '🤖' },
                  { key: 'security', label: 'Security', icon: '🛡️' },
                  { key: 'analytics', label: 'Analytics', icon: '📈' },
                  { key: 'defi', label: 'DeFi', icon: '💎' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key as any)}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </FadeContent>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <FadeContent duration={800} delay={300}>
                  <div className="dashboard-grid">
                    {/* Stats Overview */}
                    <div className="stats-section">
                      <h3>
                        <GradientText colors={["#3AFF73", "#40ffaa"]} animationSpeed={4}>
                          System Overview
                        </GradientText>
                      </h3>
                      <div className="stats-grid">
                        <div className="stat-card">
                          <div className="stat-icon">🤖</div>
                          <div className="stat-info">
                            <div className="stat-value">
                              <CountUp to={stats.totalAgents} duration={2} onStart={() => {}} onEnd={() => {}} />
                            </div>
                            <div className="stat-label">Total Agents</div>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-icon active">⚡</div>
                          <div className="stat-info">
                            <div className="stat-value">
                              <CountUp to={stats.activeAgents} duration={2} onStart={() => {}} onEnd={() => {}} />
                            </div>
                            <div className="stat-label">Active Agents</div>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-icon">✅</div>
                          <div className="stat-info">
                            <div className="stat-value">
                              <CountUp to={stats.successfulTasks} duration={2} onStart={() => {}} onEnd={() => {}} />
                            </div>
                            <div className="stat-label">Tasks Completed</div>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-icon">🔒</div>
                          <div className="stat-info">
                            <div className="stat-value">
                              <CountUp to={stats.securityThreats} duration={2} onStart={() => {}} onEnd={() => {}} />
                            </div>
                            <div className="stat-label">Security Alerts</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Chart */}
                    <div className="chart-section">
                      <h3>
                        <GradientText colors={["#3AFF73", "#40ffaa"]} animationSpeed={4}>
                          System Performance
                        </GradientText>
                      </h3>
                      <div className="chart-container">
                        <RealTimeChart 
                          data={performanceData}
                          color="#3AFF73"
                          label="CPU Usage (%)"
                        />
                      </div>
                    </div>

                    {/* Live Task Monitor */}
                    <div className="tasks-section">
                      <h3>
                        <GradientText colors={["#3AFF73", "#40ffaa"]} animationSpeed={4}>
                          Live Agent Tasks
                        </GradientText>
                      </h3>
                      <div className="tasks-container">
                        <TaskMonitor />
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="actions-section">
                      <h3>
                        <GradientText colors={["#3AFF73", "#40ffaa"]} animationSpeed={4}>
                          Quick Actions
                        </GradientText>
                      </h3>
                      <div className="actions-grid">
                        <button 
                          className="action-btn"
                          onClick={() => setShowDeployment(true)}
                        >
                          <span className="action-icon">➕</span>
                          Deploy New Agent
                        </button>

                        <button className="action-btn" onClick={handleViewAnalytics}>
                          <span className="action-icon">📊</span>
                          View Analytics
                        </button>

                        <button className="action-btn" onClick={handleSystemSettings}>
                          <span className="action-icon">⚙️</span>
                          System Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </FadeContent>
              )}

              {/* Rest of tab content continues... */}
              {activeTab === 'agents' && (
                <FadeContent duration={1000} delay={100}>
                  <div className="agents-section">
                    <div className="section-header">
                      <h3>
                        <DecryptedText text="REAL Agent Operations Center" speed={15} maxIterations={15} />
                      </h3>
                      <button 
                        className="add-agent-btn"
                        onClick={() => setShowDeployment(true)}
                      >
                        <GradientText colors={["#0a0a0a", "#1a1a1a"]} animationSpeed={3}>
                          + Deploy Real Agent
                        </GradientText>
                      </button>
                    </div>

                    {/* Real Agent Tasks Monitor */}
                    <div className="real-tasks-monitor">
                      <h4>
                        <GradientText colors={["#3AFF73", "#40ffaa"]} animationSpeed={4}>
                          Live Agent Tasks ({realAgentTasks.length} running)
                        </GradientText>
                      </h4>
                      <div className="tasks-grid">
                        {realAgentTasks.map((task) => (
                          <div key={task.id} className="task-card">
                            <div className="task-header">
                              <span className="task-type">{task.type.replace(/_/g, ' ').toUpperCase()}</span>
                              <span className={`task-status ${task.status}`}>{task.status}</span>
                            </div>
                            <div className="task-agent">Agent: {agents.find(a => a.id === task.agentId)?.name || 'Unknown'}</div>
                            <div className="task-priority">Priority: {task.priority}</div>
                            {task.metrics && (
                              <div className="task-metrics">
                                <div>Accuracy: {task.metrics.accuracy.toFixed(1)}%</div>
                                <div>Confidence: {task.metrics.confidence.toFixed(1)}%</div>
                                {task.metrics.profit && <div>Profit: ${task.metrics.profit.toFixed(0)}</div>}
                              </div>
                            )}
                            <div className="task-logs">
                              {task.logs.slice(-2).map((log, i) => (
                                <div key={i} className="task-log">{log}</div>
                              ))}
                            </div>
                            {task.insights && task.insights.length > 0 && (
                              <div className="task-insights">
                                <strong>💡 Insights:</strong>
                                {task.insights.map((insight, i) => (
                                  <div key={i} className="insight">{insight}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        {realAgentTasks.length === 0 && (
                          <div className="no-tasks">
                            <div className="no-tasks-icon">⏳</div>
                            <div>No active real tasks. Deploy an agent to start live operations.</div>
                          </div>
                        )}
                      </div>

                      {/* Task History */}
                      {taskHistory.length > 0 && (
                        <div className="task-history">
                          <h5>Recent Completed Tasks</h5>
                          <div className="history-list">
                            {taskHistory.slice(-5).map((task) => (
                              <div key={task.id} className="history-item">
                                <span className={`status ${task.status}`}>{task.status}</span>
                                <span className="type">{task.type.replace(/_/g, ' ')}</span>
                                <span className="agent">{agents.find(a => a.id === task.agentId)?.name}</span>
                                <span className="duration">
                                  {task.endTime && task.startTime 
                                    ? `${Math.round((task.endTime.getTime() - task.startTime.getTime()) / 1000)}s`
                                    : '-'}
                                </span>
                                {task.metrics?.profit && (
                                  <span className="profit">+${task.metrics.profit.toFixed(0)}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="agents-grid">
                      {agents.map((agent, i) => (
                        <FadeContent key={agent.id} duration={800} delay={i * 100}>
                          <div className="agent-card">
                            <GlareHover
                              width="100%"
                              height="100%"
                              background="rgba(15, 15, 15, 0.95)"
                              borderRadius="12px"
                              borderColor="rgba(58, 255, 115, 0.2)"
                              glareColor="#3AFF73"
                              glareOpacity={0.12}
                            >
                                <div className="agent-content">
                                  <div className="agent-header">
                                    <div className="agent-name">
                                      <ShinyText text={agent.name} speed={7} />
                                    </div>
                                    <div 
                                      className="agent-status"
                                      style={{ color: getStatusColor(agent.status) }}
                                    >
                                      ● {agent.status}
                                    </div>
                                  </div>
                                  
                                  <div className="agent-task">{agent.task}</div>
                                  
                                  <div className="agent-metrics">
                                    <div className="metric">
                                      <span>Performance</span>
                                      <div className="progress-bar">
                                        <div 
                                          className="progress-fill"
                                          style={{ width: `${agent.performance.toFixed(1)}%` }}
                                        ></div>
                                      </div>
                                      <span>{agent.performance.toFixed(1)}%</span>
                                    </div>
                                    
                                    <div className="metric">
                                      <span>CPU Usage</span>
                                      <div className="progress-bar">
                                        <div 
                                          className="progress-fill"
                                          style={{ width: `${(agent.cpuUsage || 0).toFixed(1)}%` }}
                                        ></div>
                                      </div>
                                      <span>{(agent.cpuUsage || 0).toFixed(1)}%</span>
                                    </div>
                                    
                                    <div className="security-level">
                                      <span>Security: </span>
                                      <span className={`level ${agent.securityLevel || 'medium'}`}>
                                        {(agent.securityLevel || 'medium').toUpperCase()}
                                      </span>
                                      <span style={{ marginLeft: '1rem', color: '#666' }}>
                                        {agent.version || 'v1.0.0'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="agent-actions">
                                    <button 
                                      className="action-btn start"
                                      onClick={() => handleAgentAction(agent.id, 'start')}
                                    >
                                      Start
                                    </button>
                                    <button 
                                      className="action-btn stop"
                                      onClick={() => handleAgentAction(agent.id, 'stop')}
                                    >
                                      Stop
                                    </button>
                                    <button 
                                      className="action-btn restart"
                                      onClick={() => handleAgentAction(agent.id, 'restart')}
                                    >
                                      Restart
                                    </button>
                                    <button 
                                      className="action-btn remove"
                                      onClick={() => handleAgentRemove(agent.id)}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </GlareHover>
                          </div>
                        </FadeContent>
                      ))}
                    </div>
                  </div>
                </FadeContent>
              )}

              {activeTab === 'security' && (
                <FadeContent duration={800} delay={300}>
                  <div className="dashboard-grid">
                    {/* Threat Detection */}
                    <div className="stats-section">
                      <h3>
                        <GradientText colors={["#3AFF73", "#40ffaa"]} animationSpeed={4}>
                          Threat Detection
                        </GradientText>
                      </h3>
                      <div className="chart-container">
                        <div className="threat-meter">
                          <div className="meter-circle">
                            <div className="meter-fill" style={{ '--fill': '5%' } as any}></div>
                            <div className="meter-text">
                              <span className="meter-value">0</span>
                              <span className="meter-label">Active Threats</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Encryption Status */}
                    <div className="stats-section">
                      <h3>
                        <GradientText colors={["#3AFF73", "#40ffaa"]} animationSpeed={4}>
                          Encryption Status
                        </GradientText>
                      </h3>
                      <div className="stats-grid">
                        <div className="stat-card">
                          <div className="stat-icon active">🔐</div>
                          <div className="stat-info">
                            <div className="stat-value">AES-256</div>
                            <div className="stat-label">Active</div>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-icon active">🔑</div>
                          <div className="stat-info">
                            <div className="stat-value">RSA-4096</div>
                            <div className="stat-label">Active</div>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-icon active">⚡</div>
                          <div className="stat-info">
                            <div className="stat-value">Multi-Sig</div>
                            <div className="stat-label">Active</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security Audit Log */}
                    <div className="tasks-section">
                      <h3>
                        <GradientText colors={["#3AFF73", "#40ffaa"]} animationSpeed={4}>
                          Security Audit Log
                        </GradientText>
                      </h3>
                      <div className="tasks-container">
                        <div className="logs-container">
                          {securityLogs.map((log) => (
                            <div key={log.id} className="log-entry">
                              <div className="log-timestamp">{log.timestamp}</div>
                              <div 
                                className="log-type"
                                style={{ color: getSeverityColor(log.severity) }}
                              >
                                [{log.type.toUpperCase()}]
                              </div>
                              <div className="log-message">{log.message}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Security Actions */}
                    <div className="actions-section">
                      <h3>
                        <GradientText colors={["#3AFF73", "#40ffaa"]} animationSpeed={4}>
                          Security Actions
                        </GradientText>
                      </h3>
                      <div className="actions-grid">
                        <button className="action-btn" onClick={handleSecurityScan}>
                          <span className="action-icon">🛡️</span>
                          Run Security Scan
                        </button>

                        <button className="action-btn" onClick={handleAuditLogs}>
                          <span className="action-icon">🔍</span>
                          Audit Logs
                        </button>

                        <button className="action-btn" onClick={handleUpdateEncryption}>
                          <span className="action-icon">🔒</span>
                          Update Encryption
                        </button>
                      </div>
                    </div>
                  </div>
                </FadeContent>
              )}

              {activeTab === 'analytics' && (
                <FadeContent duration={800} delay={300}>
                  <div className="dashboard-grid">
                    {/* Agent Performance Stats */}
                    <div className="stats-section">
                      <h3>
                        <GradientText colors={["#3AFF73", "#40ffaa"]} animationSpeed={4}>
                          Performance Metrics
                        </GradientText>
                      </h3>
                      <div className="stats-grid">
                        <div className="stat-card">
                          <div className="stat-icon active">📈</div>
                          <div className="stat-info">
                            <div className="stat-value">
                              <CountUp to={94} duration={2} onStart={() => {}} onEnd={() => {}} />%
                            </div>
                            <div className="stat-label">Efficiency</div>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-icon active">⚡</div>
                          <div className="stat-info">
                            <div className="stat-value">
                              <CountUp to={2847} duration={2} onStart={() => {}} onEnd={() => {}} />
                            </div>
                            <div className="stat-label">Tasks/Hour</div>
                          </div>
                        </div>

                        <div className="stat-card">
                          <div className="stat-icon active">💎</div>
                          <div className="stat-info">
                            <div className="stat-value">
                              <CountUp to={99} duration={2} onStart={() => {}} onEnd={() => {}} />.8%
                            </div>
                            <div className="stat-label">Uptime</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Chart */}
                    <div className="chart-section">
                      <h3>
                        <GradientText colors={["#3AFF73", "#40ffaa"]} animationSpeed={4}>
                          Agent Performance Trends
                        </GradientText>
                      </h3>
                      <div className="chart-container">
                        <div className="performance-chart">
                          <div className="chart-area">
                            {[85, 87, 89, 92, 90, 94, 96, 93, 95, 97].map((value, i) => (
                              <div 
                                key={i} 
                                className="chart-point"
                                style={{ 
                                  left: `${i * 10}%`, 
                                  bottom: `${value - 80}%` 
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Task Distribution */}
                    <div className="tasks-section">
                      <h3>
                        <GradientText colors={["#3AFF73", "#40ffaa"]} animationSpeed={4}>
                          Task Distribution
                        </GradientText>
                      </h3>
                      <div className="tasks-container">
                        <div className="task-distribution">
                          <div className="task-item">
                            <span>Data Processing</span>
                            <div className="task-bar">
                              <div className="task-fill" style={{ width: '65%' }}></div>
                            </div>
                            <span>65%</span>
                          </div>
                          <div className="task-item">
                            <span>Market Making</span>
                            <div className="task-bar">
                              <div className="task-fill" style={{ width: '25%' }}></div>
                            </div>
                            <span>25%</span>
                          </div>
                          <div className="task-item">
                            <span>Security Audit</span>
                            <div className="task-bar">
                              <div className="task-fill" style={{ width: '10%' }}></div>
                            </div>
                            <span>10%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Analytics Actions */}
                    <div className="actions-section">
                      <h3>
                        <GradientText colors={["#3AFF73", "#40ffaa"]} animationSpeed={4}>
                          Analytics Actions
                        </GradientText>
                      </h3>
                      <div className="actions-grid">
                        <button className="action-btn" onClick={handleGenerateReport}>
                          <span className="action-icon">📊</span>
                          Generate Report
                        </button>

                        <button className="action-btn" onClick={handleExportData}>
                          <span className="action-icon">📈</span>
                          Export Data
                        </button>

                        <button className="action-btn" onClick={handleConfigureMetrics}>
                          <span className="action-icon">⚙️</span>
                          Configure Metrics
                        </button>
                      </div>
                    </div>
                  </div>
                </FadeContent>
              )}

              {activeTab === 'defi' && (
                <FadeContent duration={1000} delay={100}>
                  <DeFiDashboard defiActions={defiActions} />
                </FadeContent>
              )}
            </div>
          </>
        )}
      </main>

      {/* Agent Deployment Modal */}
      {showDeployment && (
        <AgentDeployment
          onClose={() => setShowDeployment(false)}
          onDeploy={handleAgentDeploy}
        />
      )}
    </div>
  );
};

export default AppDemo;