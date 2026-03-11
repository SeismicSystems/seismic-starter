// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {ClownBeatdown} from "../src/ClownBeatdown.sol";

contract WalnutTest is Test {
    ClownBeatdown public clownBeatdown;

    function setUp() public {
        clownBeatdown = new ClownBeatdown(2, suint256(0));
    }

    function test_Hit() public {
        clownBeatdown.hit();
        clownBeatdown.hit();
        assertEq(clownBeatdown.look(), 0);
    }

    function test_Shake() public {
        clownBeatdown.shake(suint256(10));
        clownBeatdown.hit();
        clownBeatdown.hit();
        assertEq(clownBeatdown.look(), 10);
    }

    function test_Reset() public {
        clownBeatdown.hit();
        clownBeatdown.shake(suint256(2));
        clownBeatdown.hit();
        clownBeatdown.reset();
        assertEq(clownBeatdown.getClownStamina(), 2); // Stamina should be reset to 2
        clownBeatdown.hit();
        clownBeatdown.shake(suint256(5));
        clownBeatdown.hit();
        assertEq(clownBeatdown.look(), 5); // Look should return 5 since the round was reset
    }

    function test_CannotHitWhenDown() public {
        clownBeatdown.hit();
        clownBeatdown.hit();
        vm.expectRevert("CLOWN_ALREADY_DOWN"); // Expect a revert when hitting after knockout
        clownBeatdown.hit();
    }

    function test_CannotShakeWhenDown() public {
        clownBeatdown.hit();
        clownBeatdown.shake(suint256(1));
        clownBeatdown.shake(suint256(1));
        clownBeatdown.hit();
        vm.expectRevert("CLOWN_ALREADY_DOWN"); // Expect a revert when taunting after knockout
        clownBeatdown.shake(suint256(1));
    }

    function test_CannotLookWhenStanding() public {
        clownBeatdown.hit();
        clownBeatdown.shake(suint256(1));
        vm.expectRevert("CLOWN_STILL_STANDING"); // Expect a revert when revealing before knockout
        clownBeatdown.look();
    }

    function test_CannotResetWhenStanding() public {
        vm.expectRevert("CLOWN_STILL_STANDING"); // Expect a revert when resetting before knockout
        clownBeatdown.reset();
    }

    function test_ManyActions() public {
        uint256 shakes = 0;
        for (uint256 i = 0; i < 50; i++) {
            // Only taunt while the clown is still standing
            if (clownBeatdown.getClownStamina() > 0) {
                if (i % 25 == 0) {
                    clownBeatdown.hit();
                } else {
                    // Taunt a random number of times between 1-3
                    uint256 numShakes = (i % 3) + 1;
                    clownBeatdown.shake(suint256(numShakes));
                    shakes += numShakes;
                }
            }
        }
        assertEq(clownBeatdown.look(), shakes);
    }

    function test_RevertWhen_NonContributorTriesToLook() public {
        // Address that will attempt to call 'look' without contributing
        address nonContributor = address(0xabcd);

        // Ensure the clown is down
        clownBeatdown.hit();
        clownBeatdown.shake(suint256(3));
        clownBeatdown.hit();

        // Expect the 'look' function to revert with "NOT_A_CONTRIBUTOR" error
        vm.prank(address(nonContributor));
        vm.expectRevert("NOT_A_CONTRIBUTOR");
        clownBeatdown.look();
        assertEq(clownBeatdown.look(), 3);
    }

    function test_ContributorInRound2() public {
        // Address that will become a contributor in round 2
        address contributorRound2 = address(0xabcd);

        // Round 1: clown knocked out by address(this)
        clownBeatdown.hit(); // Hit 1 by address(this)
        clownBeatdown.hit(); // Hit 2 by address(this)
        assertEq(clownBeatdown.look(), 0); // Verify knockout and look() behavior for address(this)

        // Reset for round 2
        clownBeatdown.reset();

        // Round 2: clown knocked out by contributorRound2
        vm.prank(contributorRound2);
        clownBeatdown.hit(); // Hit 1 by contributorRound2

        vm.prank(contributorRound2);
        clownBeatdown.shake(suint256(5)); // Shake 5 times by contributorRound2

        vm.prank(contributorRound2);
        clownBeatdown.hit(); // Hit 2 by contributorRound2

        // Verify contributorRound2 can call look() in round 2
        vm.prank(contributorRound2);
        assertEq(clownBeatdown.look(), 5); // Expect the number to be 5 due to 5 shakes

        // Verify address(this) cannot call look() in round 2
        vm.expectRevert("NOT_A_CONTRIBUTOR");
        clownBeatdown.look();
    }
}
