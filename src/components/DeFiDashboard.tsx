import React, { useState } from 'react';
import { WalletInfo } from '../services/walletService';
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
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    connected: false,
    publicKey: '',
    balance: 0
  });

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
            <div className="placeholder-icon">📊</div>
            <h3>Portfolio Analytics</h3>
            <p>View your DeFi portfolio performance and analytics.</p>
            {walletInfo.connected && (
              <div className="wallet-stats" style={{ marginTop: '1rem' }}>
                <div className="stat">
                  <span>Total Portfolio Value</span>
                  <strong>{walletInfo.balance.toFixed(4)} SOL</strong>
                </div>
                <div className="stat">
                  <span>Active Positions</span>
                  <strong>0</strong>
                </div>
                <div className="stat">
                  <span>Total Rewards Earned</span>
                  <strong>0.0000 SOL</strong>
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
          🏦 Staking
        </button>
        <button
          className={`tab-button ${activeTab === 'swap' ? 'active' : ''}`}
          onClick={() => setActiveTab('swap')}
        >
          🔄 Swap
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DeFiDashboard; 