import { useState } from 'react';

const Home = () => {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    setIsConnected(true);
  };

  return (
    <div className="home-page">
      <h1>Welcome to EDU Wallet</h1>
      
      <div className="wallet-connect-form">
        <input
          id="wallet-address"
          type="text"
          placeholder="Enter your wallet address"
        />
        <button
          id="connect-button"
          onClick={handleConnect}
        >
          Connect Wallet
        </button>
        
        {isConnected && (
          <div className="wallet-connected">
            Wallet successfully connected!
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;