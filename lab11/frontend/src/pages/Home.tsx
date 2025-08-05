import { useState } from 'react';

export default function Home() {
  const [connected, setConnected] = useState(false);
  
  return (
    <div>
      <h1>Edu Chain Wallet</h1>
      <input 
        id="wallet-address" 
        placeholder="0x123..." 
      />
      <button 
        id="connect-button"
        onClick={() => setConnected(true)}
      >
        Connect Wallet
      </button>
      {connected && <div className="wallet-connected">Connected!</div>}
    </div>
  );
}