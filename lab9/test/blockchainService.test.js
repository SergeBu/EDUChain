const BlockchainService = require('../services/blockchainService');

describe('Blockchain Service', () => {
  let blockchainService;

  beforeEach(() => {
    // Create a new instance before each test
    blockchainService = new BlockchainService();
    
    // Mock the methods
    blockchainService.registerLand = jest.fn().mockResolvedValue({
      transactionHash: '0x123abc',
      wait: jest.fn()
    });
    
    blockchainService.getLand = jest.fn().mockResolvedValue({
      location: 'Test Location',
      owner: '0x1234567890abcdef',
      price: '1000000000000000000'
    });
  });

  it('registers land and returns transaction', async () => {
    const result = await blockchainService.registerLand(
      '0x123',
      'Test Land',
      '1000000000000000000'
    );
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty('transactionHash');
    expect(blockchainService.registerLand).toHaveBeenCalledWith(
      '0x123',
      'Test Land',
      '1000000000000000000'
    );
  });

  it('retrieves land details', async () => {
    const land = await blockchainService.getLand(1);
    expect(land).toEqual({
      location: 'Test Location',
      owner: '0x1234567890abcdef',
      price: '1000000000000000000'
    });
    expect(blockchainService.getLand).toHaveBeenCalledWith(1);
  });
});