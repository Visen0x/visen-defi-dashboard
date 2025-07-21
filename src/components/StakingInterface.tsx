import React, { useState } from 'react';
import { WalletInfo } from '../services/walletService';
import { stakingService } from '../services/stakingService';

interface StakingInterfaceProps {
  walletInfo: WalletInfo;
}

const StakingInterface: React.FC<StakingInterfaceProps> = ({ walletInfo }) => {
  const [isStaking, setIsStaking] = useState(false);
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');

  const validators = [
    {
      publicKey: '7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2',
      name: 'Chorus One',
      commission: 8,
      apy: 6.5
    },
    {
      publicKey: 'StepeLdhJ2znRjHcZdjwMWsC4nTRURNKQY8Nca82LJp',
      name: 'Step Finance',
      commission: 5,
      apy: 7.2
    },
    {
      publicKey: 'mintrNtxN3PhAB45Pt41XqyKghTTpqcoBkQTZqh96iR',
      name: 'Marinade Finance',
      commission: 6,
      apy: 6.8
    }
  ];

  const handleStake = async (validatorPublicKey: string, validatorName: string) => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert('Please enter a valid stake amount');
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (amount > walletInfo.balance) {
      alert('Insufficient balance');
      return;
    }

    if (amount < 0.01) {
      alert('Minimum stake amount is 0.01 SOL');
      return;
    }

    setIsStaking(true);
    try {
      console.log(`🏦 Staking ${amount} SOL with ${validatorName}...`);
      
      const signature = await stakingService.createStakeAccount(amount, validatorPublicKey);
      
      alert(`✅ Staking successful!\n\nValidator: ${validatorName}\nAmount: ${amount} SOL\nTransaction: ${signature}\n\nYour stake will be active in the next epoch (~2 days).`);
      
      // Reset form
      setStakeAmount('');
      setSelectedValidator(null);
      
    } catch (error) {
      console.error('Staking error:', error);
      alert(`❌ Staking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsStaking(false);
    }
  };

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
          <h4>Stake Amount</h4>
          <div className="stake-input-group">
            <input
              type="number"
              placeholder="Enter SOL amount"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              min="0.01"
              max={walletInfo.balance}
              step="0.01"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(40, 40, 40, 0.8)',
                border: '1px solid rgba(58, 255, 115, 0.2)',
                borderRadius: '8px',
                color: '#e0e0e0',
                fontSize: '1rem'
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setStakeAmount((walletInfo.balance * 0.25).toFixed(4))}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(58, 255, 115, 0.2)',
                  border: '1px solid rgba(58, 255, 115, 0.3)',
                  borderRadius: '4px',
                  color: '#3AFF73',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                25%
              </button>
              <button
                onClick={() => setStakeAmount((walletInfo.balance * 0.5).toFixed(4))}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(58, 255, 115, 0.2)',
                  border: '1px solid rgba(58, 255, 115, 0.3)',
                  borderRadius: '4px',
                  color: '#3AFF73',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                50%
              </button>
              <button
                onClick={() => setStakeAmount((walletInfo.balance * 0.75).toFixed(4))}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(58, 255, 115, 0.2)',
                  border: '1px solid rgba(58, 255, 115, 0.3)',
                  borderRadius: '4px',
                  color: '#3AFF73',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                75%
              </button>
              <button
                onClick={() => setStakeAmount((walletInfo.balance - 0.01).toFixed(4))}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(58, 255, 115, 0.2)',
                  border: '1px solid rgba(58, 255, 115, 0.3)',
                  borderRadius: '4px',
                  color: '#3AFF73',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                MAX
              </button>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h4>Staking Options</h4>
          <div className="staking-options">
            {validators.map((validator) => (
              <div key={validator.publicKey} className="validator-option">
                <div className="validator-info">
                  <strong>{validator.name}</strong>
                  <span>{validator.apy}% APY • {validator.commission}% Commission</span>
                </div>
                <button 
                  className="stake-btn" 
                  disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
                  onClick={() => handleStake(validator.publicKey, validator.name)}
                >
                  {isStaking ? 'Staking...' : 'Stake SOL'}
                </button>
              </div>
            ))}
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