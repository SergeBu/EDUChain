// test/PriceFeed.t.sol
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/PriceFeed.sol";

contract MockPriceFeed is AggregatorV3Interface {
    int public price;
    uint8 public decimals;
    string public description;
    
    function setPrice(int _price) public {
        price = _price;
    }
    
    function latestRoundData() external view returns (
        uint80 roundId,
        int answer,
        uint startedAt,
        uint updatedAt,
        uint80 answeredInRound
    ) {
        return (0, price, 0, 0, 0);
    }
    
    // Остальные методы интерфейса...
}

contract PriceFeedTest is Test {
    PriceFeed priceFeed;
    MockPriceFeed mockOracle;
    
    function setUp() public {
        mockOracle = new MockPriceFeed();
        priceFeed = new PriceFeed(address(mockOracle));
    }
    
    function testGetEDUPrice() public {
        // Устанавливаем ожидаемое значение
        int expectedPrice = 250 * 10**8; // $250 с 8 знаками
        mockOracle.setPrice(expectedPrice);
        
        // Проверяем
        int actualPrice = priceFeed.getEDUPrice();
        assertEq(actualPrice, expectedPrice);
    }
}