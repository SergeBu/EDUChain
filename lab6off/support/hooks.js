const { setDefaultTimeout } = require('@cucumber/cucumber');
setDefaultTimeout(60 * 1000); // 60 секунд таймаут

beforeAll(async () => {
  // Проверка подключения к Ganache
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  await provider.ready;
});