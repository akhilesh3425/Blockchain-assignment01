/* ============================================================
   ELECTX PROTOCOL — DECENTRALIZED VOTING ENGINE
   Powered by Ethers.js v6 & Ethereum Sepolia Testnet
   ============================================================ */

const CONFIG = window.CONTRACT_CONFIG;

let provider = null;
let signer = null;
let votingContract = null;
let currentAccount = null;
let hasAlreadyVoted = false;

// DOM ELEMENT HOOKS
const connectWalletBtn = document.getElementById("connectWalletBtn");
const connectWalletBtnText = document.getElementById("connectWalletBtnText");
const walletAddress = document.getElementById("walletAddress");
const walletStatus = document.getElementById("walletStatus");
const walletTipText = document.getElementById("walletTipText");
const walletStatusIcon = document.getElementById("walletStatusIcon");

const totalCandidatesElement = document.getElementById("totalCandidates");
const totalVotesElement = document.getElementById("totalVotes");
const votingStatusElement = document.getElementById("votingStatus");
const votingStatusDescription = document.getElementById("votingStatusDescription");

const candidateList = document.getElementById("candidateList");
const resultsList = document.getElementById("resultsList");

const transactionPanel = document.getElementById("transactionPanel");
const transactionIcon = document.getElementById("transactionIcon");
const transactionTitle = document.getElementById("transactionTitle");
const transactionMessage = document.getElementById("transactionMessage");
const txStateBadge = document.getElementById("txStateBadge");

const notification = document.getElementById("notification");
const notificationIcon = document.getElementById("notificationIcon");
const notificationMessage = document.getElementById("notificationMessage");
const toastTitle = document.getElementById("toastTitle");

const networkIndicator = document.getElementById("networkIndicator");
const networkName = document.getElementById("networkName");
const copyAddressBtn = document.getElementById("copyAddressBtn");

// CANDIDATE COLOR PALETTES
const CANDIDATE_THEMES = [
    {
        gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        badgeBg: "rgba(99, 102, 241, 0.15)",
        badgeColor: "#a5b4fc",
        barGradient: "linear-gradient(90deg, #6366f1, #8b5cf6)"
    },
    {
        gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
        badgeBg: "rgba(6, 182, 212, 0.15)",
        badgeColor: "#67e8f9",
        barGradient: "linear-gradient(90deg, #06b6d4, #3b82f6)"
    },
    {
        gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
        badgeBg: "rgba(16, 185, 129, 0.15)",
        badgeColor: "#6ee7b7",
        barGradient: "linear-gradient(90deg, #10b981, #06b6d4)"
    },
    {
        gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
        badgeBg: "rgba(245, 158, 11, 0.15)",
        badgeColor: "#fcd34d",
        barGradient: "linear-gradient(90deg, #f59e0b, #ef4444)"
    },
    {
        gradient: "linear-gradient(135deg, #ec4899, #8b5cf6)",
        badgeBg: "rgba(236, 72, 153, 0.15)",
        badgeColor: "#f472b6",
        barGradient: "linear-gradient(90deg, #ec4899, #8b5cf6)"
    }
];

// ============================================================
// NOTIFICATION SYSTEM
// ============================================================

let notificationTimeout;

function showNotification(message, type = "info") {
    if (!notification) return;

    notification.classList.remove("hidden");
    notificationMessage.textContent = message;

    const config = {
        success: {
            title: "Success Confirmation",
            icon: "fa-circle-check",
            border: "rgba(16, 185, 129, 0.4)",
            color: "#10b981"
        },
        error: {
            title: "Execution Error",
            icon: "fa-triangle-exclamation",
            border: "rgba(244, 63, 94, 0.4)",
            color: "#f43f5e"
        },
        info: {
            title: "Protocol Notice",
            icon: "fa-circle-info",
            border: "rgba(99, 102, 241, 0.4)",
            color: "#6366f1"
        }
    };

    const current = config[type] || config.info;
    if (toastTitle) toastTitle.textContent = current.title;
    notificationIcon.className = `fa-solid ${current.icon}`;
    notificationIcon.style.color = current.color;
    notification.style.borderColor = current.border;

    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
        notification.classList.add("hidden");
    }, 5000);
}

