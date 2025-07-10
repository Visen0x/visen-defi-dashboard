import React from 'react';
import { WalletInfo } from '../services/walletService';

interface StakingInterfaceProps {
  walletInfo: WalletInfo;
}

const StakingInterface: React.FC<StakingInterfaceProps> = ({ walletInfo }) => {
  if (!walletInfo.connected) {
    return (
      <div className="defi-placeholder">
        <div className="placeholder-icon">🏦</div>
        <h3>Staking Interface</h3>
        <p>Please connect your wallet to access staking features.</p>
      </div>
    );
  }

  return (
    <div className="defi-interface">
      <div className="interface-header">
        <h3>🏦 SOL Staking</h3>
        <p>Stake your SOL with legitimate validators</p>
      </div>

      <div className="interface-content">
        <div className="info-card">
          <h4>Your Wallet</h4>
          <div className="wallet-stats">
            <div className="stat">
              <span>Available Balance</span>
              <strong>{walletInfo.balance.toFixed(4)} SOL</strong>
            </div>
            <div className="stat">
              <span>Wallet Address</span>
              <strong>{walletInfo.publicKey.slice(0, 8)}...{walletInfo.publicKey.slice(-8)}</strong>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h4>Staking Options</h4>
          <div className="staking-options">
            <div className="validator-option">
              <div className="validator-info">
                <strong>Chorus One</strong>
                <span>6.5% APY • 8% Commission</span>
              </div>
              <button className="stake-btn" disabled>
                Stake SOL
              </button>
            </div>
            
            <div className="validator-option">
              <div className="validator-info">
                <strong>Step Finance</strong>
                <span>7.2% APY • 5% Commission</span>
              </div>
              <button className="stake-btn" disabled>
                Stake SOL
              </button>
            </div>
            
            <div className="validator-option">
              <div className="validator-info">
                <strong>Marinade Finance</strong>
                <span>6.8% APY • 6% Commission</span>
              </div>
              <button className="stake-btn" disabled>
                Stake SOL
              </button>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h4>Security Notice</h4>
          <p>
            This staking interface allows you to stake SOL through legitimate validators while maintaining full control of your funds. 
            Your private keys remain secure in your wallet at all times.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StakingInterface; 