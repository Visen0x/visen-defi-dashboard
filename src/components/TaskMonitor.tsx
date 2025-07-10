import React, { useState, useEffect } from 'react';
import { AgentTask, AgentExecutor } from '../services/agentExecutor';

interface TaskMonitorProps {
  agentId?: string;
}

const TaskMonitor: React.FC<TaskMonitorProps> = ({ agentId }) => {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const agentExecutor = AgentExecutor.getInstance();

  useEffect(() => {
    const updateTasks = () => {
      if (agentId) {
        setTasks(agentExecutor.getTasksForAgent(agentId));
      } else {
        const running = agentExecutor.getRunningTasks();
        const history = agentExecutor.getTaskHistory().slice(-10); // Last 10 completed
        setTasks([...running, ...history]);
      }
    };

    updateTasks();
    const interval = setInterval(updateTasks, 5000); // Update every 5 seconds instead of 1 second

    return () => clearInterval(interval);
  }, [agentId]);

  const getStatusColor = (status: AgentTask['status']) => {
    switch (status) {
      case 'running': return '#3498db';
      case 'completed': return '#3AFF73';
      case 'failed': return '#e74c3c';
      case 'pending': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getTaskIcon = (type: AgentTask['type']) => {
    switch (type) {
      case 'monitor_transactions': return '💰';
      case 'analyze_defi': return '📊';
      case 'security_audit': return '🔒';
      case 'liquidity_optimization': return '💧';
      default: return '⚙️';
    }
  };

  const formatDuration = (startTime?: Date, endTime?: Date) => {
    if (!startTime) return 'N/A';
    const end = endTime || new Date();
    const duration = end.getTime() - startTime.getTime();
    return `${Math.round(duration / 1000)}s`;
  };

  const formatTaskType = (type: AgentTask['type']) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div>
      <h4 style={{ 
        fontSize: '1.2rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem', 
        color: '#3AFF73' 
      }}>
        {agentId ? 'Agent Tasks' : 'Live Task Monitor'}
      </h4>
      
      {tasks.length === 0 ? (
        <div style={{ 
          padding: '1.5rem', 
          background: 'rgba(255,255,255,0.05)', 
          border: '1px solid rgba(58,255,115,0.1)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <span style={{ color: '#888', fontSize: '0.95rem' }}>
            No tasks running. Deploy an agent and click Start to see real-time execution.
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tasks.slice(-5).reverse().map((task) => (
            <div key={task.id} style={{ 
              padding: '1rem', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(58,255,115,0.1)',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Task Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{getTaskIcon(task.type)}</span>
                    <span style={{ fontWeight: 'bold', color: 'white', fontSize: '0.95rem' }}>
                      {formatTaskType(task.type)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      background: getStatusColor(task.status),
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {task.status}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>
                      {formatDuration(task.startTime, task.endTime)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar for Running Tasks */}
                {task.status === 'running' && (
                  <div style={{ 
                    width: '100%', 
                    height: '4px', 
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.random() * 100}%`, // Simulate progress
                      height: '100%',
                      background: '#3AFF73',
                      borderRadius: '2px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                )}

                {/* Task Logs */}
                {task.logs.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#ccc', marginBottom: '0.5rem' }}>
                      Latest logs:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {task.logs.slice(-3).map((log, index) => (
                        <div 
                          key={index} 
                          style={{ 
                            fontSize: '0.8rem', 
                            color: '#999', 
                            fontFamily: 'monospace',
                            paddingLeft: '0.5rem',
                            borderLeft: '2px solid rgba(58,255,115,0.3)',
                            background: 'rgba(58,255,115,0.05)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0 4px 4px 0'
                          }}
                        >
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Task Results for Completed Tasks */}
                {task.result && task.status === 'completed' && (
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#3AFF73', marginBottom: '0.5rem' }}>
                      Results:
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#ccc', 
                      fontFamily: 'monospace',
                      background: 'rgba(58,255,115,0.05)',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(58,255,115,0.1)'
                    }}>
                      {typeof task.result === 'object' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {Object.entries(task.result).slice(0, 3).map(([key, value]) => (
                            <div key={key}>
                              <span style={{ color: '#3AFF73' }}>{key}:</span>{' '}
                              {typeof value === 'object' 
                                ? JSON.stringify(value).slice(0, 50) + '...' 
                                : String(value).slice(0, 50)
                              }
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>{String(task.result).slice(0, 100)}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskMonitor; 