// ============================================================
// TRANSACTION STATUS FEEDBACK
// ============================================================

function updateTransactionStatus(title, message, state = "pending") {
    if (!transactionPanel) return;

    transactionPanel.classList.remove("hidden");
    transactionTitle.textContent = title;
    transactionMessage.textContent = message;

    const stateMap = {
        pending: {
            badge: "In Progress",
            icon: "fa-solid fa-spinner fa-spin",
            color: "#6366f1"
        },
        success: {
            badge: "Confirmed On-Chain",
            icon: "fa-solid fa-circle-check",
            color: "#10b981"
        },
        error: {
            badge: "Action Failed",
            icon: "fa-solid fa-triangle-exclamation",
            color: "#f43f5e"
        }
    };

    const s = stateMap[state] || stateMap.pending;
    if (txStateBadge) txStateBadge.textContent = s.badge;
    transactionIcon.innerHTML = `<i class="${s.icon}"></i>`;
    transactionIcon.style.color = s.color;
}

// ============================================================
// UTILITIES
// ============================================================

function shortenAddress(address) {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[c]);
}

// ============================================================
// NETWORK VERIFICATION
// ============================================================

async function checkNetwork() {
    if (!provider) return false;

    try {
        const network = await provider.getNetwork();
        const isSepolia = Number(network.chainId) === CONFIG.chainId;

        if (networkName) {
            networkName.textContent = isSepolia ? "Sepolia Testnet" : "Wrong Network";
        }

        if (networkIndicator) {
            networkIndicator.style.background = isSepolia ? "var(--accent-emerald)" : "var(--accent-rose)";
            networkIndicator.style.boxShadow = isSepolia
                ? "0 0 12px var(--accent-emerald)"
                : "0 0 12px var(--accent-rose)";
        }

        return isSepolia;
    } catch (err) {
        console.error("Network detection error:", err);
        return false;
    }
}

// ============================================================
// WALLET CONNECTION
// ============================================================

async function connectWallet() {
    if (!window.ethereum) {
        showNotification("MetaMask is not installed. Please install MetaMask to interact with ElectX.", "error");
        return;
    }

    try {
        connectWalletBtn.disabled = true;
        if (connectWalletBtnText) connectWalletBtnText.textContent = "Connecting...";

        provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);

        if (!accounts || accounts.length === 0) {
            throw new Error("No wallet account selected.");
        }

        currentAccount = ethers.getAddress(accounts[0]);
        signer = await provider.getSigner();

        const isCorrectNetwork = await checkNetwork();
        if (!isCorrectNetwork) {
            currentAccount = null;
            signer = null;
            votingContract = null;

            if (walletAddress) walletAddress.textContent = "Switch to Sepolia Network";
            if (walletStatus) {
                walletStatus.innerHTML = '<span class="status-dot" style="background:var(--accent-rose)"></span><span>Wrong Network</span>';
            }
            if (walletTipText) walletTipText.textContent = "Please set MetaMask's active network to Ethereum Sepolia.";

            showNotification("Wrong network selected. Please switch MetaMask to Sepolia Testnet.", "error");
            return;
        }

        votingContract = new ethers.Contract(CONFIG.address, CONFIG.abi, signer);

        // Update UI
        if (walletAddress) walletAddress.textContent = shortenAddress(currentAccount);
        if (walletStatus) {
            walletStatus.innerHTML = '<span class="status-dot" style="background:var(--accent-emerald); box-shadow:0 0 8px var(--accent-emerald)"></span><span>Verified</span>';
        }
        if (walletTipText) walletTipText.textContent = "Wallet authenticated. Ready to cast ballot.";
        if (connectWalletBtnText) connectWalletBtnText.textContent = shortenAddress(currentAccount);

        showNotification("MetaMask connected successfully to Sepolia!", "success");

        // Load contract data
        await loadElectionData();

    } catch (error) {
        console.error("Connection error:", error);
        if (error.code === 4001) {
            showNotification("Wallet connection request was rejected.", "error");
        } else {
            showNotification(error.message || "Failed to connect wallet.", "error");
        }
    } finally {
        connectWalletBtn.disabled = false;
        if (!currentAccount && connectWalletBtnText) {
            connectWalletBtnText.textContent = "Connect Wallet";
        }
    }
}

