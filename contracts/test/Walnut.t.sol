// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {Walnut} from "../src/Walnut.sol";

contract WalnutTest is Test {
    Walnut public walnut;

    function setUp() public {
        walnut = new Walnut(2, suint256(0));
    }

    function test_Hit() public {
        walnut.hit();
        walnut.hit();
        assertEq(walnut.look(), 0);
    }

    function test_Shake() public {
        walnut.shake(suint256(10));
        walnut.hit();
        walnut.hit();
        assertEq(walnut.look(), 10);
    }

    function test_Reset() public {
        walnut.hit();
        walnut.shake(suint256(2));
        walnut.hit();
        walnut.reset();
        assertEq(walnut.getShellStrength(), 2); // Stamina should be reset to 2
        walnut.hit();
        walnut.shake(suint256(5));
        walnut.hit();
        assertEq(walnut.look(), 5); // Look should return 5 since the round was reset
    }

    function test_CannotHitWhenDown() public {
        walnut.hit();
        walnut.hit();
        vm.expectRevert("CLOWN_ALREADY_DOWN"); // Expect a revert when hitting after knockout
        walnut.hit();
    }

    function test_CannotShakeWhenDown() public {
        walnut.hit();
        walnut.shake(suint256(1));
        walnut.shake(suint256(1));
        walnut.hit();
        vm.expectRevert("CLOWN_ALREADY_DOWN"); // Expect a revert when taunting after knockout
        walnut.shake(suint256(1));
    }

    function test_CannotLookWhenStanding() public {
        walnut.hit();
        walnut.shake(suint256(1));
        vm.expectRevert("CLOWN_STILL_STANDING"); // Expect a revert when revealing before knockout
        walnut.look();
    }

    function test_CannotResetWhenStanding() public {
        vm.expectRevert("CLOWN_STILL_STANDING"); // Expect a revert when resetting before knockout
        walnut.reset();
    }

    function test_ManyActions() public {
        uint256 shakes = 0;
        for (uint256 i = 0; i < 50; i++) {
            // Only taunt while the clown is still standing
            if (walnut.getShellStrength() > 0) {
                if (i % 25 == 0) {
                    walnut.hit();
                } else {
                    // Taunt a random number of times between 1-3
                    uint256 numShakes = (i % 3) + 1;
                    walnut.shake(suint256(numShakes));
                    shakes += numShakes;
                }
            }
        }
        assertEq(walnut.look(), shakes);
    }

    function test_RevertWhen_NonContributorTriesToLook() public {
        // Address that will attempt to call 'look' without contributing
        address nonContributor = address(0xabcd);

        // Ensure the clown is down
        walnut.hit();
        walnut.shake(suint256(3));
        walnut.hit();

        // Expect the 'look' function to revert with "NOT_A_CONTRIBUTOR" error
        vm.prank(address(nonContributor));
        vm.expectRevert("NOT_A_CONTRIBUTOR");
        walnut.look();
        assertEq(walnut.look(), 3);
    }

    function test_ContributorInRound2() public {
        // Address that will become a contributor in round 2
        address contributorRound2 = address(0xabcd);

        // Round 1: clown knocked out by address(this)
        walnut.hit(); // Hit 1 by address(this)
        walnut.hit(); // Hit 2 by address(this)
        assertEq(walnut.look(), 0); // Verify knockout and look() behavior for address(this)

        // Reset for round 2
        walnut.reset();

        // Round 2: clown knocked out by contributorRound2
        vm.prank(contributorRound2);
        walnut.hit(); // Hit 1 by contributorRound2

        vm.prank(contributorRound2);
        walnut.shake(suint256(5)); // Shake 5 times by contributorRound2

        vm.prank(contributorRound2);
        walnut.hit(); // Hit 2 by contributorRound2

        // Verify contributorRound2 can call look() in round 2
        vm.prank(contributorRound2);
        assertEq(walnut.look(), 5); // Expect the number to be 5 due to 5 shakes

        // Verify address(this) cannot call look() in round 2
        vm.expectRevert("NOT_A_CONTRIBUTOR");
        walnut.look();
    }
}
