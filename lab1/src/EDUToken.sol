// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract EDUToken {
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    mapping(address => uint256) public stakes;

    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        stakes[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(amount <= stakes[msg.sender], "Insufficient stake");
        stakes[msg.sender] -= amount;
        emit Unstaked(msg.sender, amount);
    }
}