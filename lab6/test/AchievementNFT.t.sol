pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/AchievementNFT.sol";

contract AchievementNFTTest is Test {
    AchievementNFT nft;
    address student1 = makeAddr("student1");
    address student2 = makeAddr("student2");
    uint256 tokenId = 1;

    function setUp() public {
        nft = new AchievementNFT();
        nft.awardAchievement(student1, tokenId, 1);
    }

    function testAwardAchievement() public {
        nft.awardAchievement(student2, 2, 1);
        assertEq(nft.balanceOf(student2, 2), 1);
    }

    // Проверка невозможности передачи
    function testSoulboundTransfer_Reverts() public {
        vm.prank(student1);
        vm.expectRevert(AchievementNFT.SoulboundTokenTransferNotAllowed.selector);
        nft.safeTransferFrom(student1, student2, tokenId, 1, "");
        
        assertEq(nft.balanceOf(student1, tokenId), 1);
        assertEq(nft.balanceOf(student2, tokenId), 0);
    }

    function testBatchTransfer_Reverts() public {
        uint256[] memory ids = new uint256[](1);
        ids[0] = tokenId;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1;

        vm.prank(student1);
        vm.expectRevert(AchievementNFT.SoulboundTokenTransferNotAllowed.selector);
        nft.safeBatchTransferFrom(student1, student2, ids, amounts, "");
    }

    function testMintAndBurn_Allowed() public {
        // Минт разрешен
        nft.awardAchievement(student2, 2, 1);
        assertEq(nft.balanceOf(student2, 2), 1);
        
        // Сжигание разрешено
        vm.prank(student2);
        nft.burn(student2, 2, 1);
        assertEq(nft.balanceOf(student2, 2), 0);
    }
}