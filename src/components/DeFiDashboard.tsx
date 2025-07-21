import React, { useState, useEffect } from 'react';
import { WalletInfo, walletService } from '../services/walletService';
import WalletConnection from './WalletConnection';
import StakingInterface from './StakingInterface';
import SwapInterface from './SwapInterface';

interface DeFiDashboardProps {
  defiActions?: {
    handleStakeSOL: () => void;
    handleSwapTokens: () => void;
    handleProvideLiquidity: () => void;
    handleViewAnalytics: () => void;
  };
}

const DeFiDashboard: React.FC<DeFiDashboardProps> = ({ defiActions }) => {
  const [activeTab, setActiveTab] = useState<'wallet' | 'staking' | 'swap' | 'analytics'>('wallet');
  const [walletInfo, setWalletInfo] = useState<WalletInfo>(() => {
    // Initialize with current wallet state
    return walletService.getWalletInfo();
  });

  // Sync with wallet service on mount and when wallet state changes
  useEffect(() => {
    const currentWalletInfo = walletService.getWalletInfo();
    setWalletInfo(currentWalletInfo);
    
    // If wallet is already connected, refresh balance immediately
    if (currentWalletInfo.connected) {
      refreshWalletBalance();
    }
    
    // Set up polling to keep wallet info in sync
    const interval = setInterval(() => {
      const updatedWalletInfo = walletService.getWalletInfo();
      setWalletInfo(prev => {
        // Only update if there's a meaningful change
        if (prev.connected !== updatedWalletInfo.connected || 
            prev.balance !== updatedWalletInfo.balance ||
            prev.publicKey !== updatedWalletInfo.publicKey) {
          return updatedWalletInfo;
        }
        return prev;
      });
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Refresh wallet balance when switching to non-wallet tabs
  useEffect(() => {
    if (activeTab !== 'wallet' && walletInfo.connected) {
      refreshWalletBalance();
    }
  }, [activeTab, walletInfo.connected]);

  const refreshWalletBalance = async () => {
    try {
      const newBalance = await walletService.refreshBalance();
      setWalletInfo(prev => ({
        ...prev,
        balance: newBalance
      }));
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };

  const handleWalletConnected = (info: WalletInfo) => {
    setWalletInfo(info);
  };

  const handleWalletDisconnected = () => {
    setWalletInfo({
      connected: false,
      publicKey: '',
      balance: 0
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wallet':
        return (
          <WalletConnection
            onWalletConnected={handleWalletConnected}
            onWalletDisconnected={handleWalletDisconnected}
          />
        );
      case 'staking':
        return <StakingInterface walletInfo={walletInfo} />;
      case 'swap':
        return <SwapInterface walletInfo={walletInfo} />;
      case 'analytics':
        return (
          <div className="defi-placeholder">
            <div className="placeholder-icon">⚬</div>
            <h3>Portfolio Analytics</h3>
            <p>View your DeFi portfolio performance and analytics.</p>
            {walletInfo.connected && (
              <div className="wallet-stats" style={{ marginTop: '1rem' }}>
                <div className="stat">
                  <span>Total Portfolio Value</span>
                  <strong>{walletInfo.balance.toFixed(4)} SOL</strong>
                </div>
                <div className="stat">
                  <span>Wallet Address</span>
                  <strong>{walletInfo.publicKey.slice(0, 8)}...{walletInfo.publicKey.slice(-8)}</strong>
                </div>
                <div className="stat">
                  <span>Active Positions</span>
                  <strong>0</strong>
                </div>
                <div className="stat">
                  <span>Total Rewards Earned</span>
                  <strong>0.0000 SOL</strong>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <button 
                    className="refresh-btn"
                    onClick={refreshWalletBalance}
                    style={{
                      background: 'rgba(58, 255, 115, 0.2)',
                      border: '1px solid rgba(58, 255, 115, 0.3)',
                      color: '#3AFF73',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    ↻ Refresh Balance
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="defi-dashboard">
      <div className="dashboard-header">
        <h2>DeFi Dashboard</h2>
        <p>Secure decentralized finance operations</p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallet')}
        >
          💳 Wallet
        </button>
        <button
          className={`tab-button ${activeTab === 'staking' ? 'active' : ''}`}
          onClick={() => setActiveTab('staking')}
        >
          ◊ Staking
        </button>
        <button
          className={`tab-button ${activeTab === 'swap' ? 'active' : ''}`}
          onClick={() => setActiveTab('swap')}
        >
          ↔ Swap
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          ⚬ Analytics
        </button>
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DeFiDashboard; 