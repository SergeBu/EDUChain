const { Before, After } = require('@cucumber/cucumber');
const { ethers } = require('ethers');
const { loadArtifact } = require('../../helpers');

// Глобальный объект для управления nonce
const nonceManager = {};

Before({ tags: '@educhain' }, async function () {
  // Инициализация провайдера - FIX для ethers v6
  this.provider = new ethers.JsonRpcProvider();
  
  // Инициализация аккаунтов
  const privateKeys = [
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"
  ];

  this.signers = privateKeys.map(key => new ethers.Wallet(key, this.provider));
  
  // Инициализация nonce
  for (const signer of this.signers) {
    nonceManager[signer.address] = await this.provider.getTransactionCount(signer.address);
  }

  // Назначение ролей
  [this.admin, this.alice, this.bob, this.carol, this.dave] = this.signers;

  // Загрузка и деплой контракта
  const { abi, bytecode } = await loadArtifact('EDUToken');
  const factory = new ethers.ContractFactory(abi, bytecode, this.admin);
  this.stakingContract = await factory.deploy();
  await this.stakingContract.waitForDeployment();
  this.stakingContractAddress = await this.stakingContract.getAddress();

  // Инициализация ролей
  this.STUDENT_ROLE = await this.stakingContract.STUDENT_ROLE();
  this.PROFESSOR_ROLE = await this.stakingContract.PROFESSOR_ROLE();
  this.ADMIN_ROLE = await this.stakingContract.DEFAULT_ADMIN_ROLE();
  
  // Добавим развертывание NFT контракта
  const { abi: nftAbi, bytecode: nftBytecode } = await loadArtifact('AchievementNFT');
  const nftFactory = new ethers.ContractFactory(nftAbi, nftBytecode, this.admin);
  this.nftContract = await nftFactory.deploy();
  await this.nftContract.waitForDeployment();
  this.nftContractAddress = await this.nftContract.getAddress();

  console.log(`EduchainStaking deployed to: ${this.stakingContractAddress}`);
  console.log(`AchievementNFT deployed to: ${this.nftContractAddress}`);
});

After({ tags: '@educhain' }, async function () {
  // Очистка состояния после сценариев
  delete this.stakingContract;
  delete this.nftContract;
  delete this.signers;
});