// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ShieldedVoting} from "../src/ShieldedVoting.sol";

contract ShieldedVotingScript is Script {
    ShieldedVoting public voting;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVKEY");

        vm.startBroadcast(deployerPrivateKey);

        voting = new ShieldedVoting();
        console.log("ShieldedVoting deployed at:", address(voting));

        // Create a demo proposal
        uint256 pid = voting.createProposal("SIP-01: Enable Confidential Batch Auctions on Seismic L1", 86400);
        console.log("Created demo proposal ID:", pid);

        vm.stopBroadcast();
    }
}
