// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import "forge-std/Script.sol";
import "../src/EDUToken.sol";
import "../src/AchievementNFT.sol";

contract DeployScript is Script {
    function run() external {
        string memory privateKeyEnv = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(privateKeyEnv);
        vm.startBroadcast(deployerPrivateKey);
        new EDUToken();
        new AchievementNFT();
        vm.stopBroadcast();
    }
}