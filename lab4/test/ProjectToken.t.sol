import "forge-std/Test.sol";
import "../src/ProjectToken.sol";

contract ProjectTokenTest is Test {
    ProjectToken projectToken;
    address admin = makeAddr("admin");
    address creator = makeAddr("creator");
    
    function setUp() public {
        vm.prank(admin);
        projectToken = new ProjectToken();
    }

    function testProjectMinting() public {
        vm.prank(admin);
        uint256 tokenId = projectToken.mintProject(creator, 100_000, 5);
        
        assertEq(projectToken.ownerOf(tokenId), creator);
        assertEq(projectToken.projects(tokenId).royaltyRate, 5);
    }
}
