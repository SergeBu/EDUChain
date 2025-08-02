// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EDUToken is ERC20, AccessControl {
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");
    bytes32 public constant PROFESSOR_ROLE = keccak256("PROFESSOR_ROLE");
    
    mapping(address => uint256) public stakedBalance;
    uint256 public maxStake = 10000 ether; // Автоматически создаст getter maxStake()
    bool public paused;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);

    uint256 public constant MAX_SUPPLY = 1e9 * 1e18; // 1 billion tokens

    constructor() ERC20("EDU Token", "EDU") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setPaused(bool _paused) external onlyRole(DEFAULT_ADMIN_ROLE) {
        paused = _paused;
    }

    function stake(uint256 amount) public {
        require(!paused, "Contract is paused");
        require(hasRole(STUDENT_ROLE, msg.sender) || hasRole(PROFESSOR_ROLE, msg.sender), 
                "Access denied: Only Student/Professor");
        require(amount > 0, "Amount must be > 0");
        require(amount <= maxStake, "Exceeds max stake");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _transfer(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }

    function unstake(uint256 amount) public {
        require(!paused, "Contract is paused");
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        stakedBalance[msg.sender] -= amount;
        _transfer(address(this), msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }
    
    function resetUserStake(address user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        stakedBalance[user] = 0;
    }
    
    function mint(address to, uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    function getStake(address user) external view returns (uint256) {
        return stakedBalance[user];
    }
}