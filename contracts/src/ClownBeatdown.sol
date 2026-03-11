// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

contract ClownBeatdown {
    uint256 initialClownStamina; // Starting stamina restored on reset.
    uint256 clownStamina; // Remaining stamina before the clown is knocked out.
    uint256 round; // Current round number.

    suint256 initialChaosMeter; // Starting hidden chaos score restored on reset.
    suint256 chaosMeter; // Current hidden chaos score.

    // Tracks the number of hits each player contributed in a round.
    mapping(uint256 => mapping(address => uint256)) hitsPerRound;

    // Events for attacks, taunts, and round resets.
    event Hit(uint256 indexed round, address indexed hitter, uint256 remainingStamina);
    event Taunt(uint256 indexed round, address indexed taunter);
    event Reset(uint256 indexed newRound, uint256 restoredStamina);

    constructor(uint256 _clownStamina, suint256 _chaosMeter) {
        initialClownStamina = _clownStamina;
        clownStamina = _clownStamina;

        initialChaosMeter = _chaosMeter;
        chaosMeter = _chaosMeter;

        round = 1;
    }

    function getClownStamina() public view returns (uint256) {
        return clownStamina;
    }

    // Backwards-compatible alias for older callers.
    function getShellStrength() public view returns (uint256) {
        return getClownStamina();
    }

    function hit() public requireStanding {
        clownStamina--;
        hitsPerRound[round][msg.sender]++;
        emit Hit(round, msg.sender, clownStamina);
    }

    function taunt(suint256 _numTaunts) public requireStanding {
        chaosMeter += _numTaunts;
        emit Taunt(round, msg.sender);
    }

    // Backwards-compatible alias for older callers.
    function shake(suint256 _numShakes) public {
        taunt(_numShakes);
    }

    function reset() public requireKnockedOut {
        clownStamina = initialClownStamina;
        chaosMeter = initialChaosMeter;
        round++;
        emit Reset(round, clownStamina);
    }

    function revealChaos() public view requireKnockedOut onlyContributor returns (uint256) {
        return uint256(chaosMeter);
    }

    // Backwards-compatible alias for older callers.
    function look() public view returns (uint256) {
        return revealChaos();
    }

    modifier requireKnockedOut() {
        require(clownStamina == 0, "CLOWN_STILL_STANDING");
        _;
    }

    modifier requireStanding() {
        require(clownStamina > 0, "CLOWN_ALREADY_DOWN");
        _;
    }

    modifier onlyContributor() {
        require(hitsPerRound[round][msg.sender] > 0, "NOT_A_CONTRIBUTOR");
        _;
    }
}
