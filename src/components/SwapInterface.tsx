import React from 'react';
import { WalletInfo } from '../services/walletService';

interface SwapInterfaceProps {
  walletInfo: WalletInfo;
}

const SwapInterface: React.FC<SwapInterfaceProps> = ({ walletInfo }) => {
  if (!walletInfo.connected) {
    return (
      <div className="defi-placeholder">
        <div className="placeholder-icon">🔄</div>
        <h3>Token Swap</h3>
        <p>Please connect your wallet to access token swap features.</p>
      </div>
    );
  }

  return (
    <div className="defi-interface">
      <div className="interface-header">
        <h3>🔄 Token Swap</h3>
        <p>Swap tokens using Jupiter DEX aggregator</p>
      </div>

      <div className="interface-content">
        <div className="info-card">
          <h4>Your Wallet</h4>
          <div className="wallet-stats">
            <div className="stat">
              <span>SOL Balance</span>
              <strong>{walletInfo.balance.toFixed(4)} SOL</strong>
            </div>
            <div className="stat">
              <span>Wallet Address</span>
              <strong>{walletInfo.publicKey.slice(0, 8)}...{walletInfo.publicKey.slice(-8)}</strong>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h4>Supported Tokens</h4>
          <div className="token-list">
            <div className="token-item">
              <span className="token-symbol">SOL</span>
              <span className="token-name">Solana</span>
            </div>
            <div className="token-item">
              <span className="token-symbol">USDC</span>
              <span className="token-name">USD Coin</span>
            </div>
            <div className="token-item">
              <span className="token-symbol">USDT</span>
              <span className="token-name">Tether USD</span>
            </div>
            <div className="token-item">
              <span className="token-symbol">mSOL</span>
              <span className="token-name">Marinade staked SOL</span>
            </div>
            <div className="token-item">
              <span className="token-symbol">JitoSOL</span>
              <span className="token-name">Jito Staked SOL</span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h4>Swap Interface</h4>
          <div className="swap-form">
            <div className="swap-input-group">
              <label>From</label>
              <div className="swap-input">
                <select disabled>
                  <option>SOL - Solana</option>
                </select>
                <input type="number" placeholder="0.00" disabled />
              </div>
            </div>
            
            <div className="swap-arrow">⬇️</div>
            
            <div className="swap-input-group">
              <label>To</label>
              <div className="swap-input">
                <select disabled>
                  <option>USDC - USD Coin</option>
                </select>
                <input type="number" placeholder="0.00" disabled />
              </div>
            </div>
            
            <button className="swap-btn" disabled>
              Swap Tokens
            </button>
          </div>
        </div>

        <div className="info-card">
          <h4>Security Notice</h4>
          <p>
            This swap interface uses Jupiter DEX aggregator for legitimate token swaps. 
            All transactions require your approval and your private keys remain secure in your wallet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SwapInterface; 