const BlockchainService = require('../services/BlockchainService1');
const ethers = require('ethers');

jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  return {
    ...originalModule,
    JsonRpcProvider: jest.fn(),
    Contract: jest.fn()
  };
});

describe('BlockchainService with Chainlink', () => {
  let blockchainService;
  let mockLatestRoundData;

  beforeEach(() => {

    // Reset mocks and create new service instance
    ethers.JsonRpcProvider.mockClear();
    ethers.Contract.mockClear();
    
    // Create mock contract method
    mockLatestRoundData = jest.fn();
    ethers.Contract.mockImplementation(() => ({
      latestRoundData: mockLatestRoundData
    }));
    
    // Create service instance with valid provider object
	   // Create valid mock provider
  const mockProvider = {
    // Add dummy method to pass validation
    getNetwork: jest.fn().mockResolvedValue({ chainId: 1 })
  };
  const contractAddress = '0x0000000000000000000000000000000000000000'; // Valid address format
    blockchainService = new BlockchainService(
      mockProvider,
      contractAddress
    );
  });

it('should return token price from Chainlink', async () => {
  const currentTime = Math.floor(Date.now() / 1000);
  // Return as array instead of object
  mockLatestRoundData.mockResolvedValue([
    123n,       // roundId
    150000000n, // answer
    0n,         // startedAt
    BigInt(currentTime), // updatedAt
    123n        // answeredInRound
  ]);

  const price = await blockchainService.getTokenPrice();
  expect(price).toEqual(150000000n);
  expect(mockLatestRoundData).toHaveBeenCalled();
});

it('should handle stale price data', async () => {
  const currentTime = Math.floor(Date.now() / 1000);
  const staleTimestamp = currentTime - 4000; // 4000 seconds old
  
  // Return as array instead of object
  mockLatestRoundData.mockResolvedValue([
    123n,
    150000000n,
    0n,
    BigInt(staleTimestamp),
    123n
  ]);

  await expect(blockchainService.getTokenPrice())
    .rejects
    .toThrow('Price data is stale');
});
});