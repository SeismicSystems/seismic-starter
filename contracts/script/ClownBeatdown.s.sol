// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ClownBeatdown} from "../src/ClownBeatdown.sol";

contract ClownBeatdownScript is Script {
    ClownBeatdown public clownBeatdown;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVKEY");

        vm.startBroadcast(deployerPrivateKey);
        clownBeatdown = new ClownBeatdown(3);
        clownBeatdown.addSecret("The moon is made of cheese");
        clownBeatdown.addSecret("Clowns rule the underworld");
        clownBeatdown.addSecret("The cake is a lie");
        clownBeatdown.addSecret("42 is the answer");
        clownBeatdown.addSecret("Never trust a smiling clown");
        vm.stopBroadcast();
    }
}
