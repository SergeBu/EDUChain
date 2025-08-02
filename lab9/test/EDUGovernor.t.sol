pragma solidity ^0.8.30;

import {Test, Vm} from "forge-std/Test.sol";
import {EDUGovernor} from "../src/EDUGovernor.sol";
import {MyToken} from "../src/MyToken.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import {ERC20InsufficientBalance} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import "forge-std/console.sol";
address constant alice = address(0x1);
address constant bob = address(0x2);
address constant charlie = address(0x3);
address constant dave = address(0x4);
address constant eve = address(0x5);
address constant frank = address(0x6);

contract EDUGovernorTest is Test {
    EDUGovernor governor;
    MyToken token;
    address member;
    address investor;
    uint256 proposalId;
    
    function setUp() public {
        token = new MyToken();
        governor = new EDUGovernor(token);
        
        member = makeAddr("member");
        investor = makeAddr("investor");
        
        token.mint(member, 5000 * 1e18);
        token.mint(investor, 1000 * 1e18);
        
        // Delegate votes to member
        vm.prank(member);
        token.delegate(member);
        
        // Advance blocks to record delegation
        vm.roll(block.number + 1);
       
        // Create a proposal
        address[] memory targets = new address[](1);
        targets[0] = address(0);
        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = "";
        
        vm.prank(member);
        proposalId = governor.propose(targets, values, calldatas, "Test Proposal");
        
        // Move to voting period
        vm.roll(block.number + governor.votingDelay() + 1);
    }
    
    function test_VoteSuccess() public {
        vm.prank(member);
        governor.castVote(proposalId, 1);
        assertTrue(governor.hasVoted(proposalId, member));
    }
    
    function test_NonMemberVote() public {
        vm.prank(investor);
        vm.expectRevert("No voting power");
        governor.castVote(proposalId, 1);
    }

    function test_VotingPower() public view {
        assertGt(token.getVotes(member), 0, "Member should have voting power");
        assertEq(token.getVotes(investor), 0, "Non-member should have 0 voting power");
    }
    
    function test_votingPeriod() public view {
        assertEq(governor.votingPeriod(), 100);
    }

    function test_COUNTING_MODE() public view {
        assertEq(governor.COUNTING_MODE(), "support=bravo&quorum=for,abstain");
    }

    function test_quorum() public {
        uint256 currentBlock = block.number;
        vm.roll(currentBlock + 10);
        uint256 testBlock = currentBlock + 5;
        
        uint256 supplyAtBlock = token.getPastTotalSupply(testBlock);
        uint256 expectedQuorum = supplyAtBlock * 4 / 100;
        assertEq(governor.quorum(testBlock), expectedQuorum, "Quorum value mismatch");
    }

    function test_proposalSucceeds() public {
        address[] memory targets = new address[](1);
        targets[0] = address(0);
        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = "";
        
        vm.prank(member);
        uint256 newProposalId = governor.propose(targets, values, calldatas, "New Proposal");
        
        vm.roll(block.number + governor.votingDelay() + 1);
        vm.prank(member);
        governor.castVote(newProposalId, 1);
        
        vm.roll(block.number + governor.votingPeriod() + 1);
        assertEq(uint256(governor.state(newProposalId)), 4, "Proposal should succeed");
    }

    function test_voteDelay() public view {
        assertEq(governor.votingDelay(), 1);
    }

    function test_hasVoted() public {
        assertFalse(governor.hasVoted(proposalId, member));
        vm.prank(member);
        governor.castVote(proposalId, 1);
        assertTrue(governor.hasVoted(proposalId, member));
    }

    function test_voteWithoutPower() public {
        address attacker = makeAddr("attacker");
        vm.prank(attacker);
        vm.expectRevert("No voting power");
        governor.castVote(proposalId, 1);
    }
}

