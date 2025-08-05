// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/EDUToken.sol";

contract EDUTokenTest is Test {
    EDUToken token;
    address user1 = address(1);
    address user2 = address(2);

    function setUp() public {
        token = new EDUToken();
    }

    function testRaceCondition() public {
        // Симулируем параллельные вызовы
        vm.startPrank(user1);
        token.stake(100);
        vm.stopPrank();

        vm.startPrank(user2);
        token.stake(100);
        vm.stopPrank();

        // Проверяем итоговый баланс
        assertEq(token.stakes(user1), 100);
        assertEq(token.stakes(user2), 100);
    }
}