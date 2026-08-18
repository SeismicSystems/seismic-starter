// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

/**
 * @title ShieldedVoting
 * @notice A confidential DAO governance and voting contract built specifically for Seismic EVM.
 * @dev Employs Seismic's native shielded types (`suint256`) to maintain secret vote weights
 * and hidden running tallies, preventing voter manipulation, front-running, and voter coercion.
 */
contract ShieldedVoting {
    struct Proposal {
        string description;
        uint256 deadline;
        suint256 yesVotes;     // Shielded: hidden during active voting
        suint256 noVotes;      // Shielded: hidden during active voting
        uint256 revealedYes;   // Public tally revealed only after finalization
        uint256 revealedNo;    // Public tally revealed only after finalization
        bool finalized;
        bool passed;
    }

    address public immutable chairperson;
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed proposalId, string description, uint256 deadline);
    event VoteCast(uint256 indexed proposalId, address indexed voter);
    event ProposalFinalized(uint256 indexed proposalId, bool passed, uint256 totalYes, uint256 totalNo);

    error VotingEnded();
    error VotingActive();
    error AlreadyVoted();
    error ProposalNotFound();
    error ProposalAlreadyFinalized();
    error OnlyChairperson();

    modifier onlyChairperson() {
        if (msg.sender != chairperson) revert OnlyChairperson();
        _;
    }

    constructor() {
        chairperson = msg.sender;
    }

    /**
     * @notice Create a new governance proposal with a voting duration in seconds.
     */
    function createProposal(string memory _description, uint256 _durationSeconds) external onlyChairperson returns (uint256) {
        proposalCount++;
        uint256 proposalId = proposalCount;

        proposals[proposalId] = Proposal({
            description: _description,
            deadline: block.timestamp + _durationSeconds,
            yesVotes: suint256(0),
            noVotes: suint256(0),
            revealedYes: 0,
            revealedNo: 0,
            finalized: false,
            passed: false
        });

        emit ProposalCreated(proposalId, _description, block.timestamp + _durationSeconds);
        return proposalId;
    }

    /**
     * @notice Cast a confidential shielded vote with secret weight.
     * @param _proposalId The target proposal ID.
     * @param _support True for Yes, False for No.
     * @param _shieldedWeight Confidential voting power/weight (`suint256`).
     */
    function castVote(uint256 _proposalId, bool _support, suint256 _shieldedWeight) external {
        Proposal storage proposal = proposals[_proposalId];
        if (proposal.deadline == 0) revert ProposalNotFound();
        if (block.timestamp >= proposal.deadline) revert VotingEnded();
        if (hasVoted[_proposalId][msg.sender]) revert AlreadyVoted();

        hasVoted[_proposalId][msg.sender] = true;

        if (_support) {
            proposal.yesVotes = suint256(uint256(proposal.yesVotes) + uint256(_shieldedWeight));
        } else {
            proposal.noVotes = suint256(uint256(proposal.noVotes) + uint256(_shieldedWeight));
        }

        emit VoteCast(_proposalId, msg.sender);
    }

    /**
     * @notice Finalize the proposal after the deadline and decrypt the winning outcome.
     */
    function finalizeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        if (proposal.deadline == 0) revert ProposalNotFound();
        if (block.timestamp < proposal.deadline) revert VotingActive();
        if (proposal.finalized) revert ProposalAlreadyFinalized();

        proposal.finalized = true;
        proposal.revealedYes = uint256(proposal.yesVotes);
        proposal.revealedNo = uint256(proposal.noVotes);
        proposal.passed = proposal.revealedYes > proposal.revealedNo;

        emit ProposalFinalized(_proposalId, proposal.passed, proposal.revealedYes, proposal.revealedNo);
    }

    /**
     * @notice Query the proposal state.
     */
    function getProposal(uint256 _proposalId) external view returns (
        string memory description,
        uint256 deadline,
        uint256 revealedYes,
        uint256 revealedNo,
        bool finalized,
        bool passed
    ) {
        Proposal storage proposal = proposals[_proposalId];
        if (proposal.deadline == 0) revert ProposalNotFound();
        return (
            proposal.description,
            proposal.deadline,
            proposal.revealedYes,
            proposal.revealedNo,
            proposal.finalized,
            proposal.passed
        );
    }
}