contract MyTokenTest is Test {
    MyToken token;

    
    function setUp() public {
        token = new MyToken();
//        alice = makeAddr("alice");
//        bob = makeAddr("bob");
        token.mint(alice, 1000 * 1e18);
        vm.prank(alice);
        token.delegate(alice);

    }

function test_safe32_RevertWhenBlockNumberTooBig() public {
    // Calculate max block number without overflow
    uint256 maxBlock = uint256(type(uint32).max);
    uint256 overflowBlock = maxBlock + 1;
    
    // Set block to max safe value
    vm.roll(maxBlock);
    token.mint(alice, 1);  // Should succeed
    
    // Set block to overflow value
    vm.roll(overflowBlock);
    
    // Should fail with safe32 check
    vm.expectRevert("block number > 32 bits");
    token.mint(alice, 1);
}

    function test_getPastVotes_BeforeFirstCheckpoint() public view {
        uint256 votes = token.getPastVotes(alice, block.number - 1);
        assertEq(votes, 0, "Should return 0 before first checkpoint");
    }

    function test_getPastVotes_BinarySearch() public {
        uint256 block1 = block.number;
        vm.roll(block1 + 10);
        uint256 votes = token.getPastVotes(alice, block1 + 5);
        assertEq(votes, 1000 * 1e18, "Incorrect past votes");
    }

    function test_getPastTotalSupply_BeforeFirstCheckpoint() public view {
        uint256 supply = token.getPastTotalSupply(block.number - 1);
        assertEq(supply, 0, "Should return 0 before first checkpoint");
    }

    function test_getPastTotalSupply_BinarySearch() public {
        uint256 block1 = block.number;
        token.mint(bob, 500 * 1e18);
        vm.roll(block1 + 10);
        vm.prank(bob);
        token.burn(500 * 1e18);
        uint256 supply = token.getPastTotalSupply(block1 + 5);
        assertEq(supply, 1500 * 1e18, "Incorrect past supply");
    }

    function test_checkpointUpdateSameBlock() public {
        vm.startPrank(alice);
        token.delegate(bob);
        token.delegate(alice);
        vm.stopPrank();
        
        (, uint224 votes) = token.checkpoints(alice, 0);
        assertEq(votes, 1000 * 1e18, "Checkpoint not updated");
    }

    function test_transferVoteMovement() public {
        token.mint(bob, 1000 * 1e18);
        vm.prank(alice);
        token.delegate(alice);
        vm.prank(bob);
        token.delegate(bob);
        vm.prank(alice);
        token.transfer(bob, 500 * 1e18);
        assertEq(token.getVotes(alice), 500 * 1e18);
        assertEq(token.getVotes(bob), 1500 * 1e18);
    }

    function test_transferToSelf() public {
        vm.prank(alice);
        token.delegate(alice);
        uint256 initialVotes = token.getVotes(alice);
        vm.prank(alice);
        token.transfer(alice, 100);
        assertEq(token.getVotes(alice), initialVotes, "Votes should not change");
    }

function test_insufficientVotesRevert() public {
    address attacker = makeAddr("attacker");
    token.mint(attacker, 1000 * 1e18);
    
    vm.prank(attacker);
    token.delegate(attacker);
    
    // Get the expected error selector
    bytes4 errorSelector = bytes4(keccak256("ERC20InsufficientBalance(address,uint256,uint256)"));
    
    // Expect the custom error with proper parameters
    vm.expectRevert(
        abi.encodeWithSelector(
            errorSelector,
            attacker,
            1000 * 1e18,
            2000 * 1e18
        )
    );
    vm.prank(attacker);
    token.transfer(bob, 2000 * 1e18);
}

    function test_totalSupplyOverflow() public {
        token.mint(alice, type(uint224).max - 1000 * 1e18);
        vm.expectRevert("votes overflow");
        token.mint(alice, 2000 * 1e18);
    }

    function test_burnFunctionality() public {
        uint256 initialSupply = token.totalSupply();
        vm.prank(alice);
        token.burn(500 * 1e18);
        assertEq(token.totalSupply(), initialSupply - 500 * 1e18);
        assertEq(token.getVotes(alice), 500 * 1e18);
    }

    function test_delegateBySig() public {
        (address signer, uint256 privateKey) = makeAddrAndKey("signer");
        token.mint(signer, 1000 * 1e18);
        
        uint256 nonce = token.nonces(signer);
        uint256 expiry = block.timestamp + 1000;
        
        bytes32 structHash = keccak256(
            abi.encode(
                token.DELEGATION_TYPEHASH(),
                bob,
                nonce,
                expiry
            )
        );
        
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                token.DOMAIN_SEPARATOR(),
                structHash
            )
        );
        
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);
        token.delegateBySig(bob, nonce, expiry, v, r, s);
        assertEq(token.delegates(signer), bob);
    }

    function test_getPastVotesWithBinarySearch() public {
        uint256 block1 = block.number;
        vm.prank(alice);
        token.delegate(bob);
        vm.roll(block1 + 5);
        uint256 votes = token.getPastVotes(bob, block1 + 3);
        assertEq(votes, 1000 * 1e18);
        vm.prank(alice);
        token.delegate(alice);
        assertEq(token.getVotes(alice), 1000 * 1e18);
    }

    function test_getPastTotalSupplyWithBinarySearch() public {
        uint256 block1 = block.number;
        token.mint(bob, 500 * 1e18);
        vm.roll(block1 + 5);
        vm.prank(bob);
        token.burn(500 * 1e18);
        uint256 supply = token.getPastTotalSupply(block1 + 3);
        assertEq(supply, 1500 * 1e18);
    }

    function test_subtractLogic() public {
        vm.prank(alice);
        token.burn(500 * 1e18);
        assertEq(token.totalSupply(), 500 * 1e18);
    }

    function test_DOMAIN_SEPARATOR() public view {
        assertTrue(token.DOMAIN_SEPARATOR() != bytes32(0));
    }
    
    function test_votesOverflow() public {
        address whale = makeAddr("whale");
        token.mint(whale, type(uint224).max);
        vm.prank(whale);
        token.delegate(whale);
        assertEq(token.getVotes(whale), type(uint224).max);
        vm.expectRevert("votes overflow");
        token.mint(whale, 1);
    }

    function test_updateExistingCheckpoint() public {
        vm.prank(alice);
        token.delegate(bob);
        (, uint224 votes) = token.checkpoints(alice, 0);
        assertEq(votes, 0);
        vm.prank(alice);
        token.delegate(alice);
        (, votes) = token.checkpoints(alice, 0);
        assertEq(votes, 1000 * 1e18);
    }
