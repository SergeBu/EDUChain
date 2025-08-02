class EDUTokenMock {
  constructor() {
    this.balances = {};
    this.stakedBalances = {};
    this.paused = false;
    this.maxStakeAmount = BigInt(1000 * 10**18);
    this.roles = {};
    this.signer = null;
  }

  connect(signer) {
    this.signer = signer;
    return this;
  }

  setBalance(address, amount) {
    this.balances[address] = amount;
  }

  setStakedBalance(address, amount) {
    this.stakedBalances[address] = amount;
  }

  balanceOf(address) {
    return this.balances[address] || 0n;
  }

  getStake(address) {
    return this.stakedBalances[address] || 0n;
  }

  pause() {
    this.paused = true;
  }

  unpause() {
    this.paused = false;
  }

  async stake(amount) {
    if (this.paused) throw new Error("Contract is paused");
    if (!this.roles[this.signer.address]) {
      throw new Error("Access denied: Only Student/Professor");
    }
    const balance = this.balances[this.signer.address] || 0n;
    if (balance < amount) throw new Error("Insufficient balance");
    if (amount > this.maxStakeAmount) throw new Error("Exceeds max stake");
    
    this.balances[this.signer.address] = balance - amount;
    this.stakedBalances[this.signer.address] = 
      (this.stakedBalances[this.signer.address] || 0n) + amount;
    
    if (this.onStaked) this.onStaked(this.signer.address, amount);
  }

  async unstake(amount) {
    const staked = this.stakedBalances[this.signer.address] || 0n;
    if (staked < amount) throw new Error("Insufficient staked balance");
    
    this.stakedBalances[this.signer.address] = staked - amount;
    this.balances[this.signer.address] = 
      (this.balances[this.signer.address] || 0n) + amount;
  }
}

module.exports = EDUTokenMock;