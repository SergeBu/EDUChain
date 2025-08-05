// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract EDUToken {
    mapping(address => uint256) public stakes;

    function stake(uint256 amount) external {
        stakes[msg.sender] += amount;
    }
}