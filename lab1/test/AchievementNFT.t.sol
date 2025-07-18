// test/AchievementNFT.t.sol
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {Strings} from "@openzeppelin/@openzeppelin/utils/Strings.sol";
import {AchievementNFT} from "../src/AchievementNFT.sol";
import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract AchievementNFTTest is Test , IERC1155Receiver  {
    using Strings for uint256;
    
    AchievementNFT nft;

    function setUp() public {
        nft = new AchievementNFT();
    }

    function testURI() public {
        uint256 tokenId = 1;
        uint256 amount = 1;
        
        // Используем awardAchievement вместо mint
        nft.awardAchievement(address(this), tokenId, amount);
        
        string memory tokenIdStr = tokenId.toString();
        string memory expected = string(
            abi.encodePacked("https://api.example.com/achievements/", tokenIdStr, ".json")
        );
        
        // Проверяем uri() вместо tokenURI()
        assertEq(nft.uri(tokenId), expected);
    }
	
	    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    // Optional: ERC165 interface support
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId;
    }
}