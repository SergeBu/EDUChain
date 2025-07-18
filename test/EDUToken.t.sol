// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import "forge-std/Test.sol";
import "../src/EDUToken.sol";

contract EDUTokenTest is Test {
    EDUToken token;
    address user = makeAddr("user");

    function setUp() public {
        token = new EDUToken();
    }

    function testStake() public {
        vm.prank(user);
        token.stake(100);
        assertEq(token.stakes(user), 100);
    }

    function testUnstakeExcess_Reverts() public {
        vm.prank(user);
        token.stake(100);
        vm.prank(user);
        vm.expectRevert("Insufficient stake");
        token.unstake(150);
    }
	function test_OnlyOwnerCanStake() public {
    vm.prank(address(0x1)); // Подмена адреса
    vm.expectRevert("Ownable: caller is not the owner");
    token.stake(100); // Должен завершиться ошибкой
}
    // +3 теста (всего 5)...
}