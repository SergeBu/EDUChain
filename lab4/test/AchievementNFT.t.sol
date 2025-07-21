// test/AchievementNFT.t.sol
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/AchievementNFT.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AchievementNFTTest is Test {
    using Strings for uint256;
    
    AchievementNFT nft;
    address admin = address(this);
    address user = address(0x1);
    uint256 tokenId = 1;
    uint256 amount = 1;

    function setUp() public {
        nft = new AchievementNFT();
    }

    // Исправленное название функции
    function testAwardAchievement() public {
        nft.awardAchievement(user, tokenId, amount);
        
        uint256 balance = nft.balanceOf(user, tokenId);
        assertEq(balance, amount);
    }

    function testSetBaseURI() public {
        string memory newBaseURI = "https://new-api.example.com/achievements/";
        nft.setBaseURI(newBaseURI);
        
        string memory tokenURI = nft.uri(tokenId);
        string memory expectedURI = string(abi.encodePacked(newBaseURI, tokenId.toString(), ".json"));
        
        assertEq(tokenURI, expectedURI);
    }

    function testURI_Format() public view {
        string memory baseURI = "https://api.example.com/achievements/";
        string memory expectedURI = string(abi.encodePacked(baseURI, tokenId.toString(), ".json"));
        
        string memory tokenURI = nft.uri(tokenId);
        assertEq(tokenURI, expectedURI);
    }
}