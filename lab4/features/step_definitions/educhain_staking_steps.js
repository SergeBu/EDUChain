const { Given, When, Then, Before } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { ethers } = require("ethers");
const fs = require('fs');
const path = require('path');

// Глобальный объект для отслеживания nonce
const nonceManager = {};

Before(async function () {
  // Инициализация провайдера
  this.provider = new ethers.JsonRpcProvider("http://localhost:8545");
  
  // Получаем аккаунты
  this.accounts = await this.provider.listAccounts();
  
  // Приватные ключи для Anvil
  const privateKeys = [
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // admin
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // alice
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // bob
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", // carol
    "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"  // dave
  ];
  
  this.signers = [];
  for (let i = 0; i < privateKeys.length; i++) {
    const wallet = new ethers.Wallet(privateKeys[i], this.provider);
    this.signers.push(wallet);
    
    // Инициализируем nonce для каждого аккаунта
    nonceManager[wallet.address] = await this.provider.getTransactionCount(wallet.address, 'latest');
  }
  
  // Сохраняем пользователей по именам
  this.admin = this.signers[0];
  this.alice = this.signers[1];
  this.bob = this.signers[2];
  this.carol = this.signers[3];
  this.dave = this.signers[4];
  
  // Сброс состояния
  this.contract = null;
  this.lastTx = null;
  this.lastError = null;
});

Before({ tags: "@requires_contract" }, async function () {
  const artifactPath = path.join(process.cwd(), 'out', 'EDUToken.sol', 'EDUToken.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const bytecode = artifact.bytecode.object || artifact.bytecode;
  
  // Используем nonceManager для админа
  const nonce = nonceManager[this.admin.address];
  
  const tx = await this.admin.sendTransaction({
    data: bytecode,
    gasLimit: 10_000_000,
    nonce
  });
  
  const receipt = await tx.wait();
  this.contractAddress = receipt.contractAddress;
  nonceManager[this.admin.address]++; // Увеличиваем nonce
  
  this.contract = new ethers.Contract(
    this.contractAddress,
    artifact.abi,
    this.admin
  );
  
  // Инициализация хешей ролей
  this.STUDENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("STUDENT_ROLE"));
  this.PROFESSOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PROFESSOR_ROLE"));
  this.ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DEFAULT_ADMIN_ROLE"));
  this.INVESTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("INVESTOR_ROLE"));
});

// Общий метод для отправки транзакций с управлением nonce
async function sendTransaction(signer, contract, methodName, args) {
  const address = signer.address;
  const nonce = nonceManager[address];
  
  let tx;
  if (contract) {
    tx = await contract.connect(signer)[methodName](...args, { nonce });
  } else {
    // Для простых транзакций (например, развертывание)
    tx = await signer.sendTransaction({ ...args, nonce });
  }
  
  await tx.wait();
  nonceManager[address]++; // Увеличиваем nonce после успешной транзакции
  return tx;
}

Given('Контракт не находится в состоянии паузы', async function () {
  expect(await this.contract.paused()).to.be.false;
});

Given('Пользователь {string} имеет роль {string}', async function (userName, roleName) {
  const user = this[userName.toLowerCase()];
  let role;
  
  switch(roleName) {
    case 'Student': role = this.STUDENT_ROLE; break;
    case 'Professor': role = this.PROFESSOR_ROLE; break;
    case 'Admin': role = this.ADMIN_ROLE; break;
    case 'Investor': role = this.INVESTOR_ROLE; break;
    default: throw new Error(`Unknown role: ${roleName}`);
  }
  
  await sendTransaction(
    this.admin,
    this.contract,
    'grantRole',
    [role, user.address]
  );
});

// Обновить шаги, связанные с балансом
Given('Кошелек {string} имеет баланс ≥ {int} EDU', async function (userName, minBalance) {
  const user = this[userName.toLowerCase()];
  const minBalanceWei = ethers.parseEther(String(minBalance));
  const amount = minBalanceWei + ethers.parseEther("1");
  
  await sendTransaction(
    this.admin,
    this.contract,
    'mint',
    [user.address, amount]
  );
  
  const userBalance = await this.contract.balanceOf(user.address);
  expect(userBalance >= minBalanceWei).to.be.true;
});

