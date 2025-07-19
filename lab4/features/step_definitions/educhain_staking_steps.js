const { Given, When, Then } = require('@cucumber/cucumber');
const { ethers } = require('ethers');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const EDUTokenArtifact = require('../../out/EDUToken.sol/EDUToken.json');

// Глобальные переменные для хранения состояния
let provider, token, accounts, admin;
const userWallets = {};
const loadArtifact = () => {
  const artifactPath = path.join(__dirname, '../../out/EDUToken.sol/EDUToken.json');
  return JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
};
Given('Контракт EDUToken развернут в сети Polygon Mumbai', { timeout: 30000 }, async function () {
    const port = process.env.ANVIL_PORT || 8545;
    const rpcUrl = `http://localhost:${port}`;
    
    // Проверка подключения через ethers
    const testProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
    try {
        const blockNumber = await testProvider.getBlockNumber();
        console.log(`Подключение успешно, текущий блок: ${blockNumber}`);
    } catch (error) {
        console.error("Ошибка подключения к Anvil:", error);
        throw error;
    }
    // Подключаемся к локальному Anvil
	const EDUTokenArtifact = loadArtifact();
    provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    
    // Получаем аккаунты
    accounts = await provider.listAccounts();
    admin = new ethers.Wallet(accounts[0].privateKey, provider);
    
    // Деплоим контракт
    const factory = new ethers.ContractFactory(
        EDUTokenArtifact.abi,
        EDUTokenArtifact.bytecode.object,
        admin
    );
    token = await factory.deploy();
    await token.deployed();
    
    // Сохраняем адрес контракта
    this.tokenAddress = token.address;
});

Given('Контракт не находится в состоянии паузы', async function () {
    await token.connect(admin).setPaused(false);
});

Given('Пользователь {string} имеет роль {string}', async function (userName, role) {
    // Создаем кошелек для пользователя если нужно
    if (!userWallets[userName]) {
        const wallet = ethers.Wallet.createRandom().connect(provider);
        userWallets[userName] = wallet;
    }
    
    const user = userWallets[userName];
    
    // Даем роль
    const roleHash = role === 'Student' 
        ? await token.STUDENT_ROLE() 
        : await token.PROFESSOR_ROLE();
    
    await token.connect(admin).grantRole(roleHash, user.address);
});

Given('Кошелек {string} имеет баланс ≥ {int} EDU', async function (userName) {
    // В текущей реализации баланс не требуется для стейкинга
    // Реализация будет добавлена после интеграции с ERC20
});

Given('Администратор приостановил контракт', async function () {
    await token.connect(admin).setPaused(true);
});

When('Пользователь {string} вызывает метод stake\\({int})', async function (userName, amount) {
    const user = userWallets[userName];
    this.user = user;
    
    try {
        const tx = await token.connect(user).stake(amount);
        await tx.wait();
        this.error = null;
    } catch (error) {
        this.error = error;
    }
});

When('Пользователь {string} вызывает метод stake\\(amount)', async function (userName, dataTable) {
    const user = userWallets[userName];
    this.results = [];
    
    for (const row of dataTable.hashes()) {
        const amount = parseInt(row.amount);
        try {
            const tx = await token.connect(user).stake(amount);
            await tx.wait();
            this.results.push({ 
                amount, 
                success: true, 
                error: null 
            });
        } catch (error) {
            this.results.push({ 
                amount, 
                success: false, 
                error: error.message 
            });
        }
    }
});

Then('Баланс стейкинга {string} увеличивается на {int} EDU', async function (userName, amount) {
    const user = userWallets[userName];
    const stake = await token.stakes(user.address);
    expect(stake.toNumber()).to.equal(amount);
});

Then('Событие Staked эмитируется с параметрами \\({string}, {int})', async function () {
    // TODO: Реализовать после добавления событий в контракт
});

Then('Транзакция отменена с ошибкой {string}', async function (expectedError) {
    expect(this.error).to.not.be.null;
    expect(this.error.message).to.include(expectedError);
});

Then('Баланс стейкинга {string} не изменяется', async function (userName) {
    const user = userWallets[userName];
    const stake = await token.stakes(user.address);
    expect(stake.toNumber()).to.equal(0);
});

Then('Ожидаемые результаты:', function (dataTable) {
    const expectedResults = dataTable.hashes();
    
    for (let i = 0; i < expectedResults.length; i++) {
        const expected = expectedResults[i];
        const actual = this.results[i];
        
        if (expected['ожидаемый результат'] === 'успешно') {
            expect(actual.success).to.be.true;
        } else {
            expect(actual.success).to.be.false;
            expect(actual.error).to.include(expected['сообщение об ошибке']);
        }
    }
});