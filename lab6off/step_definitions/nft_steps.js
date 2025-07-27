const { Given, When, Then } = require('@cucumber/cucumber');
const { ethers } = require('ethers');
const ipfsClient = require('ipfs-http-client');
const sinon = require('sinon');
const deployContract = require('../support/contract_loader');

// Мокируем IPFS для изоляции тестов
const ipfsMock = {
  add: sinon.stub().resolves({ cid: 'QmRealCID' }),
  pin: {
    ls: sinon.stub().resolves([])
  }
};
sinon.stub(ipfsClient, 'create').returns(ipfsMock);

Given('User {string} completes course {string}', function (userAddress) {
  this.userAddress = userAddress;
  this.courseId = 101;
});

When('System mints achievement NFT', async function () {
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  const accounts = await provider.listAccounts();
  const signer = provider.getSigner(accounts[0]);

  // Деплой контракта
  const NFTFactory = await ethers.getContractFactory("AchievementNFT", signer);
  this.nftContract = await NFTFactory.deploy();
  await this.nftContract.deployed();

  // ... остальной код без изменений
});

Then('Metadata should be pinned to IPFS', async function () {
  // Проверка вызова IPFS
  sinon.assert.calledWith(ipfsMock.add, sinon.match.string);
  
  // Проверка пиннинга
  const pins = await ipfsMock.pin.ls();
  sinon.assert.match(pins, [{
    cid: this.expectedCid,
    type: 'recursive'
  }]);
});

Then('NFT balance should be {int}', async function (expectedBalance) {
  const balance = await this.nftContract.balanceOf(
    this.userAddress, 
    this.courseId
  );
  expect(balance.toNumber()).toBe(expectedBalance);
});