Given('Администратор приостановил контракт', async function () {
  await sendTransaction(
    this.admin,
    this.contract,
    'setPaused',
    [true]
  );
  expect(await this.contract.paused()).to.be.true;
});

// В шаге When добавить сброс ошибки
When('Пользователь {string} вызывает метод stake\\({int})', async function (userName, amount) {
  const user = this[userName.toLowerCase()];
  this.lastError = null; // Сбрасываем ошибку
  const amountWei = ethers.parseEther(amount.toString());
  
  try {
    this.lastTx = await sendTransaction(
      user,
      this.contract,
      'stake',
      [amountWei]
    );
  } catch (error) {
    this.lastError = error;
  }
});

Then('Баланс стейкинга {string} увеличивается на {int} EDU', async function (userName, amount) {
  const user = this[userName.toLowerCase()];
  const stakeBalance = await this.contract.getStake(user.address);
  const amountWei = ethers.parseEther(amount.toString());
  expect(stakeBalance).to.equal(amountWei);
});

Then('Баланс стейкинга {string} не изменяется', async function (userName) {
  const user = this[userName.toLowerCase()];
  const stakeBalance = await this.contract.getStake(user.address);
  expect(stakeBalance).to.equal(0n); // Используем BigInt литерал 0n
});

Then('Событие Staked эмитируется с параметрами \\({string}, {int})', async function (userName, amount) {
  const user = this[userName.toLowerCase()];
  const amountWei = ethers.parseEther(amount.toString());
  const receipt = await this.lastTx.wait();
  
  let eventFound = false;
  for (const log of receipt.logs) {
    try {
      const event = this.contract.interface.parseLog(log);
      if (event.name === "Staked" && 
          event.args.user === user.address && 
          event.args.amount == amountWei) {
        eventFound = true;
        break;
      }
    } catch (e) {
      // Игнорируем нерелевантные логи
    }
  }
  
  if (!eventFound) {
    throw new Error(`Event Staked with parameters (${userName}, ${amount}) not found`);
  }
});

Given('Контракт активен', async function () {
  const isPaused = await this.contract.paused();
  
  if (isPaused) {
    await sendTransaction(
      this.admin,
      this.contract,
      'setPaused',
      [false]
    );
  }
  
  expect(await this.contract.paused()).to.be.false;
});

Then('Транзакция отменена с ошибкой {string}', function (errorMessage) {
  expect(this.lastError).to.not.be.undefined;
  
  // Проверяем разные форматы ошибок
  const actualError = this.lastError.message.toLowerCase();
  const expectedError = errorMessage.toLowerCase();
  
  if (!actualError.includes(expectedError)) {
    throw new Error(`Expected error "${errorMessage}" but got "${this.lastError.message}"`);
  }
});
// Исправленные шаги
Then('успешно', function () {
  expect(this.lastError).to.be.oneOf([null, undefined]);
});

Then('ошибка', function () {
  expect(this.lastError).to.not.be.oneOf([null, undefined]);
});

// Обновить шаг проверки сообщения об ошибке
Then('сообщение об ошибке содержит {string}', function (errorMessage) {
  if (errorMessage === '') {
    // Для пустого сообщения - ошибки не должно быть
    expect(this.lastError).to.be.oneOf([null, undefined]);
  } else {
    // Для непустого сообщения - должна быть ошибка
    expect(this.lastError).to.not.be.oneOf([null, undefined]);
    expect(this.lastError.message).to.include(errorMessage);
  }
});

// Добавить этот шаг обратно
Then('Событие Staked эмитируется с параметрами \\(alice, {int})', async function (amount) {
  const amountWei = ethers.parseEther(amount.toString());
  const receipt = await this.lastTx.wait();
  
  let eventFound = false;
  for (const log of receipt.logs) {
    try {
      const event = this.contract.interface.parseLog(log);
      if (event.name === "Staked" && 
          event.args.user === this.alice.address && 
          event.args.amount == amountWei) {
        eventFound = true;
        break;
      }
    } catch (e) {
      // Игнорируем нерелевантные логи
    }
  }
  
  if (!eventFound) {
    throw new Error(`Event Staked with parameters (alice, ${amount}) not found`);
  }
});


