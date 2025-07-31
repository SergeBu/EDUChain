// test/ProjectToken.t.sol
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {ProjectToken} from "../src/ProjectToken.sol";

contract ProjectTokenTest is Test {
    ProjectToken projectToken;
    address owner = makeAddr("owner");
    
    function setUp() public {
        vm.prank(owner);
        projectToken = new ProjectToken();
    }
    
    function testRoyaltyRate() public {
        uint256 tokenId = 1;
        vm.prank(owner);
        projectToken.createProject(tokenId, 5, 1000);
        
        // Access struct correctly
        (uint256 royaltyRate, uint256 fundingGoal) = projectToken.projects(tokenId);
        assertEq(royaltyRate, 5);
        assertEq(fundingGoal, 1000);
    }
}