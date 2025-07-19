// test/SmokeTest.t.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";

contract SmokeTest is Test {
    function test_Smoke() public pure {
        // This test doesn't interact with any contract state
        assertTrue(true, "Smoke test passed");
    }
}
