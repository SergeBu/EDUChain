pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/EDUToken.sol";

contract EDUTokenTest is Test {
    // Define TestCase struct at contract level
    struct TestCase {
        uint256 amount;
        bool expectSuccess;
        string errorMsg;
    }
    
    EDUToken token;
    address admin = address(this);
    address student = address(0x1);
    address professor = address(0x2);
    uint256 initialSupply = 10000 ether;

    function setUp() public {
        token = new EDUToken();
        token.mint(admin, initialSupply);
        token.grantRole(token.STUDENT_ROLE(), student);
        token.grantRole(token.PROFESSOR_ROLE(), professor);
    }

    // ... other test functions ...

  function testStake_BoundaryValues() public {
    uint256 oneToken = 10 ** token.decimals();  // Get 1 token in wei
    TestCase[] memory cases = new TestCase[](7);
    
    // Use token units instead of wei
    cases[0] = TestCase(0, false, "Amount must be > 0");
    cases[1] = TestCase(1 * oneToken, true, "");
    cases[2] = TestCase(2 * oneToken, true, "");
    cases[3] = TestCase(5000 * oneToken, true, "");
    cases[4] = TestCase(9999 * oneToken, true, "");
    cases[5] = TestCase(10000 * oneToken, true, "");
    cases[6] = TestCase(10001 * oneToken, false, "Exceeds max stake");

    for (uint i = 0; i < cases.length; i++) {
        address testUser = address(uint160(i + 100));
        token.grantRole(token.STUDENT_ROLE(), testUser);
        
        // Mint enough tokens (amount + extra for gas)
        token.mint(testUser, cases[i].amount + 1 * oneToken);

        vm.startPrank(testUser);
        if (cases[i].expectSuccess) {
            token.stake(cases[i].amount);
            assertEq(token.stakedBalance(testUser), cases[i].amount);
        } else {
            vm.expectRevert(bytes(cases[i].errorMsg));
            token.stake(cases[i].amount);
        }
        vm.stopPrank();
    }
}
    function testFuzz_StakeValidAmount(uint256 amount) public {
        // Set bounds (1 wei to 100 ether)
        amount = bound(amount, 1, 100 ether);
        
        // Fund student
        token.transfer(student, amount);
        
        vm.prank(student);
        token.stake(amount);
        
        assertEq(token.stakedBalance(student), amount);
    }
   
function testStake_DecisionTable(bool hasRole, uint8 roleType, uint256 amount) public {
    // Установите безопасные границы для суммы
    uint256 maxStakeAmount = token.maxStake();
    uint256 minAmount = 1;
    amount = bound(amount, minAmount, maxStakeAmount);
    
    address user = address(0x123);
    token.mint(user, amount); // Выдаем пользователю токены

    if (hasRole) {
        if (roleType == 0) token.grantRole(token.STUDENT_ROLE(), user);
        else if (roleType == 1) token.grantRole(token.PROFESSOR_ROLE(), user);
    }

    vm.prank(user);
    
    if (hasRole && (roleType == 0 || roleType == 1)) {
        token.stake(amount);
        assertEq(token.stakedBalance(user), amount);
    } else {
        vm.expectRevert("Access denied: Only Student/Professor");
        token.stake(amount);
    }
}
function testUnstake() public {
    // Setup
    uint256 stakeAmount = 50 ether;
    token.transfer(student, 100 ether);
    vm.prank(student);
    token.stake(stakeAmount);
    
    // Test unstake
    uint256 initialBalance = token.balanceOf(student);
    vm.prank(student);
    token.unstake(stakeAmount);
    
    // Verify
    assertEq(token.stakedBalance(student), 0);
    assertEq(token.balanceOf(student), initialBalance + stakeAmount);
}
    function testStakeEmitsEvent() public {
        token.transfer(student, 100 ether);
        
        vm.prank(student);
        vm.expectEmit(true, true, true, true);
        emit EDUToken.Staked(student, 50 ether);
        token.stake(50 ether);
    }
	    function testUnstakeEmitsEvent() public {
        token.transfer(student, 100 ether);
        vm.prank(student);
        token.stake(100 ether);
        
        vm.prank(student);
        vm.expectEmit(true, true, true, true);
        emit EDUToken.Unstaked(student, 50 ether);
        token.unstake(50 ether);
    }
	    // Тест для setPaused
    function testSetPaused() public {
        // Проверяем начальное состояние
        assertEq(token.paused(), false);
        
        // Админ может поставить на паузу
        token.setPaused(true);
        assertEq(token.paused(), true);
        
        // Админ может снять паузу
        token.setPaused(false);
        assertEq(token.paused(), false);
    }

    // Тест на отказ при вызове setPaused не-админом
    function testSetPaused_RevertIfNotAdmin() public {
        address nonAdmin = address(0x3);
        vm.prank(nonAdmin);
        vm.expectRevert();
        token.setPaused(true);
    }

    // Тест для resetUserStake
    function testResetUserStake() public {
        // Создаем стейк
        token.transfer(student, 100 ether);
        vm.prank(student);
        token.stake(50 ether);
        assertEq(token.stakedBalance(student), 50 ether);
        
        // Сбрасываем стейк
        token.resetUserStake(student);
        assertEq(token.stakedBalance(student), 0);
    }

    // Тест на отказ при вызове resetUserStake не-админом
    function testResetUserStake_RevertIfNotAdmin() public {
        address nonAdmin = address(0x3);
        vm.prank(nonAdmin);
        vm.expectRevert();
        token.resetUserStake(student);
    }

    // Тест для getStake
    function testGetStake() public {
        token.transfer(student, 100 ether);
        vm.prank(student);
        token.stake(30 ether);
        
        uint256 stakeAmount = token.getStake(student);
        assertEq(stakeAmount, 30 ether);
    }

    // Тест на mint при превышении MAX_SUPPLY
    function testMint_ExceedsMaxSupply() public {
        uint256 maxSupply = token.MAX_SUPPLY();
        uint256 currentSupply = token.totalSupply();
        uint256 excessAmount = maxSupply - currentSupply + 1;
        
        vm.expectRevert("Exceeds max supply");
        token.mint(admin, excessAmount);
    }

    // Тест на стейк при паузе контракта
    function testStake_RevertWhenPaused() public {
        token.setPaused(true);
        
        token.transfer(student, 100 ether);
        vm.prank(student);
        vm.expectRevert("Contract is paused");
        token.stake(50 ether);
    }

    // Тест на анстейк при паузе контракта
    function testUnstake_RevertWhenPaused() public {
        // Сначала создаем стейк
        token.transfer(student, 100 ether);
        vm.prank(student);
        token.stake(50 ether);
        
        // Ставим на паузу и пытаемся анстейкать
        token.setPaused(true);
        vm.prank(student);
        vm.expectRevert("Contract is paused");
        token.unstake(50 ether);
    }
}