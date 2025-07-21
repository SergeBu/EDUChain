// test/OracleCoverage.t.sol
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {Oracle} from "../src/Oracle.sol";
import {AggregatorV3Interface} from "../src/interfaces/AggregatorV3Interface.sol";

contract OracleCoverageTest is Test {
    Oracle public predictor;
    AggregatorV3Interface public priceFeed;
    
    function setUp() public {
        // Create a mock price feed address
        address mockPriceFeed = address(0x123);
        
        // Initialize the Oracle contract
        predictor = new Oracle(mockPriceFeed);
        
        // Cast to AggregatorV3Interface for type safety
        priceFeed = AggregatorV3Interface(mockPriceFeed);
    }
    
    function testMLOraclePrediction() public {
        // Mock the price feed response
        vm.mockCall(
            address(priceFeed),
            abi.encodeWithSelector(AggregatorV3Interface.latestRoundData.selector),
            abi.encode(0, 200 * 1e8, 0, 0, 0) // 200 USD with 8 decimals
        );
        
        // Make prediction
        predictor.predictEDUPrice();
        
        // Verify prediction
        assertEq(predictor.lastPrediction(), 300 * 1e8); // 300 USD with 8 decimals
    }
    
    function testOracleFailure() public {
        // Mock a failed price feed response
        vm.mockCall(
            address(priceFeed),
            abi.encodeWithSelector(AggregatorV3Interface.latestRoundData.selector),
            abi.encode(0, 0, 0, 0, 0) // Invalid price data
        );
        
        // Make prediction
        predictor.predictEDUPrice();
        
        // Verify failure handling
        assertEq(predictor.lastPrediction(), 0);
    }
}