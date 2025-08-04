// PriceFeed.sol
pragma solidity ^0.8.30;

import "./interfaces/AggregatorV3Interface.sol";

contract PriceFeed {
    AggregatorV3Interface internal priceFeed;
    uint80 public lastRoundId;
    uint256 public constant STALE_DELAY = 1 hours;

    constructor(address _priceFeed) {
        require(_priceFeed != address(0), "Invalid oracle address");
        priceFeed = AggregatorV3Interface(_priceFeed);
        
        // Инициализация lastRoundId
        (uint80 roundId, , , , ) = priceFeed.latestRoundData();
        lastRoundId = roundId;
    }

    function getEDUPrice() public view returns (int) {
        (
            uint80 roundId, 
            int price,
            ,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        
        // 1. Проверка актуальности данных (без риска underflow)
        require(block.timestamp - updatedAt <= STALE_DELAY, "Stale price data");
        
        // 2. Проверка корректности раунда
        require(answeredInRound >= roundId, "Stale round");
        require(roundId > lastRoundId, "Stale round");
        
        // 3. Проверка валидности цены
        require(price > 0, "Invalid price");
        
        return price;
    }
    
    function updateRoundId() external {
        (uint80 roundId, , , , ) = priceFeed.latestRoundData();
        lastRoundId = roundId;
    }


}