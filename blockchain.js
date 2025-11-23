// Blockchain Voting System - Core Blockchain Functions
class BlockchainVoting {
    constructor() {
        this.chain = [];
        this.pendingVotes = [];
        this.voters = new Map();
        this.candidates = new Map();
        this.votingActive = true;
        this.initializeBlockchain();
        this.initializeCandidates();
    }

    // Initialize the blockchain with genesis block
    initializeBlockchain() {
        const genesisBlock = {
            index: 0,
            timestamp: Date.now(),
            votes: [],
            previousHash: '0',
            hash: this.calculateHash(0, Date.now(), [], '0'),
            nonce: 0
        };
        this.chain.push(genesisBlock);
    }

    // Initialize candidates
    initializeCandidates() {
        this.candidates.set(1, {
            id: 1,
            name: 'Alice Johnson',
            party: 'Democratic Party',
            experience: '15 years experience',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
            votes: 3846
        });

        this.candidates.set(2, {
            id: 2,
            name: 'Robert Smith',
            party: 'Republican Party',
            experience: '12 years experience',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
            votes: 3248
        });

        this.candidates.set(3, {
            id: 3,
            name: 'Maria Garcia',
            party: 'Independent',
            experience: '8 years experience',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
            votes: 1453
        });
    }

    // Calculate hash for a block
    calculateHash(index, timestamp, votes, previousHash, nonce = 0) {
        const data = index + timestamp + JSON.stringify(votes) + previousHash + nonce;
        return this.sha256(data);
    }

    // Simple SHA-256 implementation (for demo purposes)
    sha256(data) {
        // This is a simplified hash function for demo
        // In production, use a proper cryptographic library
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    // Get the latest block
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Validate voter eligibility
    validateVoter(voterId, biometricPin) {
        // Simulate voter validation
        const validVoters = {
            'V001': { pin: '1234', name: 'John Doe', constituency: 'Central District' },
            'V002': { pin: '5678', name: 'Jane Smith', constituency: 'North District' },
            'V003': { pin: '9012', name: 'Mike Johnson', constituency: 'South District' }
        };

        if (validVoters[voterId] && validVoters[voterId].pin === biometricPin) {
            return {
                valid: true,
                voter: {
                    id: voterId,
                    name: validVoters[voterId].name,
                    constituency: validVoters[voterId].constituency
                }
            };
        }
        return { valid: false };
    }

    // Check if voter has already voted
    hasVoted(voterId) {
        for (let block of this.chain) {
            for (let vote of block.votes) {
                if (vote.voterId === voterId) {
                    return true;
                }
            }
        }
        return false;
    }

    // Cast a vote
    castVote(voterId, candidateId) {
        if (!this.votingActive) {
            throw new Error('Voting is not currently active');
        }

        if (this.hasVoted(voterId)) {
            throw new Error('Voter has already cast their vote');
        }

        if (!this.candidates.has(candidateId)) {
            throw new Error('Invalid candidate');
        }

        const vote = {
            voterId: this.hashVoterId(voterId), // Hash voter ID for privacy
            candidateId: candidateId,
            timestamp: Date.now(),
            signature: this.generateVoteSignature(voterId, candidateId)
        };

        this.pendingVotes.push(vote);
        
        // Update candidate vote count
        const candidate = this.candidates.get(candidateId);
        candidate.votes++;
        this.candidates.set(candidateId, candidate);

        return vote;
    }

    // Hash voter ID for privacy
    hashVoterId(voterId) {
        return this.sha256(voterId + 'salt_for_privacy');
    }

    // Generate vote signature
    generateVoteSignature(voterId, candidateId) {
        const data = voterId + candidateId + Date.now();
        return this.sha256(data);
    }

    // Mine a new block (simplified proof of work)
    mineBlock() {
        if (this.pendingVotes.length === 0) {
            return null;
        }

        const previousBlock = this.getLatestBlock();
        const newBlock = {
            index: previousBlock.index + 1,
            timestamp: Date.now(),
            votes: [...this.pendingVotes],
            previousHash: previousBlock.hash,
            nonce: 0
        };

        // Simple proof of work (find hash starting with '00')
        while (!newBlock.hash || !newBlock.hash.startsWith('00')) {
            newBlock.nonce++;
            newBlock.hash = this.calculateHash(
                newBlock.index,
                newBlock.timestamp,
                newBlock.votes,
                newBlock.previousHash,
                newBlock.nonce
            );
        }

        this.chain.push(newBlock);
        this.pendingVotes = [];
        return newBlock;
    }

    // Validate the blockchain
    validateChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Check if current block hash is valid
            const calculatedHash = this.calculateHash(
                currentBlock.index,
                currentBlock.timestamp,
                currentBlock.votes,
                currentBlock.previousHash,
                currentBlock.nonce
            );

            if (currentBlock.hash !== calculatedHash) {
                return false;
            }

            // Check if previous hash matches
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    // Get voting results
    getResults() {
        const results = [];
        const totalVotes = Array.from(this.candidates.values()).reduce((sum, candidate) => sum + candidate.votes, 0);

        for (let candidate of this.candidates.values()) {
            const percentage = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0;
            results.push({
                ...candidate,
                percentage: percentage
            });
        }

        return results.sort((a, b) => b.votes - a.votes);
    }

    // Register new voter
    registerNewVoter(voterId, voterData) {
        this.voters.set(voterId, {
            id: voterId,
            name: voterData.fullName,
            constituency: voterData.constituency,
            phone: voterData.phoneNumber,
            aadhar: voterData.aadharNumber,
            registrationDate: new Date().toISOString(),
            hasVoted: false
        });
    }

    // Get blockchain statistics
    getBlockchainStats() {
        return {
            totalBlocks: this.chain.length,
            totalVotes: this.chain.reduce((sum, block) => sum + block.votes.length, 0),
            pendingVotes: this.pendingVotes.length,
            isValid: this.validateChain(),
            latestBlockHash: this.getLatestBlock().hash
        };
    }

    // Get recent blocks for explorer
    getRecentBlocks(count = 10) {
        return this.chain
            .slice(-count)
            .reverse()
            .map(block => ({
                number: block.index,
                hash: block.hash.substring(0, 8) + '...' + block.hash.substring(block.hash.length - 4),
                timestamp: block.timestamp,
                voteCount: block.votes.length,
                timeAgo: this.getTimeAgo(block.timestamp)
            }));
    }

    // Helper function to get time ago
    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// Initialize blockchain instance
const blockchain = new BlockchainVoting();

// Simulate periodic block mining
setInterval(() => {
    const newBlock = blockchain.mineBlock();
    if (newBlock) {
        console.log('New block mined:', newBlock);
        // Update UI if needed
        updateBlockchainUI();
    }
}, 15000); // Mine every 15 seconds

// Update blockchain UI elements
function updateBlockchainUI() {
    const stats = blockchain.getBlockchainStats();
    
    // Update block height
    const blockHeightElement = document.getElementById('blockHeight');
    if (blockHeightElement) {
        blockHeightElement.textContent = stats.totalBlocks.toLocaleString();
    }
    
    // Update total voters (simulated)
    const totalVotersElement = document.getElementById('totalVoters');
    if (totalVotersElement) {
        totalVotersElement.textContent = (stats.totalVotes + 1200).toLocaleString();
    }
}

// Export blockchain instance for use in other files
window.blockchain = blockchain;