pragma solidity ^0.8.20;
import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";

contract EDUGovernor is Governor, GovernorVotes {
    mapping(uint256 => uint256) public fundingVotes;
    
    constructor(IVotes _token)
        Governor("EDUGovernor")
        GovernorVotes(_token)
    {}

    function voteForFunding(uint256 projectId, uint256 amount) external {
        fundingVotes[projectId] += amount;
    }
}