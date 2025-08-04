import { useState } from 'react';

export default function Staking() {
  const [staked, setStaked] = useState(false);
  
  return (
    <div>
      <h1>Stake EDU Tokens</h1>
      <input 
        id="amount-input" 
        type="number" 
        placeholder="100" 
      />
      <button 
        id="stake-button"
        onClick={() => setStaked(true)}
      >
        Stake
      </button>
      {staked && <div className="staking-success">Tokens staked!</div>}
    </div>
  );
}