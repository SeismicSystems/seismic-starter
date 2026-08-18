// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {ShieldedVoting} from "../src/ShieldedVoting.sol";

contract ShieldedVotingTest is Test {
    ShieldedVoting public voting;
    address public chairperson = address(this);
    address public voter1 = address(0x11);
    address public voter2 = address(0x22);
    address public voter3 = address(0x33);

    function setUp() public {
        voting = new ShieldedVoting();
    }

    function test_CreateAndVoteConfidentialProposal() public {
        uint256 proposalId = voting.createProposal("Upgrade Seismic TEE Enclave Driver", 3600);
        assertEq(proposalId, 1);

        // Cast shielded votes
        vm.prank(voter1);
        voting.castVote(1, true, suint256(100)); // 100 YES

        vm.prank(voter2);
        voting.castVote(1, false, suint256(40)); // 40 NO

        vm.prank(voter3);
        voting.castVote(1, true, suint256(50));  // 50 YES

        // Fast forward past deadline
        vm.warp(block.timestamp + 3601);

        voting.finalizeProposal(1);

        (, , uint256 revealedYes, uint256 revealedNo, bool finalized, bool passed) = voting.getProposal(1);

        assertEq(revealedYes, 150);
        assertEq(revealedNo, 40);
        assertTrue(finalized);
        assertTrue(passed);
    }

    function test_RevertWhen_DoubleVoting() public {
        voting.createProposal("Funding Privacy Research", 1800);

        vm.prank(voter1);
        voting.castVote(1, true, suint256(50));

        vm.prank(voter1);
        vm.expectRevert(ShieldedVoting.AlreadyVoted.selector);
        voting.castVote(1, true, suint256(20));
    }

    function test_RevertWhen_VoteAfterDeadline() public {
        voting.createProposal("Funding Research", 1800);

        vm.warp(block.timestamp + 1801);

        vm.prank(voter1);
        vm.expectRevert(ShieldedVoting.VotingEnded.selector);
        voting.castVote(1, true, suint256(10));
    }

    function test_RevertWhen_FinalizeBeforeDeadline() public {
        voting.createProposal("Active Vote", 1800);

        vm.expectRevert(ShieldedVoting.VotingActive.selector);
        voting.finalizeProposal(1);
    }
}
