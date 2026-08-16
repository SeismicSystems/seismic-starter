// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {SealedBidAuction} from "../src/SealedBidAuction.sol";

contract SealedBidAuctionTest is Test {
    SealedBidAuction public auction;

    address owner = address(this);
    address alice = address(0xA11CE);
    address bob = address(0xB0B);
    address charlie = address(0xC4A7);

    uint256 constant DURATION = 1 hours;

    function setUp() public {
        auction = new SealedBidAuction("Rare NFT #1", DURATION);

        // Fund test accounts
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(charlie, 10 ether);
    }

    // --- Constructor Tests ---

    function test_ConstructorSetsOwner() public view {
        assertEq(auction.owner(), owner);
    }

    function test_ConstructorSetsItemName() public view {
        assertEq(auction.itemName(), "Rare NFT #1");
    }

    function test_ConstructorSetsEndTime() public view {
        assertEq(auction.auctionEndTime(), block.timestamp + DURATION);
    }

    function test_RevertWhen_ZeroDuration() public {
        vm.expectRevert("DURATION_MUST_BE_POSITIVE");
        new SealedBidAuction("Test", 0);
    }

    // --- Bidding Tests ---

    function test_PlaceBid() public {
        vm.prank(alice);
        auction.placeBid{value: 1 ether}();

        assertEq(auction.getBidderCount(), 1);
        assertTrue(auction.hasUserBid(alice));
    }

    function test_MultipleBidders() public {
        vm.prank(alice);
        auction.placeBid{value: 1 ether}();

        vm.prank(bob);
        auction.placeBid{value: 2 ether}();

        vm.prank(charlie);
        auction.placeBid{value: 3 ether}();

        assertEq(auction.getBidderCount(), 3);
    }

    function test_RevertWhen_BidAfterEnd() public {
        // Warp past the auction end
        vm.warp(block.timestamp + DURATION + 1);

        vm.prank(alice);
        vm.expectRevert("AUCTION_ENDED");
        auction.placeBid{value: 1 ether}();
    }

    function test_RevertWhen_ZeroBid() public {
        vm.prank(alice);
        vm.expectRevert("BID_MUST_BE_POSITIVE");
        auction.placeBid{value: 0}();
    }

    function test_RevertWhen_DoubleBid() public {
        vm.prank(alice);
        auction.placeBid{value: 1 ether}();

        vm.prank(alice);
        vm.expectRevert("ALREADY_BID");
        auction.placeBid{value: 2 ether}();
    }

    // --- Finalization Tests ---

    function test_Finalize() public {
        // Place bids
        vm.prank(alice);
        auction.placeBid{value: 1 ether}();

        vm.prank(bob);
        auction.placeBid{value: 3 ether}();

        vm.prank(charlie);
        auction.placeBid{value: 2 ether}();

        // Warp past end
        vm.warp(block.timestamp + DURATION + 1);

        auction.finalize();

        assertTrue(auction.auctionEnded());
        assertEq(auction.winner(), bob);
        assertEq(auction.winningBid(), 3 ether);
    }

    function test_FinalizeWithSingleBidder() public {
        vm.prank(alice);
        auction.placeBid{value: 5 ether}();

        vm.warp(block.timestamp + DURATION + 1);
        auction.finalize();

        assertEq(auction.winner(), alice);
        assertEq(auction.winningBid(), 5 ether);
    }

    function test_FinalizeWithNoBidders() public {
        vm.warp(block.timestamp + DURATION + 1);
        auction.finalize();

        assertEq(auction.winner(), address(0));
        assertEq(auction.winningBid(), 0);
    }

    function test_RevertWhen_FinalizeBeforeEnd() public {
        vm.expectRevert("AUCTION_NOT_ENDED");
        auction.finalize();
    }

    function test_RevertWhen_DoubleFinalze() public {
        vm.warp(block.timestamp + DURATION + 1);
        auction.finalize();

        vm.expectRevert("ALREADY_FINALIZED");
        auction.finalize();
    }

    // --- Refund Tests ---

    function test_RefundLoser() public {
        vm.prank(alice);
        auction.placeBid{value: 1 ether}();

        vm.prank(bob);
        auction.placeBid{value: 3 ether}();

        vm.warp(block.timestamp + DURATION + 1);
        auction.finalize();

        // Alice (loser) should get her 1 ether back
        uint256 balanceBefore = alice.balance;

        vm.prank(alice);
        auction.refund();

        assertEq(alice.balance, balanceBefore + 1 ether);
    }

    function test_RevertWhen_WinnerTriesToRefund() public {
        vm.prank(alice);
        auction.placeBid{value: 1 ether}();

        vm.prank(bob);
        auction.placeBid{value: 3 ether}();

        vm.warp(block.timestamp + DURATION + 1);
        auction.finalize();

        // Bob (winner) cannot refund
        vm.prank(bob);
        vm.expectRevert("WINNER_CANNOT_REFUND");
        auction.refund();
    }

    function test_RevertWhen_RefundBeforeFinalize() public {
        vm.prank(alice);
        auction.placeBid{value: 1 ether}();

        vm.warp(block.timestamp + DURATION + 1);

        vm.prank(alice);
        vm.expectRevert("AUCTION_NOT_FINALIZED");
        auction.refund();
    }

    function test_RevertWhen_DoubleRefund() public {
        vm.prank(alice);
        auction.placeBid{value: 1 ether}();

        vm.prank(bob);
        auction.placeBid{value: 3 ether}();

        vm.warp(block.timestamp + DURATION + 1);
        auction.finalize();

        vm.prank(alice);
        auction.refund();

        vm.prank(alice);
        vm.expectRevert("ALREADY_REFUNDED");
        auction.refund();
    }

    function test_RevertWhen_NonBidderTriesToRefund() public {
        vm.prank(alice);
        auction.placeBid{value: 1 ether}();

        vm.warp(block.timestamp + DURATION + 1);
        auction.finalize();

        vm.prank(charlie); // charlie never bid
        vm.expectRevert("NO_BID_FOUND");
        auction.refund();
    }

    // --- Withdraw Tests ---

    function test_OwnerWithdraw() public {
        vm.prank(alice);
        auction.placeBid{value: 1 ether}();

        vm.prank(bob);
        auction.placeBid{value: 3 ether}();

        vm.warp(block.timestamp + DURATION + 1);
        auction.finalize();

        uint256 ownerBalanceBefore = owner.balance;
        auction.withdraw();

        assertEq(owner.balance, ownerBalanceBefore + 3 ether);
        assertEq(auction.winningBid(), 0); // Cleared after withdrawal
    }

    function test_RevertWhen_NonOwnerWithdraws() public {
        vm.prank(alice);
        auction.placeBid{value: 1 ether}();

        vm.warp(block.timestamp + DURATION + 1);
        auction.finalize();

        vm.prank(alice);
        vm.expectRevert("NOT_OWNER");
        auction.withdraw();
    }

    function test_RevertWhen_WithdrawBeforeFinalize() public {
        vm.expectRevert("AUCTION_NOT_FINALIZED");
        auction.withdraw();
    }

    // --- View Function Tests ---

    function test_GetTimeRemaining() public view {
        uint256 remaining = auction.getTimeRemaining();
        assertTrue(remaining > 0);
        assertTrue(remaining <= DURATION);
    }

    function test_GetTimeRemainingAfterEnd() public {
        vm.warp(block.timestamp + DURATION + 1);
        assertEq(auction.getTimeRemaining(), 0);
    }

    function test_HasUserBidReturnsFalseForNonBidder() public view {
        assertFalse(auction.hasUserBid(alice));
    }
}
