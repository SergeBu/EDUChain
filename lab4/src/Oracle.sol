pragma solidity ^0.8.30;
import "./interfaces/AggregatorV3Interface.sol";

contract Oracle {
    AggregatorV3Interface internal priceFeed;
    uint256 public lastPrediction;
    
    constructor(address _priceFeed) {
        priceFeed = AggregatorV3Interface(_priceFeed);
    }
    
    function predictEDUPrice() public {
        (, int256 price,,,) = priceFeed.latestRoundData();
        // Your prediction logic here
        lastPrediction = uint256(price) * 15 / 10; // Example: 1.5x the price
    }
}