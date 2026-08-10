#!/usr/bin/env node

/**
 * Seismic Shielded dApp CLI
 */

import { SEISMIC_CONFIG } from '../src/config.js';
import { defaultShieldedEngine } from '../src/core/shielded-engine.js';

const args = process.argv.slice(2);
const command = args[0] || 'help';

async function main() {
  switch (command.toLowerCase()) {
    case 'contracts': {
      console.log('\n🔒 Available Seismic Shielded Smart Contracts:');
      SEISMIC_CONFIG.shieldedContracts.forEach(c => {
        console.log(`  • [${c.id}] ${c.name} (${c.category})`);
        console.log(`    Description: ${c.description}\n`);
      });
      break;
    }

    case 'bid': {
      const amount = args[1] || '5.5';
      const bidder = args[2] || '0xBidderAddress11111111111111111111111111';
      console.log(`\n🔐 Placing Encrypted Blind Bid of ${amount} sETH (suint256)...`);
      const res = defaultShieldedEngine.placeEncryptedBid({ bidder, amount });
      console.log(`  Status:             ${res.bid.status}`);
      console.log(`  Encrypted Payload:  ${res.bid.encryptedBid}`);
      console.log(`  Key Hash:           ${res.bid.keyHash}`);
      console.log(`  TX Hash:            ${res.bid.txHash}\n`);
      break;
    }

    case 'reveal': {
      console.log('\n⚡ Evaluating highest bid inside Seismic TEE Enclave...');
      const res = defaultShieldedEngine.revealAuctionWinner();
      console.log(`  Winner:   ${res.winner}`);
      console.log(`  Amount:   ${res.revealedAmount}`);
      console.log(`  Status:   ${res.status}\n`);
      break;
    }

    case 'studio': {
      console.log('\n🌐 Launching Seismic Starter Studio on :3412...');
      await import('../src/server/app.js');
      break;
    }

    default: {
      console.log(`
╔══════════════════════════════════════════════════════════════════╗
║             🔒 SEISMIC SHIELDED DAPP STARTER CLI                 ║
║       Confidential Smart Contracts & Encrypted State Suite       ║
╚══════════════════════════════════════════════════════════════════╝

Commands:
  seismic-starter-cli contracts           List available shielded contracts
  seismic-starter-cli bid <amount>        Place encrypted suint256 blind bid
  seismic-starter-cli reveal              Evaluate auction in TEE enclave
  seismic-starter-cli studio              Launch Interactive Web Studio on :3412
      `);
      break;
    }
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