// ============================================================
// LOAD ELECTION DATA
// ============================================================

async function loadElectionData() {
    if (!votingContract) return;

    try {
        const count = Number(await votingContract.getCandidateCount());
        const candidates = [];
        let totalVotes = 0;

        for (let id = 1; id <= count; id++) {
            const candidate = await votingContract.getCandidate(id);
            const candidateData = {
                id: Number(candidate.id),
                name: candidate.name,
                voteCount: Number(candidate.voteCount)
            };
            candidates.push(candidateData);
            totalVotes += candidateData.voteCount;
        }

        if (totalCandidatesElement) totalCandidatesElement.textContent = count;
        if (totalVotesElement) totalVotesElement.textContent = totalVotes;

        if (currentAccount) {
            hasAlreadyVoted = await votingContract.hasVoted(currentAccount);

            if (votingStatusElement) {
                votingStatusElement.textContent = hasAlreadyVoted ? "Voted" : "Eligible";
                votingStatusElement.style.color = hasAlreadyVoted ? "var(--accent-emerald)" : "var(--accent-indigo)";
            }

            if (votingStatusDescription) {
                votingStatusDescription.textContent = hasAlreadyVoted
                    ? "Ballot permanently recorded"
                    : "Ready to vote";
            }
        }

        renderCandidates(candidates);
        renderResults(candidates, totalVotes);

    } catch (error) {
        console.error("Failed to fetch on-chain election data:", error);
        showNotification("Unable to synchronize with smart contract on Sepolia.", "error");
    }
}

// ============================================================
// RENDER CANDIDATES
// ============================================================

function renderCandidates(candidates) {
    if (!candidateList) return;
    candidateList.innerHTML = "";

    if (candidates.length === 0) {
        candidateList.innerHTML = `
            <div class="empty-state-card">
                <div class="empty-icon-box"><i class="fa-solid fa-users-slash"></i></div>
                <h3>No Candidates Registered</h3>
                <p>There are currently no active nominees on the smart contract.</p>
            </div>
        `;
        return;
    }

    candidates.forEach((candidate, index) => {
        const theme = CANDIDATE_THEMES[index % CANDIDATE_THEMES.length];
        const initial = escapeHTML(candidate.name.charAt(0).toUpperCase());
        const isLocked = hasAlreadyVoted;

        const card = document.createElement("article");
        card.className = "candidate-card-pro";

        card.innerHTML = `
            <div>
                <div class="candidate-card-header">
                    <div class="candidate-avatar-badge" style="background: ${theme.gradient}">
                        ${initial}
                    </div>
                    <div class="candidate-meta-badges">
                        <span class="candidate-id-chip">#${candidate.id}</span>
                        <span class="candidate-rank-badge">Nominee</span>
                    </div>
                </div>

                <div class="candidate-body" style="margin-top: 18px;">
                    <h3>${escapeHTML(candidate.name)}</h3>
                    <p class="candidate-summary">Official governance candidate registered on the Sepolia smart contract.</p>
                </div>
            </div>

            <div>
                <div class="candidate-vote-tally-box">
                    <span class="tally-label"><i class="fa-solid fa-vault"></i> On-Chain Ballots</span>
                    <strong class="tally-number">${candidate.voteCount}</strong>
                </div>

                <button
                    class="btn-cast-vote"
                    data-candidate-id="${candidate.id}"
                    style="${!isLocked ? `background: ${theme.gradient};` : ''}"
                    ${isLocked ? "disabled" : ""}
                >
                    <i class="fa-solid ${isLocked ? 'fa-lock' : 'fa-check'}"></i>
                    <span>${isLocked ? 'Vote Recorded' : 'Cast Vote for Candidate'}</span>
                </button>
            </div>
        `;

        const voteBtn = card.querySelector(".btn-cast-vote");
        voteBtn.addEventListener("click", () => {
            castVote(candidate.id, candidate.name, voteBtn);
        });

        candidateList.appendChild(card);
    });
}

