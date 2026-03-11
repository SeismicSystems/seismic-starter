// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ClownBeatdown} from "../src/ClownBeatdown.sol";

contract ClownBeatdownScript is Script {
    ClownBeatdown public clownBeatdown;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVKEY");

        vm.startBroadcast(deployerPrivateKey);
        clownBeatdown = new ClownBeatdown(3, suint256(0));
        vm.stopBroadcast();
    }
}
