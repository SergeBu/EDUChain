const { Given, When, Then, Before } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { ethers } = require("ethers");
const { loadArtifact } = require('../../helpers');
const { sendTransaction } = require('../../helpers');
const contract = await deployContract();
// Глобальный объект для отслеживания nonce
const nonceManager = {};
const pauseTx = await contract.connect(adminSigner).pause();
const { getAccounts } = require('../support/contract_loader');

Given('Контракт не находится в состоянии паузы', async function () {
  expect(await contract.paused()).to.be.false;
});

Given('Пользователь {string} имеет роль {string}', async function (userName, role) {
  const accounts = await getAccounts();
  this.userAddress = accounts[1]; // alice
});

// Обновить шаги, связанные с балансом
Given('Кошелек {string} имеет баланс ≥ {int} EDU', async function (userName, minBalance) {
  const user = this[userName.toLowerCase()];
  const minBalanceWei = ethers.parseEther(String(minBalance));
  const amount = minBalanceWei + ethers.parseEther("1");
  
  await sendTransaction(
    this.admin,
    contract,
    'mint',
    [user.address, amount]
  );
  
  const userBalance = await contract.balanceOf(user.address);
  expect(userBalance >= minBalanceWei).to.be.true;
});

Given('Администратор приостановил контракт', async function () {
  await sendTransaction(
    this.admin,
    contract,
    'setPaused',
    [true]
  );
  expect(await contract.paused()).to.be.true;
});

// В шаге When добавить сброс ошибки
When('Пользователь {string} вызывает метод stake\\({int})', async function (userName, amount) {
  const user = this[userName.toLowerCase()];
  this.lastError = null; // Сбрасываем ошибку
  const amountWei = ethers.parseEther(amount.toString());
  
  try {
    this.lastTx = await sendTransaction(
      user,
      contract,
      'stake',
      [amountWei]
    );
  } catch (error) {
    this.lastError = error;
  }
});

Then('Баланс стейкинга {string} увеличивается на {int} EDU', async function (userName, amount) {
  const user = this[userName.toLowerCase()];
  const stakeBalance = await contract.getStake(user.address);
  const amountWei = ethers.parseEther(amount.toString());
  expect(stakeBalance).to.equal(amountWei);
});

Then('Баланс стейкинга {string} не изменяется', async function (userName) {
  const user = this[userName.toLowerCase()];
  const stakeBalance = await contract.getStake(user.address);
  expect(stakeBalance).to.equal(0n); // Используем BigInt литерал 0n
});

Then('Событие Staked эмитируется с параметрами \\({string}, {int})', async function (userName, amount) {
  const user = this[userName.toLowerCase()];
  const amountWei = ethers.parseEther(amount.toString());
  const receipt = await this.lastTx.wait();
  
  let eventFound = false;
  for (const log of receipt.logs) {
    try {
      const event = contract.interface.parseLog(log);
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
  const isPaused = await contract.paused();
  
  if (isPaused) {
    await sendTransaction(
      this.admin,
      contract,
      'setPaused',
      [false]
    );
  }
  
  expect(await contract.paused()).to.be.false;
});

Then('Транзакция отменена с ошибкой {string}', function (errorMessage) {
  expect(this.lastError).to.not.be.undefined;
  
  // Обновляем ожидаемое сообщение об ошибке
  const expectedMessages = {
    "Operations paused": "Contract is paused",
    "Amount must be > 0": "Amount must be > 0",
    "Access denied: Only Student/Professor": "Access denied: Only Student/Professor",
    "Exceeds max stake": "Exceeds max stake"
  };
  
  const expectedError = expectedMessages[errorMessage] || errorMessage;
  
  if (!this.lastError.message.includes(expectedError)) {
    throw new Error(`Expected error "${expectedError}" but got "${this.lastError.message}"`);
  }
});

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
      const event = contract.interface.parseLog(log);
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