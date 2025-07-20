// test/DAOCoverage.t.sol
function testVotingMechanism() public {
    dao.vote(1, 5000 * 1e18); // Голосование 5000 EDU
    assertEq(dao.projectFunding(), 5000 * 1e18);
}

function testVotingRights() public {
    vm.prank(nonMember);
    vm.expectRevert("Unauthorized");
    dao.vote(1, 1000 * 1e18);
}