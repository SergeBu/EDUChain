// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EDUToken is ERC20, AccessControl {
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");
    bytes32 public constant PROFESSOR_ROLE = keccak256("PROFESSOR_ROLE");
    uint256 public constant MAX_STAKE = 10000;
    bool public paused;
  
    mapping(address => uint256) public stakes;
  
    event Staked(address indexed user, uint256 amount);

    constructor() ERC20("EduToken", "EDU") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Минт начальных токенов
    }

    function setPaused(bool _paused) external onlyRole(DEFAULT_ADMIN_ROLE) {
        paused = _paused;
    }

// Обновить функцию stake
function stake(uint256 amount) external {
    require(hasRole(STUDENT_ROLE, msg.sender) || hasRole(PROFESSOR_ROLE, msg.sender), 
        "Access denied: Only Student/Professor");
    require(amount > 0, "Amount must be > 0");
    
    // Конвертируем EDU в wei с учетом decimals
    uint256 maxStakeWei = MAX_STAKE * (10 ** decimals());
     require(amount <= maxStakeWei, "Exceeds max stake");
    
    require(!paused, "Operations paused");
    require(balanceOf(msg.sender) >= amount, "Insufficient balance");
    
    stakes[msg.sender] += amount;
    _transfer(msg.sender, address(this), amount);
    emit Staked(msg.sender, amount);
}

// Добавить функцию для получения decimals
function decimals() public pure override returns (uint8) {
    return 18;
}

	function unstake(uint256 amount) external {
		require(
			hasRole(STUDENT_ROLE, msg.sender) || 
			hasRole(PROFESSOR_ROLE, msg.sender),
			"Access denied"
		);
		require(stakes[msg.sender] >= amount, "Insufficient stake");
		stakes[msg.sender] -= amount;
		_transfer(address(this), msg.sender, amount);
	}

    function resetUserStake(address user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        stakes[user] = 0;
    }
    
    function mint(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _mint(to, amount);
    }
	function getStake(address user) external view returns (uint256) {
    return stakes[user];
}
}