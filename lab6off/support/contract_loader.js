const fs = require('fs');
const ethers = require('ethers');

module.exports = async () => {
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  return provider.listAccounts();
};
  timeout: 30000, // Увеличиваем таймаут
  network: {
    name: 'ganache',
    chainId: 1337,
    ensAddress: undefined
  }
});
  const signer = provider.getSigner(0);
  
  // Загрузка ABI и байткода из сборки
  const artifact = JSON.parse(fs.readFileSync('build/contracts/AchievementNFT.json'));
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  
  return factory.deploy();
};