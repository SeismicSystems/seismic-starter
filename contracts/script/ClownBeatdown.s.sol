// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ClownBeatdown} from "../src/ClownBeatdown.sol";

contract ClownBeatdownScript is Script {
    ClownBeatdown public clownBeatdown;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVKEY");

        string[] memory secrets = new string[](5);
        secrets[0] = "The moon is made of cheese";
        secrets[1] = "Clowns rule the underworld";
        secrets[2] = "The cake is a lie";
        secrets[3] = "42 is the answer";
        secrets[4] = "Never trust a smiling clown";

        vm.startBroadcast(deployerPrivateKey);
        clownBeatdown = new ClownBeatdown(3, secrets);
        vm.stopBroadcast();
    }
}
