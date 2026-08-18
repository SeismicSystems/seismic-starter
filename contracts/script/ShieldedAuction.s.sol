// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ShieldedAuction} from "../src/ShieldedAuction.sol";

contract ShieldedAuctionScript is Script {
    ShieldedAuction public auction;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVKEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy auction with 1 hour bidding duration and 0.05 ether minimum deposit
        uint256 biddingDuration = 3600;
        uint256 minDeposit = 0.05 ether;

        auction = new ShieldedAuction(biddingDuration, minDeposit);
        console.log("ShieldedAuction deployed at:", address(auction));

        vm.stopBroadcast();
    }
}
