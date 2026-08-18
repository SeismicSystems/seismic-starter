// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {ShieldedAuction} from "../src/ShieldedAuction.sol";

contract ShieldedAuctionTest is Test {
    ShieldedAuction public auction;
    address public seller = address(0x1);
    address public bidder1 = address(0x2);
    address public bidder2 = address(0x3);

    uint256 public bidAmount1 = 1 ether;
    uint256 public bidAmount2 = 2 ether;

    function setUp() public {
        vm.deal(bidder1, 10 ether);
        vm.deal(bidder2, 10 ether);

        vm.prank(seller);
        // 1 hour bidding window, minimum 0.5 ether deposit
        auction = new ShieldedAuction(3600, 0.5 ether);
    }

    function test_SubmitAndConcludeAuction() public {
        // 1. Submit confidential shielded bids
        vm.prank(bidder1);
        auction.submitBid{value: 1.5 ether}(suint256(bidAmount1));

        vm.prank(bidder2);
        auction.submitBid{value: 2.5 ether}(suint256(bidAmount2));

        // 2. Warp past bidding deadline
        vm.warp(block.timestamp + 3601);

        // 3. Finalize auction
        uint256 sellerBalanceBefore = seller.balance;
        auction.endAuction();

        assertEq(auction.highestBidder(), bidder2);
        assertEq(auction.revealedHighestBid(), 2 ether);
        assertEq(seller.balance, sellerBalanceBefore + 2 ether);
        assertTrue(auction.auctionEnded());
    }

    function test_RefundWithdrawalForOutbidParticipant() public {
        vm.prank(bidder1);
        auction.submitBid{value: 1.5 ether}(suint256(bidAmount1));

        vm.prank(bidder2);
        auction.submitBid{value: 2.5 ether}(suint256(bidAmount2));

        // Bidder1 was outbid, should be able to withdraw refunded deposit
        uint256 bidder1BalanceBefore = bidder1.balance;
        vm.prank(bidder1);
        auction.withdrawRefund();

        assertEq(bidder1.balance, bidder1BalanceBefore + 1.5 ether);
    }

    function test_RevertWhen_BidAfterDeadline() public {
        vm.warp(block.timestamp + 3601);

        vm.prank(bidder1);
        vm.expectRevert(ShieldedAuction.BiddingPeriodEnded.selector);
        auction.submitBid{value: 1 ether}(suint256(bidAmount1));
    }

    function test_RevertWhen_DepositLessThanMinimum() public {
        vm.prank(bidder1);
        vm.expectRevert(ShieldedAuction.InsufficientDeposit.selector);
        auction.submitBid{value: 0.1 ether}(suint256(bidAmount1));
    }

    function test_RevertWhen_EndAuctionBeforeDeadline() public {
        vm.expectRevert(ShieldedAuction.BiddingPeriodActive.selector);
        auction.endAuction();
    }
}
