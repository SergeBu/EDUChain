// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AchievementNFT is ERC1155 {
    using Strings for uint256;
    
    error SoulboundTokenTransferNotAllowed();
    
    constructor() ERC1155("https://api.edu-chain/achievements/") {}

    function awardAchievement(address to, uint256 id, uint256 amount) public {
        require(to != address(0), "Invalid wallet address");
        _mint(to, id, amount, "");
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return string(
            abi.encodePacked(super.uri(0), tokenId.toString(), ".json")
        );
    }

    function setBaseURI(string memory newBaseURI) public {
        _setURI(newBaseURI);
    }

    // Soulbound NFT: запрет трансферов (совместимость с OZ 5.x)
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override {
        // Разрешаем только минт (from == address(0)) и сжигание (to == address(0))
        if (from != address(0) && to != address(0)) {
            revert SoulboundTokenTransferNotAllowed();
        }
        
        super._update(from, to, ids, values);
    }
    
    // Функция сжигания токенов
    function burn(address account, uint256 id, uint256 amount) public {
        require(
            account == _msgSender() || isApprovedForAll(account, _msgSender()),
            "Caller is not owner nor approved"
        );
        
        _burn(account, id, amount);
    }
}