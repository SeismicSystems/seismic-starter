// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {ClownBeatdown} from "../src/ClownBeatdown.sol";

contract ClownBeatdownTest is Test {
    ClownBeatdown public clownBeatdown;
    string[] secrets;

    function setUp() public {
        secrets.push("Secret A");
        secrets.push("Secret B");
        secrets.push("Secret C");
        clownBeatdown = new ClownBeatdown(2, secrets);
    }

    function test_Hit() public {
        clownBeatdown.hit();
        assertEq(clownBeatdown.getClownStamina(), 1);
    }

    function test_KnockoutAndRob() public {
        clownBeatdown.hit();
        clownBeatdown.hit();
        // rob() should return one of the secrets
        string memory secret = clownBeatdown.rob();
        assertTrue(
            keccak256(bytes(secret)) == keccak256(bytes("Secret A")) ||
            keccak256(bytes(secret)) == keccak256(bytes("Secret B")) ||
            keccak256(bytes(secret)) == keccak256(bytes("Secret C"))
        );
    }

    function test_Reset() public {
        clownBeatdown.hit();
        clownBeatdown.hit();
        clownBeatdown.reset();
        assertEq(clownBeatdown.getClownStamina(), 2); // Stamina should be reset to 2
    }

    function test_SecretCanChangeAfterReset() public {
        // Knock out and rob in round 1
        clownBeatdown.hit();
        clownBeatdown.hit();
        string memory secret1 = clownBeatdown.rob();

        // Reset and knock out again in round 2
        clownBeatdown.reset();
        clownBeatdown.hit();
        clownBeatdown.hit();
        string memory secret2 = clownBeatdown.rob();

        // Both should be valid secrets (they may or may not differ depending on randomness)
        assertTrue(
            keccak256(bytes(secret1)) == keccak256(bytes("Secret A")) ||
            keccak256(bytes(secret1)) == keccak256(bytes("Secret B")) ||
            keccak256(bytes(secret1)) == keccak256(bytes("Secret C"))
        );
        assertTrue(
            keccak256(bytes(secret2)) == keccak256(bytes("Secret A")) ||
            keccak256(bytes(secret2)) == keccak256(bytes("Secret B")) ||
            keccak256(bytes(secret2)) == keccak256(bytes("Secret C"))
        );
    }

    function test_CannotHitWhenDown() public {
        clownBeatdown.hit();
        clownBeatdown.hit();
        vm.expectRevert("CLOWN_ALREADY_DOWN");
        clownBeatdown.hit();
    }

    function test_CannotRobWhenStanding() public {
        clownBeatdown.hit();
        vm.expectRevert("CLOWN_STILL_STANDING");
        clownBeatdown.rob();
    }

    function test_CannotResetWhenStanding() public {
        vm.expectRevert("CLOWN_STILL_STANDING");
        clownBeatdown.reset();
    }

    function test_RevertWhen_NonContributorTriesToRob() public {
        address nonContributor = address(0xabcd);

        // Knock out the clown
        clownBeatdown.hit();
        clownBeatdown.hit();

        // Non-contributor should be rejected
        vm.prank(nonContributor);
        vm.expectRevert("NOT_A_CONTRIBUTOR");
        clownBeatdown.rob();

        // Original contributor can still rob
        string memory secret = clownBeatdown.rob();
        assertTrue(bytes(secret).length > 0);
    }

    function test_ContributorInRound2() public {
        address contributorRound2 = address(0xabcd);

        // Round 1: knocked out by address(this)
        clownBeatdown.hit();
        clownBeatdown.hit();
        string memory secret1 = clownBeatdown.rob();
        assertTrue(bytes(secret1).length > 0);

        // Reset for round 2
        clownBeatdown.reset();

        // Round 2: knocked out by contributorRound2
        vm.prank(contributorRound2);
        clownBeatdown.hit();
        vm.prank(contributorRound2);
        clownBeatdown.hit();

        // contributorRound2 can rob in round 2
        vm.prank(contributorRound2);
        string memory secret2 = clownBeatdown.rob();
        assertTrue(bytes(secret2).length > 0);

        // address(this) cannot rob in round 2 (not a contributor this round)
        vm.expectRevert("NOT_A_CONTRIBUTOR");
        clownBeatdown.rob();
    }

    function test_ConstructorRequiresAtLeastOneSecret() public {
        string[] memory emptySecrets = new string[](0);
        vm.expectRevert("NEED_AT_LEAST_ONE_SECRET");
        new ClownBeatdown(2, emptySecrets);
    }
}
