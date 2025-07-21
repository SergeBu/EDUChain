// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import "forge-std/Test.sol";
import "../src/EDUToken.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract EDUTokenTest is Test {
    EDUToken token;
    address admin = address(this); // Test contract as admin
    address studentUser = makeAddr("student");
    address professorUser = makeAddr("professor");
    address investorUser = makeAddr("investor");
    address noRoleUser = makeAddr("noRole");
    
    // Define TestCase struct at contract level
    struct TestCase {
        uint256 amount;
        bool expectSuccess;
        string errorMsg;
    }

    // Define Role enum
    enum Role {
        Student,
        Professor,
        Investor,
        None
    }

    function setUp() public {
        token = new EDUToken();
        
        // Setup roles
        token.grantRole(token.STUDENT_ROLE(), studentUser);
        token.grantRole(token.PROFESSOR_ROLE(), professorUser);
        token.grantRole(token.DEFAULT_ADMIN_ROLE(), admin);
    }

    function testStake() public {
        vm.prank(studentUser);
        token.stake(100);
        assertEq(token.stakes(studentUser), 100);
    }

    function testUnstakeExcess_Reverts() public {
        vm.prank(studentUser);
        token.stake(100);
        vm.prank(studentUser);
        vm.expectRevert("Insufficient stake");
        token.unstake(150);
    }

    function testStake_BoundaryValues() public {
        TestCase[] memory cases = new TestCase[](7);
        cases[0] = TestCase(0, false, "Amount must be > 0");
        cases[1] = TestCase(1, true, "");
        cases[2] = TestCase(2, true, "");
        cases[3] = TestCase(5000, true, "");
        cases[4] = TestCase(9999, true, "");
        cases[5] = TestCase(10000, true, "");
        cases[6] = TestCase(10001, false, "Exceeds max stake");

        for (uint i = 0; i < cases.length; i++) {
            // Create unique user address
            string memory userName = string(abi.encodePacked("student_", Strings.toString(i)));
            address testUser = makeAddr(userName);
            
            // Grant student role
            token.grantRole(token.STUDENT_ROLE(), testUser);

            vm.startPrank(testUser);
            if (cases[i].expectSuccess) {
                token.stake(cases[i].amount);
                assertEq(token.stakes(testUser), cases[i].amount);
            } else {
                vm.expectRevert(bytes(cases[i].errorMsg));
                token.stake(cases[i].amount);
            }
            vm.stopPrank();
            
            // Reset stake for next test
            token.resetUserStake(testUser);
        }
    }
    
    function testFuzz_StakeValidAmount(uint256 amount) public {
        // Limit to valid amounts
		// Ограничиваем диапазон amount в fuzz-тесте
		vm.assume(amount <= 1e30); // Максимальное значение для теста
        vm.assume(amount > 0 && amount <= token.MAX_STAKE());
        
        vm.prank(studentUser);
        token.stake(amount);
        assertEq(token.stakes(studentUser), amount);
    }
    
function _getUserByRole(Role role) private view returns (address) {
    if (role == Role.Student) return studentUser;
    if (role == Role.Professor) return professorUser;
    if (role == Role.Investor) return investorUser;
    return noRoleUser;
}

function testStake_DecisionTable(bool isPaused, uint8 roleUint, uint256 amount) public {
    // Ограничиваем роль допустимыми значениями (0-3)
    vm.assume(roleUint <= uint8(type(Role).max));
    Role role = Role(roleUint);
    
    // Настройка условий
    token.setPaused(isPaused);
    address testUser = _getUserByRole(role);
    
    // Определяем ожидаемый результат
    bool expectSuccess = !isPaused && 
                        (amount > 0 && amount <= token.MAX_STAKE()) && 
                        (role == Role.Student || role == Role.Professor);
    
    string memory expectedError = "";
    if (!expectSuccess) {
        // Важно: порядок проверок должен совпадать с контрактом
        if (role != Role.Student && role != Role.Professor) {
            expectedError = "Access denied";
        } else if (amount == 0) {
            expectedError = "Amount must be > 0";
        } else if (amount > token.MAX_STAKE()) {
            expectedError = "Exceeds max stake";
        } else if (isPaused) {
            expectedError = "Operations paused";
        }
    }

    // Выполнение и валидация
    vm.startPrank(testUser);
    if (expectSuccess) {
        token.stake(amount);
        assertEq(token.stakes(testUser), amount);
    } else {
        vm.expectRevert(bytes(expectedError));
        token.stake(amount);
    }
    vm.stopPrank();
}
}