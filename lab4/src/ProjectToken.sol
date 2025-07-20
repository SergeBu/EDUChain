pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProjectToken is ERC721, Ownable {
    struct Project {
        uint256 valuation;    // Оценка проекта
        uint256 royaltyRate;  // % роялти (2 = 2%)
    }
    
    uint256 private _tokenIdCounter;
    mapping(uint256 => Project) public projects;
    
    constructor() ERC721("EDUProject", "EDUP") Ownable(msg.sender) {}

    function mintProject(
        address creator,
        uint256 valuation,
        uint256 royaltyRate
    ) external onlyOwner returns (uint256) {
        require(royaltyRate <= 10, "Max royalty 10%");
        
        uint256 tokenId = ++_tokenIdCounter;
        _mint(creator, tokenId);
        
        projects[tokenId] = Project(valuation, royaltyRate);
        return tokenId;
    }
}