import React, { useState, useEffect } from 'react';
import { walletService, WalletInfo } from '../services/walletService';

interface WalletConnectionProps {
  onWalletConnected?: (walletInfo: WalletInfo) => void;
  onWalletDisconnected?: () => void;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({
  onWalletConnected,
  onWalletDisconnected
}) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>(walletService.getWalletInfo());
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    const currentWalletInfo = walletService.getWalletInfo();
    if (currentWalletInfo.connected) {
      setWalletInfo(currentWalletInfo);
      onWalletConnected?.(currentWalletInfo);
    }
  }, [onWalletConnected]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    // Simple alert for now - you can replace with a proper toast system later
    alert(`${type.toUpperCase()}: ${message}`);
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      if (!walletService.isPhantomAvailable()) {
        showToast('Please install Phantom wallet from phantom.app', 'error');
        return;
      }

      const connectedWallet = await walletService.connectWallet();
      setWalletInfo(connectedWallet);
      onWalletConnected?.(connectedWallet);

      showToast(`Connected to ${connectedWallet.publicKey.slice(0, 8)}...${connectedWallet.publicKey.slice(-8)}`, 'success');
    } catch (error) {
      console.error('Connection error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to connect wallet', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await walletService.disconnectWallet();
      setWalletInfo(walletService.getWalletInfo());
      onWalletDisconnected?.();

      showToast('Your wallet has been disconnected', 'info');
    } catch (error) {
      console.error('Disconnection error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to disconnect wallet', 'error');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const refreshBalance = async () => {
    if (!walletInfo.connected) return;
    
    try {
      const newBalance = await walletService.refreshBalance();
      setWalletInfo(prev => ({ ...prev, balance: newBalance }));
    } catch (error) {
      console.error('Balance refresh error:', error);
    }
  };

  if (!walletService.isPhantomAvailable()) {
    return (
      <div className="wallet-warning">
        <div className="warning-icon">⚠️</div>
        <div>
          <h3>Phantom Wallet Required</h3>
          <p>
            Please install Phantom wallet from{' '}
            <a href="https://phantom.app" target="_blank" rel="noopener noreferrer">
              phantom.app
            </a>{' '}
            to use DeFi features.
          </p>
        </div>
      </div>
    );
  }

  if (!walletInfo.connected) {
    return (
      <div className="wallet-container">
        <div className="wallet-card">
          <h3>Connect Your Wallet</h3>
          <p>
            Connect your Phantom wallet to access DeFi features. Your private keys remain secure in your wallet.
          </p>
          <button
            className="connect-btn"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect Phantom Wallet'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-container">
      <div className="wallet-card connected">
        <div className="wallet-header">
          <h3>Wallet Connected</h3>
          <span className="status-badge">Connected</span>
        </div>
        
        <div className="wallet-info">
          <div className="info-row">
            <span>Address:</span>
            <span className="address">
              {walletInfo.publicKey.slice(0, 8)}...{walletInfo.publicKey.slice(-8)}
            </span>
          </div>
          
          <div className="info-row">
            <span>Balance:</span>
            <div className="balance-info">
              <span className="balance">{walletInfo.balance.toFixed(4)} SOL</span>
              <button className="refresh-btn" onClick={refreshBalance}>
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="wallet-actions">
          <button
            className="disconnect-btn"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
          >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
          <button
            className="view-btn"
            onClick={() => window.open(`https://solscan.io/account/${walletInfo.publicKey}`, '_blank')}
          >
            View on Solscan
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletConnection; 