function test_getPastVotes_BinarySearchPath() public {
    // Create multiple checkpoints
    uint256 block1 = block.number;
    
    // Create 5 checkpoints at different blocks
    for (uint i = 1; i <= 5; i++) {
        vm.roll(block1 + i * 10);
        vm.prank(alice);
        token.delegate(i % 2 == 0 ? alice : bob);
    }
    
    // Query a block in the middle (block1 + 25)
    uint256 votes = token.getPastVotes(alice, block1 + 25);
    
    // Should have the votes from the previous checkpoint
    assertEq(votes, 1000 * 1e18);
}
function test_getPastTotalSupply_BinarySearchPath() public {
    uint256 block1 = block.number;
    
    // Create multiple checkpoints
    for (uint i = 1; i <= 5; i++) {
        vm.roll(block1 + i * 10);
        token.mint(bob, 100 * 1e18);
    }
    
    // Query a block in the middle (block1 + 25)
    uint256 supply = token.getPastTotalSupply(block1 + 25);
    
    // Should have supply from previous checkpoint
    assertEq(supply, 1000 * 1e18 + 2 * 100 * 1e18);
}	
// Добавить в конец MyTokenTest

function test_getPastVotes_ExactBlockMatch() public {
    uint256 startBlock = block.number;
    
    // Создаем две контрольные точки
    vm.roll(startBlock + 10);
    vm.prank(alice);
    token.delegate(bob);
    
    vm.roll(startBlock + 20);
    vm.prank(alice);
    token.delegate(charlie);
    
    // Создаем ТОЧНУЮ контрольную точку в блоке 30
    uint256 targetBlock = startBlock + 30;
    vm.roll(targetBlock);
    vm.prank(alice);
    token.delegate(dave);
    
    // Создаем дополнительные точки
    vm.roll(targetBlock + 10);
    vm.prank(alice);
    token.delegate(eve);
    
    // Запрашиваем голоса для ТОЧНОГО блока 30
    vm.roll(targetBlock + 20);
    uint256 votes = token.getPastVotes(dave, targetBlock);
    assertEq(votes, 1000 * 1e18, "Exact block match failed");
}

