/**
 * Seismic Starter Shielded Engine Unit Tests
 */

import { defaultShieldedEngine } from '../src/core/shielded-engine.js';

async function runStarterTests() {
  console.log('Testing Seismic Shielded Blind Auction & State Engine...');

  const bidderA = '0xAlice111111111111111111111111111111111111';
  const bidderB = '0xBob22222222222222222222222222222222222222';

  // 1. Submit Bid A
  const resA = defaultShieldedEngine.placeEncryptedBid({ bidder: bidderA, amount: '4.5' });
  if (!resA.bid.encryptedBid || !resA.bid.keyHash) {
    throw new Error('Encrypted bid submission failed');
  }

  // 2. Submit Bid B
  const resB = defaultShieldedEngine.placeEncryptedBid({ bidder: bidderB, amount: '9.2' });
  if (!resB.bid.encryptedBid) {
    throw new Error('Second bid submission failed');
  }

  // 3. Reveal Winner in TEE
  const reveal = defaultShieldedEngine.revealAuctionWinner();
  if (reveal.winner.toLowerCase() !== bidderB.toLowerCase() || !reveal.revealedAmount.includes('9.2')) {
    throw new Error('TEE blind auction winner evaluation failed');
  }

  console.log(`✅ Shielded Blind Auction Tested: Winner correctly evaluated in TEE enclave (${reveal.revealedAmount})!`);
}

runStarterTests().catch(e => {
  console.error('❌ Starter Test Failed:', e);
  process.exit(1);
});
