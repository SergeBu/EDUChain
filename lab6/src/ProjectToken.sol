// src/ProjectToken.sol
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ProjectToken is Ownable {
    struct Project {
        uint256 royaltyRate;
        uint256 fundingGoal;
    }
    
    mapping(uint256 => Project) public projects;
    
    // Add constructor with initial owner
    constructor() Ownable(msg.sender) {}
    
    function createProject(
        uint256 tokenId, 
        uint256 royaltyRate, 
        uint256 fundingGoal
    ) external onlyOwner {
        projects[tokenId] = Project({
            royaltyRate: royaltyRate,
            fundingGoal: fundingGoal
        });
    }
}