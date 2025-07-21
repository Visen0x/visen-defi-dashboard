import React, { useState, useEffect } from 'react';
import { WalletInfo } from '../services/walletService';
import { swapService } from '../services/swapService';

interface SwapInterfaceProps {
  walletInfo: WalletInfo;
}

const SwapInterface: React.FC<SwapInterfaceProps> = ({ walletInfo }) => {
  const [isSwapping, setIsSwapping] = useState(false);
  const [fromToken, setFromToken] = useState('SOL');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [swapQuote, setSwapQuote] = useState<any>(null);
  const [isGettingQuote, setIsGettingQuote] = useState(false);

  const tokens = [
    { symbol: 'SOL', name: 'Solana', address: 'So11111111111111111111111111111111111111112' },
    { symbol: 'USDC', name: 'USD Coin', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
    { symbol: 'USDT', name: 'Tether USD', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
    { symbol: 'mSOL', name: 'Marinade staked SOL', address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So' },
    { symbol: 'JitoSOL', name: 'Jito Staked SOL', address: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn' }
  ];

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      alert('Please enter a valid amount to swap');
      return;
    }

    const amount = parseFloat(fromAmount);
    if (fromToken === 'SOL' && amount > walletInfo.balance) {
      alert('Insufficient SOL balance');
      return;
    }

    if (fromToken === toToken) {
      alert('Please select different tokens for swap');
      return;
    }

    setIsSwapping(true);
    try {
      console.log(`🔄 Swapping ${amount} ${fromToken} to ${toToken}...`);
      
      const fromTokenData = tokens.find(t => t.symbol === fromToken);
      const toTokenData = tokens.find(t => t.symbol === toToken);
      
      if (!fromTokenData || !toTokenData) {
        throw new Error('Token not found');
      }

      // Get quote first
      const quote = await swapService.getSwapQuote(
        fromTokenData.address,
        toTokenData.address,
        amount
      );

      // Store quote and show confirmation dialog
      setSwapQuote({
        quote,
        fromTokenData,
        toTokenData,
        amount,
        fromToken,
        toToken
      });
      setShowConfirmation(true);
      setIsSwapping(false);
      
    } catch (error) {
      console.error('Swap error:', error);
      alert(`❌ Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsSwapping(false);
    }
  };

  const handleConfirmSwap = async () => {
    if (!swapQuote) return;
    
    setShowConfirmation(false);
    setIsSwapping(true);
    
    try {
      const result = await swapService.executeSwap(
        swapQuote.fromTokenData.address,
        swapQuote.toTokenData.address,
        swapQuote.amount
      );
      
      alert(`✅ Swap successful!\n\nTransaction: ${result.signature}\n\nSwapped ${swapQuote.amount} ${swapQuote.fromToken} for ${result.outputAmount.toFixed(6)} ${swapQuote.toToken}`);
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      
    } catch (error) {
      console.error('Swap error:', error);
      alert(`❌ Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSwapDirection = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setToAmount('');
  };

  const handleCancelSwap = () => {
    setShowConfirmation(false);
    setSwapQuote(null);
  };

  // Real-time conversion when user types amount
  useEffect(() => {
    const getConversion = async () => {
      if (!fromAmount || parseFloat(fromAmount) <= 0 || fromToken === toToken) {
        setToAmount('');
        return;
      }

      const amount = parseFloat(fromAmount);
      if (isNaN(amount)) {
        setToAmount('');
        return;
      }

      setIsGettingQuote(true);
      try {
        const fromTokenData = tokens.find(t => t.symbol === fromToken);
        const toTokenData = tokens.find(t => t.symbol === toToken);
        
        if (!fromTokenData || !toTokenData) {
          setToAmount('');
          return;
        }

        const quote = await swapService.getSwapQuote(
          fromTokenData.address,
          toTokenData.address,
          amount
        );

        setToAmount(quote.outputAmount.toFixed(6));
      } catch (error) {
        console.error('Error getting conversion:', error);
        setToAmount('');
      } finally {
        setIsGettingQuote(false);
      }
    };

    // Debounce the conversion request
    const timeoutId = setTimeout(getConversion, 500);
    return () => clearTimeout(timeoutId);
  }, [fromAmount, fromToken, toToken]);

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
                <select 
                  value={fromToken} 
                  onChange={(e) => setFromToken(e.target.value)}
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(40, 40, 40, 0.8)',
                    border: '1px solid rgba(58, 255, 115, 0.2)',
                    borderRadius: '8px',
                    color: '#e0e0e0',
                    fontSize: '1rem',
                    minWidth: '140px'
                  }}
                >
                  {tokens.map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol} - {token.name}
                    </option>
                  ))}
                </select>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  min="0"
                  step="0.000001"
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(40, 40, 40, 0.8)',
                    border: '1px solid rgba(58, 255, 115, 0.2)',
                    borderRadius: '8px',
                    color: '#e0e0e0',
                    fontSize: '1rem',
                    flex: 1
                  }}
                />
              </div>
            </div>
            
            <div className="swap-arrow" style={{ textAlign: 'center', margin: '1rem 0' }}>
              <button 
                onClick={handleSwapDirection}
                style={{
                  background: 'rgba(58, 255, 115, 0.2)',
                  border: '1px solid rgba(58, 255, 115, 0.3)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                ⬇️
              </button>
            </div>
            
            <div className="swap-input-group">
              <label>To</label>
              <div className="swap-input">
                <select 
                  value={toToken} 
                  onChange={(e) => setToToken(e.target.value)}
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(40, 40, 40, 0.8)',
                    border: '1px solid rgba(58, 255, 115, 0.2)',
                    borderRadius: '8px',
                    color: '#e0e0e0',
                    fontSize: '1rem',
                    minWidth: '140px'
                  }}
                >
                  {tokens.map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol} - {token.name}
                    </option>
                  ))}
                </select>
                <input 
                  type="number" 
                  placeholder={isGettingQuote ? "Getting quote..." : "0.00"} 
                  value={toAmount}
                  readOnly
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(40, 40, 40, 0.8)',
                    border: '1px solid rgba(58, 255, 115, 0.2)',
                    borderRadius: '8px',
                    color: isGettingQuote ? '#3AFF73' : '#888',
                    fontSize: '1rem',
                    flex: 1
                  }}
                />
              </div>
            </div>
            
            <button 
              className="swap-btn" 
              disabled={isSwapping || !fromAmount || parseFloat(fromAmount) <= 0 || fromToken === toToken}
              onClick={handleSwap}
              style={{
                width: '100%',
                padding: '1rem',
                background: isSwapping || !fromAmount || parseFloat(fromAmount) <= 0 || fromToken === toToken 
                  ? '#333' 
                  : 'linear-gradient(135deg, #3AFF73, #40ffaa)',
                color: isSwapping || !fromAmount || parseFloat(fromAmount) <= 0 || fromToken === toToken 
                  ? '#666' 
                  : '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: isSwapping || !fromAmount || parseFloat(fromAmount) <= 0 || fromToken === toToken 
                  ? 'not-allowed' 
                  : 'pointer',
                marginTop: '1rem'
              }}
            >
              {isSwapping ? 'Swapping...' : 'Swap Tokens'}
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

      {/* Confirmation Dialog */}
      {showConfirmation && swapQuote && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
            border: '1px solid rgba(58, 255, 115, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ color: '#3AFF73', marginBottom: '1rem' }}>Confirm Swap</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#ccc' }}>From: </span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>
                  {swapQuote.amount} {swapQuote.fromToken}
                </span>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#ccc' }}>To: </span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>
                  ~{swapQuote.quote.outputAmount.toFixed(6)} {swapQuote.toToken}
                </span>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#ccc' }}>Price Impact: </span>
                <span style={{ color: '#fff' }}>
                  ~{swapQuote.quote.priceImpact.toFixed(2)}%
                </span>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#ccc' }}>Fee: </span>
                <span style={{ color: '#fff' }}>
                  ~{swapQuote.quote.fee.toFixed(6)} SOL
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={handleCancelSwap}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmSwap}
                disabled={isSwapping}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: isSwapping 
                    ? '#333' 
                    : 'linear-gradient(135deg, #3AFF73, #40ffaa)',
                  border: 'none',
                  borderRadius: '8px',
                  color: isSwapping ? '#666' : '#000',
                  cursor: isSwapping ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                {isSwapping ? 'Swapping...' : 'Confirm Swap'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapInterface; 