pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {PriceFeed} from "../src/PriceFeed.sol";

contract MockAggregator {
    int public price;
    uint80 public roundId;
    uint256 public updatedAt;
    uint8 public errorType; // 0 = no error, 1 = revert, 2 = stale data, 3 = negative price

    constructor(int _initialPrice) {
        price = _initialPrice;
        roundId = 1;
        updatedAt = block.timestamp;
    }

    function setPrice(int _price) public {
        price = _price;
    }

    function setErrorType(uint8 _errorType) public {
        errorType = _errorType;
    }

    function setRoundId(uint80 _roundId) public {
        roundId = _roundId;
    }

    function setUpdatedAt(uint256 _timestamp) public {
        updatedAt = _timestamp;
    }

function latestRoundData() external view returns (uint80, int, uint, uint, uint80) {
    if (errorType == 1) revert("Oracle unreachable");
    
    uint256 timestamp = errorType == 2 ? 1 : updatedAt;
    int currentPrice = errorType == 3 ? -100 * 1e8 : price;
    
    return (roundId, currentPrice, 0, timestamp, roundId);
}
}

contract PriceFeedTest is Test {
    PriceFeed priceFeed;
    MockAggregator mockAggregator;

    function setUp() public {
        mockAggregator = new MockAggregator(100 * 1e8); // $100
        priceFeed = new PriceFeed(address(mockAggregator));
        
        // Инициализация lastRoundId
        priceFeed.updateRoundId();
    }

    function test_getEDUPrice() public {
        // Обновляем roundId для прохождения проверки
        mockAggregator.setRoundId(2);
        int price = priceFeed.getEDUPrice();
        assertEq(price, 100 * 1e8, "Should return correct price");
    }

    function test_priceUpdate() public {
        mockAggregator.setRoundId(2);
        mockAggregator.setPrice(150 * 1e8); // $150
        assertEq(priceFeed.getEDUPrice(), 150 * 1e8, "Should update price");
    }

    function test_oracleUnreachable() public {
        mockAggregator.setRoundId(2);
        mockAggregator.setErrorType(1);
        vm.expectRevert("Oracle unreachable");
        priceFeed.getEDUPrice();
    }

function test_stalePriceData() public {
    // Set block timestamp to 1 hour + 2 seconds
    vm.warp(3602);
    mockAggregator.setRoundId(2);
    mockAggregator.setErrorType(2);
    vm.expectRevert("Stale price data");
    priceFeed.getEDUPrice();
}
    function test_staleRound() public {
        // Устанавливаем текущий roundId
        mockAggregator.setRoundId(2);
        priceFeed.updateRoundId();
        
        // Пытаемся использовать старый roundId
        mockAggregator.setRoundId(1);
        vm.expectRevert("Stale round");
        priceFeed.getEDUPrice();
    }

    function test_negativePrice() public {
        mockAggregator.setRoundId(2);
        mockAggregator.setErrorType(3);
        vm.expectRevert("Invalid price");
        priceFeed.getEDUPrice();
    }

    function test_zeroAddressInitialization() public {
        vm.expectRevert("Invalid oracle address");
        new PriceFeed(address(0));
    }
	
}