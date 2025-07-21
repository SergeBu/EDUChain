// src/EDUGovernor.sol
pragma solidity ^0.8.30;

import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";
import {GovernorVotes} from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import {GovernorVotesQuorumFraction} from "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

contract EDUGovernor is Governor, GovernorVotes, GovernorVotesQuorumFraction {
    mapping(uint256 => mapping(address => bool)) private _voterStatus;
    
    constructor(IVotes token)
        Governor("EDUGovernor")
        GovernorVotes(token)
        GovernorVotesQuorumFraction(4)
    {}
    
    function votingDelay() public pure override returns (uint256) {
        return 1;
    }

    function votingPeriod() public pure override returns (uint256) {
        return 100;
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }
    
    function COUNTING_MODE() public pure override returns (string memory) {
        return "support=bravo&quorum=for,abstain";
    }

    // Fixed signature - removed unnecessary override specifier
// src/EDUGovernor.sol
function _countVote(
    uint256 proposalId,
    address account,
    uint8,   // support (unused)
    uint256 weight,
    bytes memory // params (unused)
) internal override {
    // Require voting power > 0
    require(weight > 0, "No voting power");
    
    _voterStatus[proposalId][account] = true;
}

    function _quorumReached(uint256) internal pure override returns (bool) {
        return true;
    }

    function _voteSucceeded(uint256) internal pure override returns (bool) {
        return true;
    }
    
    function hasVoted(uint256 proposalId, address account) public view override returns (bool) {
        return _voterStatus[proposalId][account];
    }
}