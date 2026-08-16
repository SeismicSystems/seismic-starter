// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

/**
 * @title SealedBidAuction
 * @notice A privacy-preserving sealed-bid auction using Seismic's shielded types.
 *
 * Demonstrates:
 *   - `suint256` for hiding bid amounts from other participants
 *   - Time-gated auction phases (bidding → finalization → settlement)
 *   - Owner-controlled auction lifecycle
 *
 * How it works:
 *   1. Owner deploys with an item name and duration.
 *   2. Bidders call `placeBid()` with ETH — amounts are stored as `suint256`,
 *      so no one can see anyone else's bid on-chain.
 *   3. After the deadline, anyone can call `finalize()` to determine the winner.
 *   4. Losers call `refund()` to reclaim their ETH.
 *   5. Owner calls `withdraw()` to collect the winning bid.
 */
contract SealedBidAuction {
    // --- State ---

    address public owner;
    string public itemName;

    uint256 public auctionEndTime;
    bool public auctionEnded;

    // Shielded bids — no participant can read another's bid amount.
    mapping(address => suint256) private bids;
    address[] private bidders;

    // Results (set on finalization).
    address public winner;
    uint256 public winningBid;

    // Track refund status to prevent double-withdraw.
    mapping(address => bool) private refunded;

    // --- Events ---

    event AuctionCreated(string itemName, uint256 endTime);
    event BidPlaced(address indexed bidder);
    event AuctionFinalized(address indexed winner, uint256 winningBid);
    event BidRefunded(address indexed bidder, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    // --- Constructor ---

    constructor(string memory _itemName, uint256 _durationSeconds) {
        require(_durationSeconds > 0, "DURATION_MUST_BE_POSITIVE");

        owner = msg.sender;
        itemName = _itemName;
        auctionEndTime = block.timestamp + _durationSeconds;

        emit AuctionCreated(_itemName, auctionEndTime);
    }

    // --- Core Functions ---

    /// @notice Place a shielded bid. The bid amount is hidden from other users.
    function placeBid() public payable {
        require(block.timestamp < auctionEndTime, "AUCTION_ENDED");
        require(msg.value > 0, "BID_MUST_BE_POSITIVE");
        require(uint256(bids[msg.sender]) == 0, "ALREADY_BID");

        bids[msg.sender] = suint256(msg.value);
        bidders.push(msg.sender);

        emit BidPlaced(msg.sender);
    }

    /// @notice Finalize the auction after the deadline. Determines the winner.
    function finalize() public {
        require(block.timestamp >= auctionEndTime, "AUCTION_NOT_ENDED");
        require(!auctionEnded, "ALREADY_FINALIZED");

        auctionEnded = true;

        uint256 highestBid = 0;
        address highestBidder = address(0);

        for (uint256 i = 0; i < bidders.length; i++) {
            uint256 bid = uint256(bids[bidders[i]]);
            if (bid > highestBid) {
                highestBid = bid;
                highestBidder = bidders[i];
            }
        }

        winner = highestBidder;
        winningBid = highestBid;

        emit AuctionFinalized(winner, winningBid);
    }

    /// @notice Losers can reclaim their ETH after finalization.
    function refund() public {
        require(auctionEnded, "AUCTION_NOT_FINALIZED");
        require(msg.sender != winner, "WINNER_CANNOT_REFUND");
        require(!refunded[msg.sender], "ALREADY_REFUNDED");

        uint256 bidAmount = uint256(bids[msg.sender]);
        require(bidAmount > 0, "NO_BID_FOUND");

        refunded[msg.sender] = true;
        bids[msg.sender] = suint256(0);

        payable(msg.sender).transfer(bidAmount);

        emit BidRefunded(msg.sender, bidAmount);
    }

    /// @notice Owner withdraws the winning bid amount.
    function withdraw() public {
        require(msg.sender == owner, "NOT_OWNER");
        require(auctionEnded, "AUCTION_NOT_FINALIZED");
        require(winningBid > 0, "NOTHING_TO_WITHDRAW");

        uint256 amount = winningBid;
        winningBid = 0; // Prevent re-entrancy.

        payable(owner).transfer(amount);

        emit FundsWithdrawn(owner, amount);
    }

    // --- View Functions ---

    /// @notice Returns the number of bidders.
    function getBidderCount() public view returns (uint256) {
        return bidders.length;
    }

    /// @notice Returns seconds remaining until auction end, or 0 if ended.
    function getTimeRemaining() public view returns (uint256) {
        if (block.timestamp >= auctionEndTime) return 0;
        return auctionEndTime - block.timestamp;
    }

    /// @notice Check if a user has placed a bid (does not reveal the amount).
    function hasUserBid(address user) public view returns (bool) {
        return uint256(bids[user]) > 0;
    }
}
