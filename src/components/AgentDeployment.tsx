import React, { useState } from 'react';
import './AgentDeployment.css';
import { DataService } from '../services/dataService';

interface DeploymentConfig {
  name: string;
  type: 'processor' | 'coordinator' | 'auditor' | 'analyzer';
  environment: 'development' | 'staging' | 'production';
  resources: {
    cpu: number;
    memory: number;
    storage: number;
  };
  securityLevel: 'high' | 'medium' | 'low';
  autoStart: boolean;
  maxConnections: number;
}

interface AgentDeploymentProps {
  onClose: () => void;
  onDeploy: (config: DeploymentConfig) => void;
}

const AgentDeployment: React.FC<AgentDeploymentProps> = ({ onClose, onDeploy }) => {
  const [step, setStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [config, setConfig] = useState<DeploymentConfig>({
    name: '',
    type: 'processor',
    environment: 'development',
    resources: {
      cpu: 2,
      memory: 4,
      storage: 50
    },
    securityLevel: 'high',
    autoStart: true,
    maxConnections: 100
  });

  const agentTypes = [
    { 
      value: 'processor', 
      label: 'Data Processor', 
      description: 'Handles data processing and transformation tasks',
      icon: '↻'
    },
    { 
      value: 'coordinator', 
      label: 'Task Coordinator', 
      description: 'Manages and orchestrates multiple agent tasks',
      icon: '◎'
    },
    { 
      value: 'auditor', 
      label: 'Security Auditor', 
      description: 'Monitors and validates security protocols',
      icon: '🛡️'
    },
    { 
      value: 'analyzer', 
      label: 'Market Analyzer', 
      description: 'Analyzes market data and trends',
      icon: '⚬'
    }
  ];

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploymentProgress(0);

    // Simulate deployment steps
    const steps = [
      'Validating configuration...',
      'Allocating resources...',
      'Setting up security protocols...',
      'Initializing agent container...',
      'Establishing network connections...',
      'Running health checks...',
      'Deployment complete!'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setDeploymentProgress(((i + 1) / steps.length) * 100);
    }

    // Generate agent ID and deploy
    const agentId = `agent-${Date.now()}`;
    onDeploy({ ...config, name: config.name || `${config.type}-${agentId}` });
    
    setTimeout(() => {
      setIsDeploying(false);
      onClose();
    }, 1000);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-content">
            <h3>Agent Configuration</h3>
            <div className="form-group">
              <label>Agent Name</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="Enter agent name"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Agent Type</label>
              <div className="agent-type-grid">
                {agentTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`agent-type-card ${config.type === type.value ? 'selected' : ''}`}
                    onClick={() => setConfig({ ...config, type: type.value as any })}
                  >
                    <div className="agent-type-icon">{type.icon}</div>
                    <div className="agent-type-label">{type.label}</div>
                    <div className="agent-type-desc">{type.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3>Resource Allocation</h3>
            <div className="resource-sliders">
              <div className="slider-group">
                <label>CPU Cores: {config.resources.cpu}</label>
                <input
                  type="range"
                  min="1"
                  max="16"
                  value={config.resources.cpu}
                  onChange={(e) => setConfig({
                    ...config,
                    resources: { ...config.resources, cpu: parseInt(e.target.value) }
                  })}
                  className="resource-slider"
                />
              </div>
              
              <div className="slider-group">
                <label>Memory (GB): {config.resources.memory}</label>
                <input
                  type="range"
                  min="1"
                  max="64"
                  value={config.resources.memory}
                  onChange={(e) => setConfig({
                    ...config,
                    resources: { ...config.resources, memory: parseInt(e.target.value) }
                  })}
                  className="resource-slider"
                />
              </div>
              
              <div className="slider-group">
                <label>Storage (GB): {config.resources.storage}</label>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  value={config.resources.storage}
                  onChange={(e) => setConfig({
                    ...config,
                    resources: { ...config.resources, storage: parseInt(e.target.value) }
                  })}
                  className="resource-slider"
                />
              </div>
            </div>
            
            <div className="resource-summary">
              <h4>Resource Summary</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span>Estimated Cost</span>
                  <span className="cost">${(config.resources.cpu * 0.5 + config.resources.memory * 0.1).toFixed(2)}/hour</span>
                </div>
                <div className="summary-item">
                  <span>Performance Score</span>
                  <span className="score">{Math.min(100, (config.resources.cpu * 10 + config.resources.memory * 2))}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3>Security & Environment</h3>
            <div className="form-group">
              <label>Environment</label>
              <select
                value={config.environment}
                onChange={(e) => setConfig({ ...config, environment: e.target.value as any })}
                className="form-select"
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Security Level</label>
              <div className="security-options">
                {['high', 'medium', 'low'].map((level) => (
                  <div
                    key={level}
                    className={`security-option ${config.securityLevel === level ? 'selected' : ''}`}
                    onClick={() => setConfig({ ...config, securityLevel: level as any })}
                  >
                    <span className="security-icon">
                      {level === 'high' ? '◉' : level === 'medium' ? '◎' : '○'}
                    </span>
                    <span className="security-label">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Maximum Connections</label>
              <input
                type="number"
                value={config.maxConnections}
                onChange={(e) => setConfig({ ...config, maxConnections: parseInt(e.target.value) })}
                className="form-input"
                min="10"
                max="1000"
              />
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.autoStart}
                  onChange={(e) => setConfig({ ...config, autoStart: e.target.checked })}
                />
                <span className="checkmark"></span>
                Auto-start agent after deployment
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isDeploying) {
    return (
      <div className="agent-deployment-overlay">
        <div className="deployment-modal deploying">
          <div className="deployment-header">
            <h2>Deploying Agent...</h2>
          </div>
          <div className="deployment-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${deploymentProgress}%` }}
              ></div>
            </div>
            <div className="progress-text">{deploymentProgress.toFixed(0)}% Complete</div>
          </div>
          <div className="deployment-animation">
            <div className="deploy-spinner"></div>
            <div className="deploy-text">Setting up your agent...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-deployment-overlay">
      <div className="deployment-modal">
        <div className="deployment-header">
          <h2>Deploy New Agent</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="deployment-steps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span>1</span>
            Configuration
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span>2</span>
            Resources
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            <span>3</span>
            Security
          </div>
        </div>
        
        <div className="deployment-content">
          {renderStepContent()}
        </div>
        
        <div className="deployment-actions">
          {step > 1 && (
            <button 
              className="btn-secondary"
              onClick={() => setStep(step - 1)}
            >
              Previous
            </button>
          )}
          
          {step < 3 ? (
            <button 
              className="btn-primary"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !config.name}
            >
              Next
            </button>
          ) : (
            <button 
              className="btn-deploy"
              onClick={handleDeploy}
              disabled={!config.name}
            >
              Deploy Agent
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDeployment; 