// ============================================================
// RENDER LIVE ANALYTICS & RESULTS
// ============================================================

function renderResults(candidates, totalVotes) {
    if (!resultsList) return;
    resultsList.innerHTML = "";

    if (candidates.length === 0) {
        resultsList.innerHTML = `<div class="results-empty-state"><p>No candidates available.</p></div>`;
        return;
    }

    // Sort to determine current leader
    const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount);

    candidates.forEach((candidate, index) => {
        const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
        const rank = sorted.findIndex(c => c.id === candidate.id) + 1;
        const theme = CANDIDATE_THEMES[index % CANDIDATE_THEMES.length];
        const isLeader = rank === 1 && candidate.voteCount > 0;

        const row = document.createElement("div");
        row.className = "analytics-row-item";

        row.innerHTML = `
            <div class="candidate-cell">
                <span class="cell-rank ${isLeader ? 'first-place' : ''}">${rank}</span>
                <span class="cell-name">${escapeHTML(candidate.name)}</span>
                ${isLeader ? '<span class="candidate-rank-badge" style="background:rgba(245, 158, 11, 0.15); color:#f59e0b;"><i class="fa-solid fa-crown"></i> Leading</span>' : ''}
            </div>

            <div class="bar-cell">
                <div class="progress-track">
                    <div class="progress-fill" style="width: ${percentage}%; background: ${theme.barGradient}"></div>
                </div>
            </div>

            <div class="share-cell">
                <span class="share-votes">${candidate.voteCount} ${candidate.voteCount === 1 ? 'vote' : 'votes'}</span>
                <span class="share-percentage">${percentage.toFixed(1)}%</span>
            </div>
        `;

        resultsList.appendChild(row);
    });
}

// ============================================================
// CAST VOTE TRANSACTION
// ============================================================

async function castVote(candidateId, candidateName, button) {
    if (!votingContract || !currentAccount) {
        showNotification("Please connect your MetaMask wallet first.", "error");
        return;
    }

    if (hasAlreadyVoted) {
        showNotification("Your address has already submitted a ballot. Single-vote rule enforced.", "error");
        return;
    }

    try {
        const isCorrectNetwork = await checkNetwork();
        if (!isCorrectNetwork) {
            showNotification("Switch MetaMask to Ethereum Sepolia to proceed.", "error");
            return;
        }

        // Secondary contract check
        const alreadyVotedOnChain = await votingContract.hasVoted(currentAccount);
        if (alreadyVotedOnChain) {
            hasAlreadyVoted = true;
            await loadElectionData();
            showNotification("Smart contract confirmed: this address has already voted.", "error");
            return;
        }

        // Update UI to awaiting state
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Confirm in Wallet';

        updateTransactionStatus(
            "Awaiting Wallet Confirmation",
            `Please confirm the vote transaction for "${candidateName}" in MetaMask.`,
            "pending"
        );

        // Submit transaction
        const tx = await votingContract.vote(candidateId);

        updateTransactionStatus(
            "Transaction Broadcasted",
            `Transaction submitted: ${shortenAddress(tx.hash)}. Awaiting Sepolia block confirmation...`,
            "pending"
        );

        showNotification("Transaction sent to Ethereum network. Waiting for confirmation...", "info");
        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mining on Sepolia...';

        // Wait for 1 confirmation
        const receipt = await tx.wait();

        if (!receipt || receipt.status !== 1) {
            throw new Error("Transaction execution was reverted on-chain.");
        }

        hasAlreadyVoted = true;

        updateTransactionStatus(
            "Vote Successfully Recorded",
            `Confirmed! Ballot for "${candidateName}" mined in block #${receipt.blockNumber}.`,
            "success"
        );

        showNotification("Your vote was permanently recorded on the blockchain!", "success");
        await loadElectionData();

    } catch (error) {
        console.error("Voting error:", error);

        if (error.code === 4001) {
            showNotification("Transaction signature rejected by user.", "error");
            updateTransactionStatus("Transaction Canceled", "MetaMask signature was declined. No gas was spent.", "error");
        } else {
            const msg = error.reason || error.shortMessage || error.message || "Execution reverted on-chain.";
            showNotification(msg, "error");
            updateTransactionStatus("Transaction Failed", msg, "error");
        }

        if (currentAccount) {
            try {
                hasAlreadyVoted = await votingContract.hasVoted(currentAccount);
                await loadElectionData();
            } catch (err) {
                console.error(err);
            }
        }
    } finally {
        if (button && !hasAlreadyVoted) {
            button.disabled = false;
            button.innerHTML = '<i class="fa-solid fa-check"></i> Cast Vote for Candidate';
        }
    }
}

