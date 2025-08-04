const sinon = require('sinon');
const ethers = require('ethers');
const { expect } = require('expect');
const BlockchainService = require('../services/BlockchainService1');

describe('BlockchainService with Sinon (ethers v6)', () => {
  let blockchainService;
  let latestRoundDataStub;

  beforeEach(() => {
    // Create mock provider with call support
    const mockProvider = {
      _isProvider: true,
      call: sinon.stub().resolves(),
      getNetwork: sinon.stub().resolves({ chainId: 1 })
    };

    // Create service instance
    blockchainService = new BlockchainService(
      mockProvider,
      '0x0000000000000000000000000000000000000000'
    );

    // Stub the contract's latestRoundData method directly
    latestRoundDataStub = sinon.stub();
    blockchainService.contract = {
      latestRoundData: latestRoundDataStub
    };
  });

  it('should fetch current token price', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    latestRoundDataStub.resolves([
      123n,
      150000000n,
      0n,
      BigInt(currentTime),
      123n
    ]);

    const price = await blockchainService.getTokenPrice();
    expect(price).toEqual(150000000n);
  });

  it('should detect stale prices', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    const staleTimestamp = currentTime - 4000;
    
    latestRoundDataStub.resolves([
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

  it('should handle negative prices', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    
    latestRoundDataStub.resolves([
      123n,
      -1234567n, // negative price
      0n,
      BigInt(currentTime),
      123n
    ]);

    const price = await blockchainService.getTokenPrice();
    expect(price).toEqual(-1234567n);
  });

  it('should handle oracle errors', async () => {
    latestRoundDataStub.rejects(new Error('Chainlink feed down'));

    await expect(blockchainService.getTokenPrice())
      .rejects
      .toThrow('Oracle error: Chainlink feed down');
  });
});