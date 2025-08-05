module.exports = (sequelize, DataTypes) => {
  return sequelize.define('RewardEvent', {
    userId: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    txHash: { type: DataTypes.STRING, unique: true }
  });
};