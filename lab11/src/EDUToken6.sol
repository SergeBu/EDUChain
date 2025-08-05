// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract AchievementNFT is ERC1155 {
    mapping(address => mapping(uint256 => bool)) public hasAchievement;

    constructor() ERC1155("") {}

    function awardAchievement(
        address student, 
        uint256 courseId, 
        string memory ipfsHash
    ) public {
        require(!hasAchievement[student][courseId], "Already awarded");
        _mint(student, courseId, 1, bytes(ipfsHash));
        hasAchievement[student][courseId] = true;
    }
}