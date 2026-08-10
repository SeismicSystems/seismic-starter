/**
 * Seismic Shielded Contract & Auction Engine
 */

import crypto from 'crypto';
import { SEISMIC_CONFIG } from '../config.js';

export class ShieldedEngine {
  constructor() {
    this.bids = new Map(); // bidderAddress -> { encryptedBid, plainAmount, keyHash }
    this.contracts = new Map();
    this.events = [];

    // Seed default contract
    const def = SEISMIC_CONFIG.shieldedContracts[0];
    this.deployContract(def.name, def.solidityCode);
  }

  deployContract(name, code) {
    const address = '0x' + crypto.randomBytes(20).toString('hex');
    const txHash = '0x' + crypto.randomBytes(32).toString('hex');

    const contract = {
      address,
      name,
      code,
      deployTx: txHash,
      deployedAt: new Date().toISOString(),
      network: SEISMIC_CONFIG.network.name,
    };

    this.contracts.set(address.toLowerCase(), contract);
    return contract;
  }

  /**
   * Place Encrypted Blind Bid (suint256)
   */
  placeEncryptedBid({ contractAddress, bidder, amount }) {
    if (!bidder || !amount) {
      throw new Error('Bidder address and amount are required');
    }

    const keyHash = '0x' + crypto.randomBytes(32).toString('hex');
    const encryptedBidCipher = '0x' + crypto.randomBytes(48).toString('hex');
    const txHash = '0x' + crypto.randomBytes(32).toString('hex');

    const record = {
      bidder,
      plainAmount: parseFloat(amount),
      encryptedBid: encryptedBidCipher,
      keyHash,
      txHash,
      timestamp: new Date().toISOString(),
      status: 'shielded_in_enclave',
    };

    this.bids.set(bidder.toLowerCase(), record);

    const eventLog = {
      id: `evt_${Date.now()}`,
      type: 'BidPlaced',
      bidder,
      keyHash,
      txHash,
      timestamp: new Date().toISOString(),
    };

    this.events.unshift(eventLog);

    return {
      success: true,
      bid: record,
      eventLog,
    };
  }

  revealAuctionWinner() {
    if (this.bids.size === 0) {
      return { status: 'no_bids', message: 'No bids placed yet' };
    }

    let highestBidder = null;
    let highestAmount = -1;

    for (const [addr, b] of this.bids.entries()) {
      if (b.plainAmount > highestAmount) {
        highestAmount = b.plainAmount;
        highestBidder = addr;
      }
    }

    const revealTx = '0x' + crypto.randomBytes(32).toString('hex');
    const result = {
      winner: highestBidder,
      revealedAmount: `${highestAmount} sETH`,
      totalBidsEvaluated: this.bids.size,
      revealTx,
      status: 'AUCTION_ENDED',
      timestamp: new Date().toISOString(),
    };

    this.events.unshift({
      id: `evt_ended_${Date.now()}`,
      type: 'AuctionEnded',
      winner: highestBidder,
      revealedAmount: highestAmount,
      txHash: revealTx,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  getBids() {
    // Returns sanitized public view (amounts hidden until reveal)
    return Array.from(this.bids.values()).map(b => ({
      bidder: b.bidder,
      encryptedBid: b.encryptedBid,
      keyHash: b.keyHash,
      txHash: b.txHash,
      status: b.status,
      timestamp: b.timestamp,
    }));
  }

  getEvents() {
    return this.events;
  }
}

export const defaultShieldedEngine = new ShieldedEngine();
