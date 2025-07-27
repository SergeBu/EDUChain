const IPFSService = require('../services/ipfsService');

describe('IPFS Service', () => {
  it('uploads to IPFS', async () => {
    // Create mock dependencies
    const mockHelia = {
      createHelia: jest.fn().mockResolvedValue({})
    };

    const mockStrings = {
      strings: jest.fn().mockReturnValue({
        add: jest.fn().mockResolvedValue({
          toString: () => 'mockCid'
        })
      })
    };

    // Create service with injected dependencies
    const ipfsService = new IPFSService(mockHelia, mockStrings);
    const cid = await ipfsService.uploadToIPFS('test data');
    
    // Verify results and calls
    expect(cid).toBe('mockCid');
    expect(mockHelia.createHelia).toHaveBeenCalled();
    expect(mockStrings.strings).toHaveBeenCalled();
    expect(mockStrings.strings().add).toHaveBeenCalledWith('test data');
  });
  
});