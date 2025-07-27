// src/EDURewards.sol
pragma solidity ^0.8.30;

contract EDURewards {
    mapping(address => uint256) public stakingBalance;
    mapping(address => uint256) public rewards;
    uint256 public rewardRate;
    uint256 public maxReward;

    error ZeroBalance();

    constructor(uint256 _rewardRate, uint256 _maxReward) {
        rewardRate = _rewardRate;
        maxReward = _maxReward;
    }

    // Add this function to allow staking
    function stake(uint256 amount) public {
        stakingBalance[msg.sender] += amount;
    }

    function calculateRewards(address user) public {
        if (stakingBalance[user] == 0) revert ZeroBalance();
        uint256 reward = stakingBalance[user] * rewardRate / 100;
        if (reward > maxReward) reward = maxReward;
        rewards[user] += reward;
    }
}