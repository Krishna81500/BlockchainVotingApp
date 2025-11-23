// Admin Panel JavaScript
let currentSection = 'dashboard';
let voters = [];
let candidates = [
    {
        id: 1,
        name: 'Alice Johnson',
        party: 'Democratic Party',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
        experience: '15 years experience',
        votes: 3846
    },
    {
        id: 2,
        name: 'Robert Smith',
        party: 'Republican Party',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
        experience: '12 years experience',
        votes: 3248
    },
    {
        id: 3,
        name: 'Maria Garcia',
        party: 'Independent',
        photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
        experience: '8 years experience',
        votes: 1453
    }
];

// Navigation Functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked nav item
    event.currentTarget.classList.add('active');
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'voters': 'Voter Management',
        'candidates': 'Candidate Management',
        'elections': 'Election Management',
        'results': 'Election Results',
        'blockchain': 'Blockchain Monitor',
        'settings': 'System Settings'
    };
    
    document.getElementById('pageTitle').textContent = titles[sectionId] || 'Admin Panel';
    currentSection = sectionId;
    
    // Load section data
    loadSectionData(sectionId);
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'voters':
            loadVoters();
            break;
        case 'candidates':
            loadCandidates();
            break;
        case 'results':
            loadResults();
            break;
        case 'blockchain':
            loadBlockchain();
            break;
    }
}

// Dashboard Functions
function loadDashboard() {
    loadRecentRegistrations();
    loadVotingActivity();
    updateStats();
}

function loadRecentRegistrations() {
    const container = document.getElementById('recentRegistrations');
    const recentVoters = getStoredVoters().slice(-5).reverse();
    
    if (recentVoters.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No recent registrations</p>';
        return;
    }
    
    container.innerHTML = recentVoters.map(voter => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f3f4;">
            <div>
                <strong>${voter.name}</strong><br>
                <small style="color: #7f8c8d;">${voter.email}</small>
            </div>
            <span class="status-badge verified">Verified</span>
        </div>
    `).join('');
}

function loadVotingActivity() {
    const container = document.getElementById('votingActivity');
    const votes = JSON.parse(localStorage.getItem('votes') || '[]');
    const recentVotes = votes.slice(-5).reverse();
    
    if (recentVotes.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No recent voting activity</p>';
        return;
    }
    
    container.innerHTML = recentVotes.map(vote => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f3f4;">
            <div>
                <strong>${vote.candidate}</strong><br>
                <small style="color: #7f8c8d;">Vote from ${vote.voter}</small>
            </div>
            <small style="color: #7f8c8d;">${new Date(vote.timestamp).toLocaleTimeString()}</small>
        </div>
    `).join('');
}

function updateStats() {
    const voters = getStoredVoters();
    const votes = JSON.parse(localStorage.getItem('votes') || '[]');
    
    document.getElementById('totalVoters').textContent = voters.length.toLocaleString();
    document.getElementById('totalVotes').textContent = votes.length.toLocaleString();
    
    // Update block height with animation
    const blockHeightEl = document.getElementById('blockHeight');
    const currentHeight = parseInt(blockHeightEl.textContent.replace(',', ''));
    blockHeightEl.textContent = (currentHeight + Math.floor(Math.random() * 3)).toLocaleString();
}

