// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SealedBidAuction} from "../src/SealedBidAuction.sol";

contract SealedBidAuctionScript is Script {
    SealedBidAuction public auction;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVKEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy a 10-minute demo auction for a fictional NFT.
        auction = new SealedBidAuction("Seismic Genesis NFT #001", 600);

        console.log("SealedBidAuction deployed at:", address(auction));
        console.log("Auction ends at:", auction.auctionEndTime());
        console.log("Item:", auction.itemName());

        vm.stopBroadcast();
    }
}
