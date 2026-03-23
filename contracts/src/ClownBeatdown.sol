// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

contract ClownBeatdown {
    uint256 initialClownStamina; // Starting stamina restored on reset.
    uint256 clownStamina; // Remaining stamina before the clown is down.
    uint256 round; // The current round number.

    mapping(uint256 => sbytes) secrets; // Pool of possible secrets (shielded).
    uint256 secretsCount; // Number of secrets for modular arithmetic.
    suint256 secretIndex; // Shielded index into the secrets mapping.

    // Tracks the number of hits per player per round.
    mapping(uint256 => mapping(address => uint256)) hitsPerRound;

    // Events to log hits, shakes, and resets.

    // Event to log hits.
    event Hit(uint256 indexed round, address indexed hitter, uint256 remaining); // Logged when a hit lands.
    // Event to log resets.
    event Reset(uint256 indexed newRound, uint256 remainingClownStamina);

    constructor(uint256 _clownStamina) {
        initialClownStamina = _clownStamina; // Set starting stamina.
        clownStamina = _clownStamina; // Initialize remaining stamina.
        round = 1; // Start with the first round.
    }

    // Get the current clown stamina.
    function getClownStamina() public view returns (uint256) {
        return clownStamina;
    }

    function addSecret(string memory _secret) public {
        secrets[secretsCount] = sbytes(_secret);
        secretsCount++;
        secretIndex = suint256(_randomIndex()); // Re-pick a random secret.
    }

    // Hit the clown to reduce stamina.
    function hit() public requireStanding {
        clownStamina--; // Decrease stamina.
        hitsPerRound[round][msg.sender]++; // Record the player's hit for the current round.
        emit Hit(round, msg.sender, clownStamina); // Log the hit.
    }

    
    // Reset the beatdown for a new round.
    function reset() public requireDown {
        clownStamina = initialClownStamina; // Reset stamina.
        secretIndex = suint256(_randomIndex()); // Pick a new random secret.
        round++; // Move to the next round.
        emit Reset(round, clownStamina); // Log the reset.
    }

    // Reveal secret once the clown is down and the caller contributed.
    // ** POSSIBLE BUG IN SOLIDITY **
    // the cast only works if the lines are split, if you try to cast this in a one liner the tests will fail.  
    function rob() public view requireDown onlyContributor returns (bytes memory) {
        sbytes memory secret = secrets[uint256(secretIndex)];
        return bytes(secret); // Return the randomly selected secret.
    }

    // Generate a pseudo-random index into the secrets array.
    function _randomIndex() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, round))) % secretsCount;
    }

    // Modifier to ensure the clown is down.
    modifier requireDown() {
        require(clownStamina == 0, "CLOWN_STILL_STANDING");
        _;
    }

    // Modifier to ensure the clown is still standing.
    modifier requireStanding() {
        require(clownStamina > 0, "CLOWN_ALREADY_DOWN");
        _;
    }

    // Modifier to ensure the caller has contributed in the current round.
    modifier onlyContributor() {
        require(hitsPerRound[round][msg.sender] > 0, "NOT_A_CONTRIBUTOR");
        _;
    }
}
