/**
 * Seismic Starter Studio Client Logic
 */

let activeBidder = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('header-user-addr').textContent = `${activeBidder.slice(0, 6)}...${activeBidder.slice(-4)}`;
  document.getElementById('bid-address').value = activeBidder;
  initTabs();
  loadConfig();
  loadBids();
  initFormListeners();
});

function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === `tab-${tab.dataset.tab}`));
    });
  });
}

async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    const container = document.getElementById('contracts-container');

    container.innerHTML = '';
    data.contracts.forEach(c => {
      const card = document.createElement('div');
      card.className = 'contract-card';
      card.innerHTML = `
        <div class="contract-title">${c.name}</div>
        <div class="contract-desc">${c.description}</div>
        <pre class="code-preview">${c.solidityCode}</pre>
      `;
      container.appendChild(card);
    });
  } catch (e) {
    console.error(e);
  }
}

async function loadBids() {
  try {
    const res = await fetch('/api/auction/bids');
    const bids = await res.json();
    const list = document.getElementById('bids-list-container');

    if (!bids || bids.length === 0) return;
    list.innerHTML = '';

    bids.forEach(b => {
      const row = document.createElement('div');
      row.className = 'ledger-row';
      row.innerHTML = `
        <div>
          <div class="mono" style="color: #34d399; font-weight: 600;">${b.bidder.slice(0, 8)}...${b.bidder.slice(-6)}</div>
          <div class="mono text-muted" style="font-size: 0.72rem;">Encrypted Cipher: ${b.encryptedBid.slice(0, 16)}...</div>
        </div>
        <div style="text-align: right;">
          <span class="net-tag" style="color: #a855f7;">🔒 suint256</span>
          <div class="text-muted" style="font-size: 0.75rem;">${new Date(b.timestamp).toLocaleTimeString()}</div>
        </div>
      `;
      list.appendChild(row);
    });
  } catch (e) {
    console.warn(e);
  }
}

function initFormListeners() {
  // Bid submit
  document.getElementById('bid-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-bid');
    const resultBox = document.getElementById('bid-result-box');

    const bidder = document.getElementById('bid-address').value;
    const amount = document.getElementById('bid-amount').value;

    btn.disabled = true;
    btn.textContent = '⏳ Encrypting suint256 to TEE...';

    try {
      const res = await fetch('/api/auction/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidder, amount }),
      });
      const data = await res.json();

      if (data.success) {
        resultBox.innerHTML = `
          <div class="card" style="border-color: #10b981; background: rgba(16, 185, 129, 0.08);">
            <strong style="color: #34d399;">✅ Encrypted Bid Submitted to Seismic!</strong>
            <p class="mt-2 text-muted" style="font-size: 0.85rem;">Bidder: <span class="mono">${data.bid.bidder}</span></p>
            <div class="mono text-muted mt-1" style="font-size: 0.75rem;">KeyHash: ${data.bid.keyHash}</div>
          </div>
        `;
        loadBids();
      }
    } catch (err) {
      resultBox.innerHTML = `<div class="badge red">Bid error: ${err.message}</div>`;
    } finally {
      btn.disabled = false;
      btn.textContent = '🛡️ Encrypt & Submit to Seismic TEE';
    }
  });

  // Reveal winner
  document.getElementById('btn-reveal-winner').addEventListener('click', async () => {
    const btn = document.getElementById('btn-reveal-winner');
    const resultBox = document.getElementById('bid-result-box');

    btn.disabled = true;
    btn.textContent = '⏳ Evaluating Bids in Enclave...';

    try {
      const res = await fetch('/api/auction/reveal', { method: 'POST' });
      const data = await res.json();

      if (data.winner) {
        resultBox.innerHTML = `
          <div class="card" style="border-color: #a855f7; background: rgba(168, 85, 247, 0.1);">
            <strong style="color: #c084fc;">🏆 Auction Winner Revealed in TEE!</strong>
            <p class="mt-2" style="font-size: 1rem;">Winner: <strong class="mono" style="color: #34d399;">${data.winner}</strong></p>
            <div style="font-size: 0.95rem; font-weight: 700; color: #a855f7;">Winning Bid: ${data.revealedAmount}</div>
          </div>
        `;
      } else {
        alert(data.message || 'No bids to evaluate');
      }
    } catch (err) {
      alert(`Reveal Error: ${err.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = '⚡ Reveal Auction Winner (TEE Evaluation)';
    }
  });

  document.getElementById('btn-refresh-bids').addEventListener('click', () => loadBids());
}
