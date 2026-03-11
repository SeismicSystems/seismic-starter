// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

contract ClownBeatdown {
    uint256 initialClownStamina; // Starting stamina restored on reset.
    uint256 clownStamina; // Remaining stamina before the clown is down.
    uint256 round; // The current round number.

    suint256 initialPunchesUntilKo; // Starting number of punches until the clown is down restored on reset.
    suint256 punchesUntilKo; // The current number of punches until the clown is down.

    // Tracks the number of hits per player per round.
    mapping(uint256 => mapping(address => uint256)) hitsPerRound;

    // Events to log hits, shakes, and resets.

    // Event to log hits.
    event Hit(uint256 indexed round, address indexed hitter, uint256 remaining); // Logged when a hit lands.
    // Event to log shakes.
    event Shake(uint256 indexed round, address indexed shaker); // Logged when the clown is shaken  .
    // Event to log resets.
    event Reset(uint256 indexed newRound, uint256 remainingClownStamina);

    constructor(uint256 _clownStamina, suint256 _punchesUntilKo) {
        initialClownStamina = _clownStamina; // Set starting stamina.
        clownStamina = _clownStamina; // Initialize remaining stamina.

        initialPunchesUntilKo = _punchesUntilKo; // Set starting number of punches until the clown is down.
        punchesUntilKo = _punchesUntilKo; // Initialize number of punches until the clown is down.

        round = 1; // Start with the first round.
    }

    // Get the current clown stamina.
    function getClownStamina() public view returns (uint256) {
        return clownStamina;
    }

    // Hit the clown to reduce stamina.
    function hit() public requireStanding {
        clownStamina--; // Decrease stamina.
        hitsPerRound[round][msg.sender]++; // Record the player's hit for the current round.
        emit Hit(round, msg.sender, clownStamina); // Log the hit.
    }

    // Shake the clown .
    function shake(suint256 _numShakes) public requireStanding {
        punchesUntilKo += _numShakes; // Increment number of punches until the clown is down.
        emit Shake(round, msg.sender); // Log the shake.
    }

    // Reset the beatdown for a new round.
    function reset() public requireDown {
        clownStamina = initialClownStamina; // Reset stamina.
        punchesUntilKo = initialPunchesUntilKo; // Reset number of punches until the clown is down.
        round++; // Move to the next round.
        emit Reset(round, clownStamina); // Log the reset.
    }

    // Reveal secret once the clown is down and the caller contributed.
    function look() public view requireDown onlyContributor returns (uint256) {
        return uint256(punchesUntilKo); // Return the number of punches until the clown is down.
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
