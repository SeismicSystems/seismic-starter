/**
 * Seismic Shielded dApp Starter Web Server
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEISMIC_CONFIG } from '../config.js';
import { defaultShieldedEngine } from '../core/shielded-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEB_ROOT = path.join(__dirname, '../../web');

const app = express();
const PORT = process.env.PORT || 3412;

app.use(cors());
app.use(express.json());
app.use(express.static(WEB_ROOT));

// 1. Get Network Config & Contracts
app.get('/api/config', (req, res) => {
  res.json({
    network: SEISMIC_CONFIG.network,
    contracts: SEISMIC_CONFIG.shieldedContracts,
  });
});

// 2. Place Shielded Blind Bid
app.post('/api/auction/bid', (req, res) => {
  try {
    const result = defaultShieldedEngine.placeEncryptedBid(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Reveal Auction Winner (TEE Evaluation)
app.post('/api/auction/reveal', (req, res) => {
  try {
    const result = defaultShieldedEngine.revealAuctionWinner();
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Get Public Encrypted Bids
app.get('/api/auction/bids', (req, res) => {
  res.json(defaultShieldedEngine.getBids());
});

// 5. On-Chain Events Log
app.get('/api/events', (req, res) => {
  res.json(defaultShieldedEngine.getEvents());
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🔒 Seismic Shielded dApp Starter Studio Running!`);
    console.log(`🌐 Web Dashboard: http://localhost:${PORT}`);
    console.log(`⛓️  Connected to: Seismic Privacy EVM (Chain ID 5124)`);
    console.log(`======================================================\n`);
  });
}

export default app;
