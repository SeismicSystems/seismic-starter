// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

contract Walnut {
    uint256 initialShellStrength; // The initial shell strength for resets.
    uint256 shellStrength; // The current shell strength.
    uint256 round; // The current round number.

    suint256 initialKernel; // The initial hidden kernel value for resets.
    suint256 kernel; // The current hidden kernel value.

    // Tracks the number of hits per player per round.
    mapping(uint256 => mapping(address => uint256)) hitsPerRound;

    // Events to log hits, shakes, and resets.

    // Event to log hits.
    event Hit(uint256 indexed round, address indexed hitter, uint256 remaining); // Logged when a hit occurs.
    // Event to log shakes.
    event Shake(uint256 indexed round, address indexed shaker); // Logged when the Walnut is shaken.
    // Event to log resets.
    event Reset(uint256 indexed newRound, uint256 remainingShellStrength);

    constructor(uint256 _shellStrength, suint256 _kernel) {
        initialShellStrength = _shellStrength; // Set the initial shell strength.
        shellStrength = _shellStrength; // Initialize the shell strength.

        initialKernel = _kernel; // Set the initial kernel value.
        kernel = _kernel; // Initialize the kernel value.

        round = 1; // Start with the first round.
    }

    // Get the current shell strength.
    function getShellStrength() public view returns (uint256) {
        return shellStrength;
    }

    // Hit the Walnut to reduce its shell strength.
    function hit() public requireIntact {
        shellStrength--; // Decrease the shell strength.
        hitsPerRound[round][msg.sender]++; // Record the player's hit for the current round.
        emit Hit(round, msg.sender, shellStrength); // Log the hit.
    }

    // Shake the Walnut to increase the kernel value.
    function shake(suint256 _numShakes) public requireIntact {
        kernel += _numShakes; // Increment the kernel value.
        emit Shake(round, msg.sender); // Log the shake.
    }

    // Reset the Walnut for a new round.
    function reset() public requireCracked {
        shellStrength = initialShellStrength; // Reset the shell strength.
        kernel = initialKernel; // Reset the kernel value.
        round++; // Move to the next round.
        emit Reset(round, shellStrength); // Log the reset.
    }

    // Look at the kernel if the shell is cracked and the caller contributed.
    function look() public view requireCracked onlyContributor returns (uint256) {
        return uint256(kernel); // Return the kernel value.
    }

    // Modifier to ensure the shell is fully cracked.
    modifier requireCracked() {
        require(shellStrength == 0, "SHELL_INTACT");
        _;
    }

    // Modifier to ensure the shell is not cracked.
    modifier requireIntact() {
        require(shellStrength > 0, "SHELL_ALREADY_CRACKED");
        _;
    }

    // Modifier to ensure the caller has contributed in the current round.
    modifier onlyContributor() {
        require(hitsPerRound[round][msg.sender] > 0, "NOT_A_CONTRIBUTOR");
        _;
    }
}