// ============================================================
// COPY CONTRACT ADDRESS
// ============================================================

if (copyAddressBtn) {
    copyAddressBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(CONFIG.address).then(() => {
            showNotification("Contract address copied to clipboard!", "success");
        }).catch(() => {
            showNotification("Could not copy address.", "error");
        });
    });
}

// ============================================================
// ACCOUNT & CHAIN EVENT LISTENERS
// ============================================================

if (window.ethereum) {
    window.ethereum.on("accountsChanged", async (accounts) => {
        if (!accounts || accounts.length === 0) {
            currentAccount = null;
            signer = null;
            votingContract = null;
            hasAlreadyVoted = false;

            if (walletAddress) walletAddress.textContent = "No wallet connected";
            if (walletStatus) walletStatus.innerHTML = '<span class="status-dot"></span><span>Awaiting Connection</span>';
            if (walletTipText) walletTipText.textContent = "Connect MetaMask to verify your voting eligibility.";
            if (connectWalletBtnText) connectWalletBtnText.textContent = "Connect Wallet";

            if (totalCandidatesElement) totalCandidatesElement.textContent = "--";
            if (totalVotesElement) totalVotesElement.textContent = "--";
            if (votingStatusElement) {
                votingStatusElement.textContent = "--";
                votingStatusElement.style.color = "inherit";
            }
            if (votingStatusDescription) votingStatusDescription.textContent = "Connect wallet to verify";

            if (candidateList) {
                candidateList.innerHTML = `
                    <div class="empty-state-card">
                        <div class="empty-icon-box"><i class="fa-solid fa-link-slash"></i></div>
                        <h3>Wallet Disconnected</h3>
                        <p>Connect your wallet to retrieve real-time candidate data from the smart contract.</p>
                        <button class="btn-empty-action" onclick="document.getElementById('connectWalletBtn').click()">
                            <i class="fa-solid fa-wallet"></i> Connect Wallet
                        </button>
                    </div>
                `;
            }

            if (resultsList) {
                resultsList.innerHTML = `
                    <div class="results-empty-state">
                        <i class="fa-solid fa-chart-column"></i>
                        <p>Live election results will compute here once wallet connection is established.</p>
                    </div>
                `;
            }
            return;
        }

        provider = new ethers.BrowserProvider(window.ethereum);
        currentAccount = ethers.getAddress(accounts[0]);
        signer = await provider.getSigner();

        const isSepolia = await checkNetwork();
        if (isSepolia) {
            votingContract = new ethers.Contract(CONFIG.address, CONFIG.abi, signer);
            if (walletAddress) walletAddress.textContent = shortenAddress(currentAccount);
            if (walletStatus) {
                walletStatus.innerHTML = '<span class="status-dot" style="background:var(--accent-emerald)"></span><span>Verified</span>';
            }
            if (connectWalletBtnText) connectWalletBtnText.textContent = shortenAddress(currentAccount);
            await loadElectionData();
        } else {
            votingContract = null;
            showNotification("Switched account, but active network is not Sepolia.", "error");
        }
    });

    window.ethereum.on("chainChanged", () => {
        window.location.reload();
    });
}

// ATTACH CLICK TO MAIN CONNECT BUTTON
if (connectWalletBtn) {
    connectWalletBtn.addEventListener("click", connectWallet);
}
