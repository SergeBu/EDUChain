// src/AchievementNFT.sol
pragma solidity ^0.8.30;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AchievementNFT is ERC1155 {
    using Strings for uint256;
    
    string private _baseURI;
    
    constructor() ERC1155("") {
        _baseURI = "https://api.example.com/achievements/";
    }
    
    function uri(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(_baseURI, tokenId.toString(), ".json"));
    }

    function awardAchievement(
        address to,
        uint256 id,
        uint256 amount
    ) public {
        _mint(to, id, amount, "");
    }
    
    // Добавьте эту функцию для изменения базового URI
    function setBaseURI(string memory newBaseURI) public {
        _baseURI = newBaseURI;
    }
}