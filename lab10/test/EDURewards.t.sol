// test/EDURewards.t.sol
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/EDURewards.sol";

contract EDURewardsTest is Test {
    EDURewards rewardsContract;
    address testUser = address(0x123);  // Test user address

    function setUp() public {
        rewardsContract = new EDURewards(5, 1000);  // 5% reward rate, max 1000 tokens
    }

    function test_RewardCalculation() public {
        // Set up staking balance as the test user
        vm.prank(testUser);  // Impersonate testUser
        rewardsContract.stake(100);  // Stake 100 tokens
        
        // Calculate rewards
        rewardsContract.calculateRewards(testUser);
        
        // Check rewards
        uint256 calculatedReward = rewardsContract.rewards(testUser);
        assertEq(calculatedReward, 5, "Reward should be 5% of 100");
    }
}