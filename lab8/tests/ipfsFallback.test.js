const { expect } = require('chai');
const sinon = require('sinon');
const { uploadMetadata, ipfsClient, s3Client } = require('../services/ipfsService6');

describe('IPFS Fallback', () => {
  let ipfsAddStub;
  let s3SendStub;

  before(() => {
    // Мокируем методы клиентов
    ipfsAddStub = sinon.stub(ipfsClient, 'add').rejects(new Error('IPFS down'));
    s3SendStub = sinon.stub(s3Client, 'send').resolves({});
  });

  after(() => {
    sinon.restore();
  });

  it('should use S3 when IPFS fails', async () => {
    const metadata = { name: 'Blockchain Course' };
    const result = await uploadMetadata(metadata);
    
    expect(result).to.have.property('fallbackUrl');
    expect(result.fallbackUrl).to.include('s3://educhain-fallback/metadata/');
    expect(ipfsAddStub.calledOnce).to.be.true;
    expect(s3SendStub.calledOnce).to.be.true;
  });
});