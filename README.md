# ElectX - Decentralized Voting Protocol

[![Solidity](https://img.shields.io/badge/Solidity-%23363636.svg?style=flat&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?style=flat&logo=ethereum&logoColor=white)](https://sepolia.etherscan.io/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-2535a0?style=flat)](https://docs.ethers.org/v6/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A production-grade, decentralized voting application (DApp) built on the Ethereum Sepolia Testnet. **ElectX** eliminates central points of failure in election governance by recording votes directly onto an immutable blockchain smart contract, ensuring verifiable, tamper-proof, and duplicate-resistant elections.

---

## Author

- **Name:** Akhilesh Butola

---

## Key Features

- **Decentralized & Tamper-Proof:** All voting logic and vote tallies are maintained on-chain via a Solidity smart contract.
- **Single-Vote Enforcement:** Cryptographically prevents double-voting by mapping voter addresses directly in the contract state.
- **Web3 Wallet Authentication:** Native MetaMask integration using Ethers.js v6 for transaction signing and network verification.
- **Network Detection:** Automatically detects if the connected wallet is on the Ethereum Sepolia Testnet and alerts users if network switching is needed.
- **Live On-Chain Results:** Automatically reads and calculates candidate vote counts and percentage shares directly from the blockchain.
- **Production-Grade Bento Grid UI:** Built with modern cyber-luxe aesthetics, ambient mesh lighting, responsive Bento layout, live leaderboard analytics, and real-time transaction state feedback.

---

## Technology Stack

| Layer | Technologies |
| --- | --- |
| **Smart Contracts** | Solidity (`^0.8.0`) |
| **Blockchain Network** | Ethereum Sepolia Testnet |
| **Development Environment** | Remix IDE |
| **Web3 Client Library** | Ethers.js (v6) |
| **Wallet Provider** | MetaMask |
| **Frontend** | HTML5, Modern CSS3 (Cyber-Luxe Bento Grid & Glassmorphism), Vanilla JavaScript |
| **Explorer & Verification** | Blockscout, Sourcify |

---

## Smart Contract Details

- **Contract Name:** `Voting.sol`
- **Network:** Ethereum Sepolia (Chain ID: `11155111`)
- **Contract Address:** [`0x8e75689c6a58A9051bb692526B113aB40b2cdaC3`](https://eth-sepolia.blockscout.com/address/0x8e75689c6a58A9051bb692526B113aB40b2cdaC3)
- **Verified Source Code:** [Sourcify Contract Verification](https://repo.sourcify.dev/11155111/0x8e75689c6a58A9051bb692526B113aB40b2cdaC3/)

### Core Functions & Events

```solidity
function vote(uint256 candidateId) public;
function getCandidate(uint256 candidateId) public view returns (uint256 id, string memory name, uint256 voteCount);
function getCandidateCount() public view returns (uint256);
function hasVoted(address voter) public view returns (bool);
event VoteCast(address indexed voter, uint256 indexed candidateId, string candidateName);
```

---

## Repository Structure

```text
blockChain_voting_DApp/
├── contracts/
│   ├── SimpleStorage.sol           # Introductory storage contract
│   └── Voting.sol                  # Production voting smart contract
│
├── frontend/
│   ├── index.html                  # Main dashboard and application view
│   ├── css/
│   │   └── style.css               # Production Cyber-Luxe styling & Bento Grid layout
│   └── js/
│       ├── contract.js             # Contract address & human-readable ABI
│       └── app.js                  # Ethers.js integration and event handling
│
├── docs/                           # Documentation & coursework reports
│   ├── practical-1-simple-storage.md
│   ├── practical-2-voting.md
│   ├── practical-3-voting-frontend.md
│   └── practical-4-DApp-testing.md
│
├── screenshots/                    # Testing evidence and execution records
│   ├── simple-storage/
│   ├── voting/
│   ├── voting-frontend/
│   └── Testing-DApp/
│
└── README.md
```

---

## Getting Started

### Prerequisites

1. **MetaMask Extension:** Install the [MetaMask browser extension](https://metamask.io/).
2. **Sepolia Test ETH:** Acquire testnet ETH to cover transaction gas fees from:
   - [Google Cloud Web3 Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
   - [Sepolia Faucet](https://sepoliafaucet.com/)

### Running Locally

Since the frontend is built with pure web technologies and Ethers.js via CDN, you can run it with any local static HTTP server:

#### Option 1: VS Code Live Server

1. Open the repository in Visual Studio Code.
2. Right-click on `frontend/index.html`.
3. Select **"Open with Live Server"**.

#### Option 2: Python HTTP Server

```bash
cd frontend
python -m http.server 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Option 3: Node.js

```bash
npx serve frontend
```

---

## Testing & Verification Records

The voting smart contract and frontend were verified across various scenarios on the Sepolia Testnet:

| Scenario | Tested Behavior | Result |
| --- | --- | :---: |
| **Standard Vote** | Eligible wallet casts vote for Candidate A | Passed (Confirmed on-chain) |
| **Duplicate Vote** | Same wallet attempts to cast a second vote | Blocked (Prevented before submission) |
| **Multi-Account** | Second funded account votes for Candidate B | Passed (Vote count updated) |
| **Invalid ID** | Submitting an unlisted candidate ID | Rejected by smart contract |

### Blockchain Verification Links

- [Candidate A Vote Transaction](https://eth-sepolia.blockscout.com/tx/0x2da6ad6aca459951dde7302e0885358f693b388f0b9d08894cec915e33e55e7e)
- [Candidate B Vote Transaction](https://eth-sepolia.blockscout.com/tx/0x1d98b18c4ec0394595900963f5e88b08da2cd8b4af0d359e41597206ba21613a)
- [Sepolia Blockscout Explorer](https://eth-sepolia.blockscout.com/)
