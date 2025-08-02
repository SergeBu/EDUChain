const { expect } = require('chai');
const { Sequelize, DataTypes } = require('sequelize');

// Инициализация Sequelize с корректным форматом
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:', // <- Вот это исправление
  logging: false
});

const RewardEvent = sequelize.define('RewardEvent', {
  userId: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  txHash: { type: DataTypes.STRING, unique: true }
});

describe('RewardEvent', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  it('should save event to DB', async () => {
    await RewardEvent.create({ 
      userId: '0x123', 
      amount: 500, 
      txHash: '0xabc123' 
    });
    
    const event = await RewardEvent.findOne({ where: { userId: '0x123' } });
    expect(event.amount).to.equal(500);
  });

  after(async () => {
    await sequelize.close();
  });
});