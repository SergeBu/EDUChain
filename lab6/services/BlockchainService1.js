const ethers = require('ethers');

const ABI = [
  "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
];

class BlockchainService {
  constructor(provider, contractAddress) {
    try {
      // More flexible provider validation
      if (!provider || typeof provider !== 'object') {
        throw new Error('Provider must be an object');
      }
      
      // Validate contract address format
      if (!contractAddress || !ethers.isAddress(contractAddress)) {
        throw new Error(`Invalid contract address: ${contractAddress}`);
      }
      
      this.provider = provider;
      this.contract = new ethers.Contract(contractAddress, ABI, this.provider);
    } catch (error) {
      throw new Error(`Service initialization failed: ${error.message}`);
    }
  }
  // ... rest of code ...

	async getTokenPrice() {
	  try {
		// Get price data from oracle as array
		const result = await this.contract.latestRoundData();
		
		// Destructure array elements
		const roundId = result[0];
		const answer = result[1];
		const startedAt = result[2];
		const updatedAt = result[3];
		const answeredInRound = result[4];
		
		// Convert everything to BigInt
		const currentTime = BigInt(Math.floor(Date.now() / 1000));
		const updatedAtBigInt = BigInt(updatedAt.toString());
		
		// Calculate age of price data
		const dataAge = currentTime - updatedAtBigInt;
		
		// Check for stale data (1 hour = 3600 seconds)
		if (dataAge > 3600n) {
		  throw new Error('Price data is stale');
		}
		
		return answer;
	  } catch (error) {
		// Handle specific ethers decoding errors
		if (error.code === 'BAD_DATA') {
		  throw new Error('Oracle error: Invalid data format');
		}
		
		// Include original error message
		throw new Error(`Oracle error: ${error.message}`);
	  }
	}
}

module.exports = BlockchainService;