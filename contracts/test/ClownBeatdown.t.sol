// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {ClownBeatdown} from "../src/ClownBeatdown.sol";

contract ClownBeatdownTest is Test {
    ClownBeatdown public clownBeatdown;

    function setUp() public {
        clownBeatdown = new ClownBeatdown(2, suint256(0));
    }

    function test_Hit() public {
        clownBeatdown.hit();
        clownBeatdown.hit();
        assertEq(clownBeatdown.revealChaos(), 0);
    }

    function test_Taunt() public {
        clownBeatdown.taunt(suint256(10));
        clownBeatdown.hit();
        clownBeatdown.hit();
        assertEq(clownBeatdown.revealChaos(), 10);
    }

    function test_Reset() public {
        clownBeatdown.hit();
        clownBeatdown.taunt(suint256(2));
        clownBeatdown.hit();
        clownBeatdown.reset();
        assertEq(clownBeatdown.getClownStamina(), 2);
        clownBeatdown.hit();
        clownBeatdown.taunt(suint256(5));
        clownBeatdown.hit();
        assertEq(clownBeatdown.revealChaos(), 5);
    }

    function test_CannotHitWhenDown() public {
        clownBeatdown.hit();
        clownBeatdown.hit();
        vm.expectRevert("CLOWN_ALREADY_DOWN");
        clownBeatdown.hit();
    }

    function test_CannotTauntWhenDown() public {
        clownBeatdown.hit();
        clownBeatdown.taunt(suint256(1));
        clownBeatdown.taunt(suint256(1));
        clownBeatdown.hit();
        vm.expectRevert("CLOWN_ALREADY_DOWN");
        clownBeatdown.taunt(suint256(1));
    }

    function test_CannotRevealWhenStanding() public {
        clownBeatdown.hit();
        clownBeatdown.taunt(suint256(1));
        vm.expectRevert("CLOWN_STILL_STANDING");
        clownBeatdown.revealChaos();
    }

    function test_CannotResetWhenStanding() public {
        vm.expectRevert("CLOWN_STILL_STANDING");
        clownBeatdown.reset();
    }

    function test_ManyActions() public {
        uint256 taunts = 0;
        for (uint256 i = 0; i < 50; i++) {
            if (clownBeatdown.getClownStamina() > 0) {
                if (i % 25 == 0) {
                    clownBeatdown.hit();
                } else {
                    uint256 numTaunts = (i % 3) + 1;
                    clownBeatdown.taunt(suint256(numTaunts));
                    taunts += numTaunts;
                }
            }
        }
        assertEq(clownBeatdown.revealChaos(), taunts);
    }

    function test_RevertWhen_NonContributorTriesToReveal() public {
        address nonContributor = address(0xabcd);

        clownBeatdown.hit();
        clownBeatdown.taunt(suint256(3));
        clownBeatdown.hit();

        vm.prank(address(nonContributor));
        vm.expectRevert("NOT_A_CONTRIBUTOR");
        clownBeatdown.revealChaos();
        assertEq(clownBeatdown.revealChaos(), 3);
    }

    function test_ContributorInRound2() public {
        address contributorRound2 = address(0xabcd);

        clownBeatdown.hit();
        clownBeatdown.hit();
        assertEq(clownBeatdown.revealChaos(), 0);

        clownBeatdown.reset();

        vm.prank(contributorRound2);
        clownBeatdown.hit();

        vm.prank(contributorRound2);
        clownBeatdown.taunt(suint256(5));

        vm.prank(contributorRound2);
        clownBeatdown.hit();

        vm.prank(contributorRound2);
        assertEq(clownBeatdown.revealChaos(), 5);

        vm.expectRevert("NOT_A_CONTRIBUTOR");
        clownBeatdown.revealChaos();
    }

    function test_BackwardsCompatibleAliases() public {
        clownBeatdown.shake(suint256(4));
        clownBeatdown.hit();
        clownBeatdown.hit();

        assertEq(clownBeatdown.look(), 4);
        assertEq(clownBeatdown.getShellStrength(), 0);
    }
}
