// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/EDUToken6.sol";

contract EDUTokenTest is Test {
    AchievementNFT nft;
    address student = address(0x123);
    uint256 constant COURSE_ID = 101;
    string constant IPFS_HASH = "QmMeta1";

    function setUp() public {
        nft = new AchievementNFT();
    }

    function testAwardAchievement() public {
        nft.awardAchievement(student, COURSE_ID, IPFS_HASH);
        assertEq(nft.balanceOf(student, COURSE_ID), 1);
    }

    function testDuplicateMintReverts() public {
        nft.awardAchievement(student, COURSE_ID, IPFS_HASH);
        vm.expectRevert("Already awarded");
        nft.awardAchievement(student, COURSE_ID, IPFS_HASH);
    }
}