// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract EDUToken is AccessControl {
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");
    bytes32 public constant PROFESSOR_ROLE = keccak256("PROFESSOR_ROLE");
    uint256 public constant MAX_STAKE = 10000;
    bool public paused;
  
    mapping(address => uint256) public stakes;
  
	event Staked(address indexed user, uint256 amount);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setPaused(bool _paused) external {
        paused = _paused;
    }

    function stake(uint256 amount) external {
        require(hasRole(STUDENT_ROLE, msg.sender) || hasRole(PROFESSOR_ROLE, msg.sender), "Access denied");
        require(amount > 0, "Amount must be > 0");
        require(amount <= MAX_STAKE, "Exceeds max stake");
        require(!paused, "Operations paused");
        
        stakes[msg.sender] += amount;
    emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(stakes[msg.sender] >= amount, "Insufficient stake");
        stakes[msg.sender] -= amount;
    }

    function resetUserStake(address user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        stakes[user] = 0;
    }
	function mint(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
    // Реализация ERC20 mint
}
}