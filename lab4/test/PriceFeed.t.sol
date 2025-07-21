// test/PriceFeed.t.sol
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {PriceFeed} from "../src/PriceFeed.sol";

contract MockAggregator {
    int private price;
    bool public shouldRevert;
    
    constructor(int _initialPrice) {
        price = _initialPrice;
    }
    
    function setPrice(int _price) public {
        price = _price;
    }
    
    // Добавлена функция для установки флага ошибки
    function setShouldRevert(bool _revert) public {
        shouldRevert = _revert;
    }
    
    function latestRoundData() external view returns (uint80, int, uint, uint, uint80) {
        if (shouldRevert) revert("Oracle error");
        return (0, price, 0, 0, 0);
    }
}

contract PriceFeedTest is Test {
    PriceFeed priceFeed;
    MockAggregator mockAggregator;
    
    function setUp() public {
        mockAggregator = new MockAggregator(100 * 1e8); // $100
        priceFeed = new PriceFeed(address(mockAggregator));
    }
    
    function test_getEDUPrice() public view {
        int price = priceFeed.getEDUPrice();
        assertEq(price, 100 * 1e8, "Should return correct price");
    }
    
    function test_priceUpdate() public {
        mockAggregator.setPrice(150 * 1e8); // $150
        assertEq(priceFeed.getEDUPrice(), 150 * 1e8, "Should update price");
    }
    
    function test_oracleFailure() public {
        // Используем правильное имя функции
        mockAggregator.setShouldRevert(true);
        vm.expectRevert();
        priceFeed.getEDUPrice();
    }
}