function test_getPastTotalSupply_ExactBlockMatch() public {
    uint256 startBlock = block.number;
    
    // Создаем несколько минтов
    vm.roll(startBlock + 10);
    token.mint(bob, 500 * 1e18);
    
    // Создаем ТОЧНУЮ контрольную точку в блоке 20
    uint256 targetBlock = startBlock + 20;
    vm.roll(targetBlock);
    token.mint(charlie, 500 * 1e18);
    
    // Создаем дополнительные точки
    vm.roll(targetBlock + 10);
    token.mint(dave, 500 * 1e18);
    
    // Запрашиваем общее предложение для ТОЧНОГО блока 20
    vm.roll(targetBlock + 20);
    uint256 supply = token.getPastTotalSupply(targetBlock);
    assertEq(supply, 2000 * 1e18, "Exact block match failed");
}

function test_getPastVotes_ExactBlockMatchInBinarySearch() public {
    uint256 startBlock = block.number;
    
    // Создаем несколько делегирований для формирования массива точек
    for (uint i = 1; i <= 5; i++) {
        vm.roll(startBlock + i * 10);
        vm.prank(alice);
        token.delegate(address(uint160(i))); // Случайные делегаты
    }
    
    // Целевой блок (не на границе)
    uint256 targetBlock = startBlock + 55;
    vm.roll(targetBlock);
    vm.prank(alice);
    token.delegate(dave);
    
    // Создаем дополнительные точки после целевой
    for (uint i = 6; i <= 10; i++) {
        vm.roll(startBlock + i * 10);
        vm.prank(alice);
        token.delegate(address(uint160(i)));
    }
    
    // Запрашиваем голоса для ТОЧНО целевого блока
    vm.roll(startBlock + 200);
    uint256 votes = token.getPastVotes(dave, targetBlock);
    assertEq(votes, 1000 * 1e18, "Exact block in binary search failed");
}
function test_getPastTotalSupply_ExactBlockMatchInBinarySearch() public {
    uint256 startBlock = block.number;
    
    // Create multiple checkpoints
    for (uint i = 1; i <= 5; i++) {
        vm.roll(startBlock + i * 10);
        token.mint(address(uint160(i)), 100 * 1e18);
    }
    
    // Create target checkpoint at non-boundary block
    uint256 targetBlock = startBlock + 55;
    vm.roll(targetBlock);
    token.mint(alice, 500 * 1e18);
    
    // Create more checkpoints
    for (uint i = 6; i <= 10; i++) {
        vm.roll(startBlock + i * 10);
        token.mint(address(uint160(i)), 100 * 1e18);
    }
    
    // Advance to future block
    vm.roll(startBlock + 200);
    
    // Query exact target block
    uint256 supply = token.getPastTotalSupply(targetBlock);
    assertEq(supply, 1500 * 1e18 + 500 * 1e18, "Exact block match failed");
}
// Add to MyTokenTest contract

function test_getPastVotes_ExactBlockMatchSimple() public {
    uint256 startBlock = block.number;
    
    // Create checkpoint at block 10
    vm.roll(startBlock + 10);
    vm.prank(alice);
    token.delegate(bob);
    
    // Create checkpoint at block 20
    vm.roll(startBlock + 20);
    vm.prank(alice);
    token.delegate(charlie);
    
    // Advance to block 30
    vm.roll(startBlock + 30);
    
    // Query exact block 20
    uint256 votes = token.getPastVotes(charlie, startBlock + 20);
    assertEq(votes, 1000 * 1e18);
}

function test_getPastTotalSupply_ExactBlockMatchSimple() public {
    uint256 startBlock = block.number;
    
    // Create checkpoint at block 10
    vm.roll(startBlock + 10);
    token.mint(bob, 500 * 1e18);
    
    // Create checkpoint at block 20
    vm.roll(startBlock + 20);
    token.mint(charlie, 500 * 1e18);
    
    // Advance to block 30
    vm.roll(startBlock + 30);
    
    // Query exact block 20
    uint256 supply = token.getPastTotalSupply(startBlock + 20);
    assertEq(supply, 1500 * 1e18 + 500 * 1e18);
}
}