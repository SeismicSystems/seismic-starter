// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

/**
 * @title ShieldedAuction
 * @notice A confidential sealed-bid auction contract built specifically for Seismic EVM.
 * @dev Utilizes Seismic's native shielded types (`suint256`) and TEE execution to guarantee
 * complete bid confidentiality without requiring multi-phase commit-reveal schemes.
 */
contract ShieldedAuction {
    address public immutable seller;
    uint256 public immutable biddingDeadline;
    uint256 public immutable minDeposit;

    address public highestBidder;
    suint256 private highestBid; // Shielded state: winning bid amount remains hidden until finalization
    uint256 public revealedHighestBid; // Publicly revealed only after auction concludes
    bool public auctionEnded;

    mapping(address => suint256) private bids; // Confidential individual bids
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public pendingReturns;

    event BidSubmitted(address indexed bidder, uint256 deposit);
    event AuctionEnded(address indexed winner, uint256 winningAmount);

    error BiddingPeriodEnded();
    error BiddingPeriodActive();
    error InsufficientDeposit();
    error AuctionAlreadyFinalized();
    error NoPendingRefund();

    constructor(uint256 _biddingDurationSeconds, uint256 _minDeposit) {
        seller = msg.sender;
        biddingDeadline = block.timestamp + _biddingDurationSeconds;
        minDeposit = _minDeposit;
    }

    /**
     * @notice Submit a confidential bid with collateral deposit.
     * @param _shieldedBidAmount The shielded bid amount (suint256).
     */
    function submitBid(suint256 _shieldedBidAmount) external payable {
        if (block.timestamp >= biddingDeadline) revert BiddingPeriodEnded();
        if (msg.value < minDeposit) revert InsufficientDeposit();

        deposits[msg.sender] += msg.value;
        bids[msg.sender] = _shieldedBidAmount;

        // In Seismic TEE enclave, the shielded comparison occurs securely in the confidential state
        if (uint256(_shieldedBidAmount) > uint256(highestBid) && deposits[msg.sender] >= uint256(_shieldedBidAmount)) {
            if (highestBidder != address(0)) {
                pendingReturns[highestBidder] += uint256(highestBid);
            }
            highestBidder = msg.sender;
            highestBid = _shieldedBidAmount;

            uint256 excess = deposits[msg.sender] - uint256(_shieldedBidAmount);
            if (excess > 0) {
                pendingReturns[msg.sender] += excess;
            }
        } else {
            pendingReturns[msg.sender] += msg.value;
        }

        emit BidSubmitted(msg.sender, msg.value);
    }

    /**
     * @notice Finalize the auction after bidding deadline and reveal the winning outcome.
     */
    function endAuction() external {
        if (block.timestamp < biddingDeadline) revert BiddingPeriodActive();
        if (auctionEnded) revert AuctionAlreadyFinalized();

        auctionEnded = true;
        revealedHighestBid = uint256(highestBid);

        emit AuctionEnded(highestBidder, revealedHighestBid);

        if (revealedHighestBid > 0) {
            (bool success, ) = payable(seller).call{value: revealedHighestBid}("");
            require(success, "Transfer to seller failed");
        }
    }

    /**
     * @notice Withdraw refunded deposits for outbid or excess collateral.
     */
    function withdrawRefund() external returns (bool) {
        uint256 amount = pendingReturns[msg.sender];
        if (amount == 0) revert NoPendingRefund();

        pendingReturns[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        return true;
    }
}
