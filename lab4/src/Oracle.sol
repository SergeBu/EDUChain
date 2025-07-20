pragma solidity ^0.8.20;
import "./interfaces/AggregatorV3Interface.sol"; // Убрать лишние кавычки

contract EDUOracle {
    AggregatorV3Interface internal priceFeed;
    address public admin;
    
    constructor(address _priceFeed) {
        priceFeed = AggregatorV3Interface(_priceFeed);
        admin = msg.sender;
    }

    function getPredictedPrice() external view returns (int) {
        (, int price, , , ) = priceFeed.latestRoundData();
        return price * 2; // Упрощенная ML-логика
    }
}