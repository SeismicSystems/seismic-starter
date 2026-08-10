/**
 * Seismic Shielded dApp Starter Configuration
 */

export const SEISMIC_CONFIG = {
  network: {
    name: 'Seismic Testnet',
    chainId: 5124,
    rpcUrl: process.env.SEISMIC_RPC_URL || 'https://testnet-1.seismictest.net/rpc',
    explorerUrl: 'https://seismic-testnet.socialscan.io',
    nativeCurrency: { name: 'Seismic Ether', symbol: 'sETH', decimals: 18 },
  },
  shieldedContracts: [
    {
      id: 'contract_blind_auction',
      name: 'Shielded Blind Auction',
      category: 'DeFi & Privacy',
      description: 'MEV-resistant auction where all bids are encrypted suint256 amounts until reveal phase.',
      solidityCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ShieldedBlindAuction {
    address public beneficiary;
    mapping(address => suint256) private bids; // Encrypted suint256
    address public highestBidder;
    suint256 private highestBid;
    bool public ended;

    event BidPlaced(address indexed bidder, bytes32 indexed keyHash);
    event AuctionEnded(address winner, uint256 revealedAmount);

    function bid(suint256 encryptedBid) external {
        require(!ended, "Auction already ended");
        bids[msg.sender] = encryptedBid;
        emit BidPlaced(msg.sender, keccak256(abi.encode(encryptedBid)));
    }
}`,
    },
    {
      id: 'contract_shielded_vault',
      name: 'Private Secret Vault',
      category: 'Confidential Storage',
      description: 'Store and transfer sensitive keys and balances protected by Seismic TEE hardware enclave.',
      solidityCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ShieldedVault {
    mapping(address => suint256) private balances;
    mapping(address => sbytes32) private secretKeys;

    function deposit(suint256 amount) external {
        balances[msg.sender] += amount;
    }

    function getPrivateBalance() external view returns (suint256) {
        return balances[msg.sender];
    }
}`,
    },
  ],
};
