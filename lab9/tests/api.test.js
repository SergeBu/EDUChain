const { expect } = require('chai');
const request = require('supertest');
const app = require('../app');

describe('API /reward', () => {
  it('should return valid txHash', async () => {
    const res = await request(app)
      .post('/api/reward')
      .send({ userId: '0x123', amount: 500 });
    
    expect(res.status).to.equal(200);
    expect(res.body.txHash).to.match(/^0x[a-f0-9]{64}$/);
  });
});