// Voter Management Functions
function loadVoters() {
    const voters = getStoredVoters();
    const tbody = document.getElementById('votersTableBody');
    
    if (voters.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #7f8c8d;">No voters registered yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = voters.map(voter => `
        <tr>
            <td>${voter.name}</td>
            <td>${voter.email}</td>
            <td>${voter.aadhaar ? voter.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : 'N/A'}</td>
            <td>${voter.phone || 'N/A'}</td>
            <td><span class="status-badge verified">Verified</span></td>
            <td>${new Date(voter.registrationTime).toLocaleDateString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewVoter('${voter.email}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editVoter('${voter.email}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteVoter('${voter.email}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getStoredVoters() {
    const voters = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_')) {
            const userData = JSON.parse(localStorage.getItem(key));
            voters.push(userData);
        }
    }
    return voters.sort((a, b) => new Date(b.registrationTime) - new Date(a.registrationTime));
}

function searchVoters() {
    const searchTerm = document.getElementById('voterSearch').value.toLowerCase();
    const voters = getStoredVoters();
    const filteredVoters = voters.filter(voter => 
        voter.name.toLowerCase().includes(searchTerm) ||
        voter.email.toLowerCase().includes(searchTerm) ||
        (voter.aadhaar && voter.aadhaar.includes(searchTerm))
    );
    
    const tbody = document.getElementById('votersTableBody');
    tbody.innerHTML = filteredVoters.map(voter => `
        <tr>
            <td>${voter.name}</td>
            <td>${voter.email}</td>
            <td>${voter.aadhaar ? voter.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : 'N/A'}</td>
            <td>${voter.phone || 'N/A'}</td>
            <td><span class="status-badge verified">Verified</span></td>
            <td>${new Date(voter.registrationTime).toLocaleDateString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewVoter('${voter.email}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editVoter('${voter.email}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteVoter('${voter.email}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function viewVoter(email) {
    const voter = JSON.parse(localStorage.getItem(`user_${email}`));
    if (voter) {
        alert(`Voter Details:\n\nName: ${voter.name}\nEmail: ${voter.email}\nAadhaar: ${voter.aadhaar || 'N/A'}\nPhone: ${voter.phone || 'N/A'}\nRegistration: ${new Date(voter.registrationTime).toLocaleString()}`);
    }
}

function editVoter(email) {
    alert('Edit voter functionality would be implemented here');
}

function deleteVoter(email) {
    if (confirm('Are you sure you want to delete this voter?')) {
        localStorage.removeItem(`user_${email}`);
        loadVoters();
        updateStats();
        alert('Voter deleted successfully');
    }
}

function exportVoters() {
    const voters = getStoredVoters();
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Name,Email,Aadhaar,Phone,Registration Date\n" +
        voters.map(voter => 
            `"${voter.name}","${voter.email}","${voter.aadhaar || 'N/A'}","${voter.phone || 'N/A'}","${new Date(voter.registrationTime).toLocaleString()}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "voters_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function refreshVoters() {
    loadVoters();
    alert('Voter data refreshed');
}

// Candidate Management Functions
function loadCandidates() {
    const container = document.getElementById('candidatesGrid');
    
    container.innerHTML = candidates.map(candidate => `
        <div class="candidate-card">
            <img src="${candidate.photo}" alt="${candidate.name}" class="candidate-photo">
            <h4>${candidate.name}</h4>
            <p>${candidate.party}</p>
            <p style="font-size: 14px; color: #7f8c8d;">${candidate.experience}</p>
            <p style="font-weight: 600; color: #3498db;">${candidate.votes.toLocaleString()} votes</p>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button class="btn-secondary" onclick="editCandidate(${candidate.id})" style="flex: 1; padding: 8px;">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-danger" onclick="deleteCandidate(${candidate.id})" style="flex: 1; padding: 8px;">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function addCandidate() {
    showModal('candidateModal');
}

function editCandidate(id) {
    const candidate = candidates.find(c => c.id === id);
    if (candidate) {
        document.getElementById('candidateName').value = candidate.name;
        document.getElementById('candidateParty').value = candidate.party;
        document.getElementById('candidatePhoto').value = candidate.photo;
        document.getElementById('candidateExperience').value = candidate.experience;
        showModal('candidateModal');
    }
}

function deleteCandidate(id) {
    if (confirm('Are you sure you want to delete this candidate?')) {
        candidates = candidates.filter(c => c.id !== id);
        loadCandidates();
        alert('Candidate deleted successfully');
    }
}

function saveCandidateModal() {
    const name = document.getElementById('candidateName').value;
    const party = document.getElementById('candidateParty').value;
    const photo = document.getElementById('candidatePhoto').value;
    const experience = document.getElementById('candidateExperience').value;
    
    if (!name || !party) {
        alert('Please fill in all required fields');
        return;
    }
    
    const newCandidate = {
        id: candidates.length + 1,
        name,
        party,
        photo: photo || 'https://via.placeholder.com/80',
        experience: experience || 'New candidate',
        votes: 0
    };
    
    candidates.push(newCandidate);
    loadCandidates();
    closeModal('candidateModal');
    alert('Candidate added successfully');
    
    // Clear form
    document.getElementById('candidateName').value = '';
    document.getElementById('candidateParty').value = '';
    document.getElementById('candidatePhoto').value = '';
    document.getElementById('candidateExperience').value = '';
}

// Election Management Functions
function startElection() {
    if (confirm('Are you sure you want to start the election?')) {
        alert('Election started successfully');
    }
}

function pauseElection() {
    if (confirm('Are you sure you want to pause the election?')) {
        alert('Election paused successfully');
    }
}

function endElection() {
    if (confirm('Are you sure you want to end the election? This action cannot be undone.')) {
        alert('Election ended successfully');
    }
}

function createElection() {
    alert('Create new election functionality would be implemented here');
}

// Results Functions
function loadResults() {
    // Update candidate vote counts from stored votes
    const votes = JSON.parse(localStorage.getItem('votes') || '[]');
    const voteCounts = {};
    
    votes.forEach(vote => {
        voteCounts[vote.candidate] = (voteCounts[vote.candidate] || 0) + 1;
    });
    
    candidates.forEach(candidate => {
        candidate.votes = voteCounts[candidate.name] || 0;
    });
    
    // Update results display
    const totalVotes = votes.length;
    const turnout = totalVotes > 0 ? ((totalVotes / getStoredVoters().length) * 100).toFixed(1) : 0;
    const leader = candidates.reduce((prev, current) => (prev.votes > current.votes) ? prev : current);
    
    document.querySelector('.results-overview .count').textContent = totalVotes.toLocaleString();
    document.querySelector('.results-overview .percentage').textContent = turnout + '%';
    document.querySelector('.results-overview .leader').textContent = leader.name;
}

function exportResults() {
    const votes = JSON.parse(localStorage.getItem('votes') || '[]');
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Candidate,Voter,Timestamp,Block Hash\n" +
        votes.map(vote => 
            `"${vote.candidate}","${vote.voter}","${new Date(vote.timestamp).toLocaleString()}","${vote.blockHash}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "election_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function refreshResults() {
    loadResults();
    alert('Results refreshed');
}

// Blockchain Functions
function loadBlockchain() {
    const tbody = document.getElementById('blocksTableBody');
    const blocks = generateMockBlocks(10);
    
    tbody.innerHTML = blocks.map(block => `
        <tr>
            <td>#${block.number}</td>
            <td style="font-family: monospace; font-size: 12px;">${block.hash}</td>
            <td>${block.transactions}</td>
            <td>${block.timestamp}</td>
            <td>${block.size}</td>
        </tr>
    `).join('');
}

function generateMockBlocks(count) {
    const blocks = [];
    const baseBlock = 12847;
    
    for (let i = 0; i < count; i++) {
        blocks.push({
            number: baseBlock - i,
            hash: '0x' + Math.random().toString(16).substr(2, 8) + '...' + Math.random().toString(16).substr(2, 4),
            transactions: Math.floor(Math.random() * 50) + 1,
            timestamp: new Date(Date.now() - (i * 15 * 60 * 1000)).toLocaleString(),
            size: (Math.random() * 2 + 0.5).toFixed(2) + ' KB'
        });
    }
    
    return blocks;
}

function refreshBlockchain() {
    loadBlockchain();
    alert('Blockchain data refreshed');
}

// Modal Functions
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.getElementById(modalId).style.display = 'none';
}

// Utility Functions
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        alert('Logged out successfully');
        // In a real app, redirect to login page
    }
}

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Panel Loaded');
    
    // Load initial dashboard
    loadDashboard();
    
    // Update stats periodically
    setInterval(() => {
        if (currentSection === 'dashboard') {
            updateStats();
        }
    }, 30000);
    
    // Close modals when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
            event.target.style.display = 'none';
        }
    });
});