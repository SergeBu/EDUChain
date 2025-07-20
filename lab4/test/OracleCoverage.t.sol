// test/OracleCoverage.t.sol
function testMLOraclePrediction() public {
    // Подготовка мок-оракула
    vm.mockCall(
        address(oracle),
        abi.encodeWithSelector(AggregatorV3Interface.latestRoundData.selector),
        abi.encode(0, 150 * 1e8, 0, 0, 0) // $150
    );
    
    predictor.predictEDUPrice();
    assertEq(predictor.lastPrediction(), 300 * 1e8); // Проверка ML-логики
}

function testOracleFailure() public {
    vm.mockCallRevert(
        address(oracle),
        abi.encodeWithSelector(AggregatorV3Interface.latestRoundData.selector),
        abi.encode("Data unavailable")
    );
    
    vm.expectRevert();
    predictor.predictEDUPrice();
}