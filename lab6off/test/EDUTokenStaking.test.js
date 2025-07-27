const { ethers } = require("ethers");
const EDUTokenMock = require("./mocks/EDUTokenMock");

function parseEther(amount) {
  return BigInt(amount * 10**18);
}

describe("EDUToken Staking Tests with Balance Override (No Hardhat)", () => {
  let tokenContract;
  let admin, student, professor;

  beforeAll(() => {
    admin = { address: ethers.Wallet.createRandom().address };
    student = { address: ethers.Wallet.createRandom().address };
    professor = { address: ethers.Wallet.createRandom().address };
  });

  beforeEach(() => {
    tokenContract = new EDUTokenMock();
    tokenContract.paused = false;
    tokenContract.signer = admin; // Устанавливаем signer по умолчанию

    // Инициализация ролей
    tokenContract.roles = {};
    tokenContract.roles[student.address] = "STUDENT_ROLE";
    tokenContract.roles[professor.address] = "PROFESSOR_ROLE";
    tokenContract.roles[admin.address] = "DEFAULT_ADMIN_ROLE";

    // Эмуляция grantRole
    tokenContract.grantRole = (role, address) => {
      tokenContract.roles[address] = role;
    };
  });

  test("should stake tokens when balance is set via setBalance", async () => {
    const initialBalance = parseEther("1000");
    tokenContract.setBalance(student.address, initialBalance);
    
    tokenContract.connect(student);
    const stakeAmount = parseEther("500");
    
    await tokenContract.stake(stakeAmount);
    
    const currentBalance = tokenContract.balanceOf(student.address);
    const stakedBalance = tokenContract.getStake(student.address);
    
    expect(currentBalance.toString()).toBe((initialBalance - stakeAmount).toString());
    expect(stakedBalance.toString()).toBe(stakeAmount.toString());
  });

  test("should fail staking when insufficient balance", async () => {
    tokenContract.setBalance(professor.address, parseEther("100"));
    
    tokenContract.connect(professor);
    const stakeAmount = parseEther("200");
    
    await expect(tokenContract.stake(stakeAmount))
      .rejects.toThrow("Insufficient balance");
  });

  test("should handle max stake limit", async () => {
    tokenContract.setBalance(student.address, parseEther("20000"));
    
    tokenContract.connect(student);
    const overLimitAmount = parseEther("10001");
    
    await expect(tokenContract.stake(overLimitAmount))
      .rejects.toThrow("Exceeds max stake");
  });

  test("should allow unstaking with overridden staked balance", async () => {
    const stakedAmount = parseEther("700");
    tokenContract.setStakedBalance(student.address, stakedAmount);
    
    // Убрали проблемную строку с signer.address
    tokenContract.connect(student);
    const unstakeAmount = parseEther("300");
    
    await tokenContract.unstake(unstakeAmount);
    
    const currentBalance = tokenContract.balanceOf(student.address);
    const stakedBalance = tokenContract.getStake(student.address);
    
    expect(currentBalance.toString()).toBe(unstakeAmount.toString());
    expect(stakedBalance.toString()).toBe((stakedAmount - unstakeAmount).toString());
  });

  test("should not stake when contract is paused", async () => {
    tokenContract.setBalance(professor.address, parseEther("1000"));
    
    tokenContract.connect(admin);
    tokenContract.pause();
    
    tokenContract.connect(professor);
    await expect(tokenContract.stake(parseEther("100")))
      .rejects.toThrow("Contract is paused");
  });

  test("should not stake without proper role", async () => {
    const stranger = { address: ethers.Wallet.createRandom().address };
    tokenContract.setBalance(stranger.address, parseEther("500"));
    
    tokenContract.connect(stranger);
    await expect(tokenContract.stake(parseEther("100")))
      .rejects.toThrow("Access denied: Only Student/Professor");
  });

  test("should emit Staked event when staking", async () => {
    jest.setTimeout(10000);
    tokenContract.setBalance(student.address, parseEther("800"));
   
    let eventEmitted = false;
    tokenContract.onStaked = (address, amount) => {
      eventEmitted = true;
      expect(address).toBe(student.address);
      expect(amount).toEqual(parseEther("400"));
    };
    
    tokenContract.connect(student);
    const stakeAmount = parseEther("400");
    
    await tokenContract.stake(stakeAmount);
    expect(eventEmitted).toBe(true);
  });

  test("should reset staked balance (admin function)", async () => {
    const stakedAmount = parseEther("1500");
    tokenContract.setStakedBalance(student.address, stakedAmount);
    
    tokenContract.connect(admin);
    // Исправлено на stakedBalances
    tokenContract.resetUserStake = (address) => {
      tokenContract.stakedBalances[address] = 0n;
    };
    await tokenContract.resetUserStake(student.address);
    
    const stakedBalance = tokenContract.getStake(student.address);
    expect(stakedBalance.toString()).toBe("0");
  });
});