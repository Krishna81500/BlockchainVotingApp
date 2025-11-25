class AdminPanel {
    constructor() {
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadRegistrations();
        this.updateStats();
        setInterval(() => {
            this.loadRegistrations();
            this.updateStats();
        }, 5000); // Refresh every 5 seconds
    }

    async loadRegistrations() {
        try {
            const response = await fetch('/api/admin/registrations');
            const data = await response.json();
            
            if (data.success) {
                this.displayRegistrations(data.registrations);
            }
        } catch (error) {
            console.error('Failed to load registrations:', error);
        }
    }

    displayRegistrations(registrations) {
        const container = document.getElementById('registrationsList');
        
        // Filter registrations based on current filter
        let filtered = registrations;
        if (this.currentFilter !== 'all') {
            filtered = registrations.filter(reg => reg.status === this.currentFilter);
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No registrations found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(registration => `
            <div class="registration-item">
                <div class="user-info">
                    <div class="user-name">${registration.aadharName}</div>
                    <div class="user-email">${registration.email}</div>
                    <div class="user-details">
                        ${registration.phone} • ${registration.state}, ${registration.country}
                    </div>
                    <div class="user-details">
                        Registered: ${new Date(registration.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="status-badge status-${registration.status}">
                        ${registration.status}
                    </span>
                    <div class="action-buttons">
                        <button class="btn btn-view" onclick="viewRegistration('${registration.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${registration.status === 'pending' ? `
                            <button class="btn btn-approve" onclick="approveRegistration('${registration.id}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-reject" onclick="rejectRegistration('${registration.id}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    async updateStats() {
        try {
            const response = await fetch('/api/admin/stats');
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('totalUsers').textContent = data.stats.total;
                document.getElementById('pendingUsers').textContent = data.stats.pending;
                document.getElementById('approvedUsers').textContent = data.stats.approved;
                document.getElementById('rejectedUsers').textContent = data.stats.rejected;
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    filterRegistrations(filter) {
        this.currentFilter = filter;
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.loadRegistrations();
    }

    async approveRegistration(id) {
        try {
            const response = await fetch(`/api/admin/approve/${id}`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                this.showAlert('Registration approved successfully', 'success');
                this.loadRegistrations();
                this.updateStats();
            } else {
                this.showAlert(data.message, 'error');
            }
        } catch (error) {
            this.showAlert('Failed to approve registration', 'error');
        }
    }

    async rejectRegistration(id) {
        try {
            const response = await fetch(`/api/admin/reject/${id}`, {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.success) {
                this.showAlert('Registration rejected', 'success');
                this.loadRegistrations();
                this.updateStats();
            } else {
                this.showAlert(data.message, 'error');
            }
        } catch (error) {
            this.showAlert('Failed to reject registration', 'error');
        }
    }

    showAlert(message, type) {
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        alert.textContent = message;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            document.body.removeChild(alert);
        }, 3000);
    }
}

// Global functions
function filterRegistrations(filter) {
    adminPanel.filterRegistrations(filter);
}

function approveRegistration(id) {
    adminPanel.approveRegistration(id);
}

function rejectRegistration(id) {
    adminPanel.rejectRegistration(id);
}

function viewRegistration(id) {
    // Implementation for viewing detailed registration info
    adminPanel.showAlert('View registration feature coming soon', 'info');
}

function logout() {
    window.location.href = '/';
}

// Email checking functions
async function checkEmailStatus() {
    const email = document.getElementById('checkEmailInput').value;
    const resultDiv = document.getElementById('emailCheckResult');
    
    if (!email) {
        adminPanel.showAlert('Please enter an email address', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/check-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.success) {
            let statusClass = '';
            let statusIcon = '';
            
            switch(data.status) {
                case 'approved':
                    statusClass = 'status-approved';
                    statusIcon = 'fas fa-check-circle';
                    break;
                case 'pending':
                    statusClass = 'status-pending';
                    statusIcon = 'fas fa-clock';
                    break;
                case 'rejected':
                    statusClass = 'status-rejected';
                    statusIcon = 'fas fa-times-circle';
                    break;
                default:
                    statusClass = 'status-not-registered';
                    statusIcon = 'fas fa-user-plus';
            }
            
            resultDiv.innerHTML = `
                <div class="email-status-card ${statusClass}">
                    <div class="status-header">
                        <i class="${statusIcon}"></i>
                        <h4>${email}</h4>
                    </div>
                    <div class="status-info">
                        <p><strong>Status:</strong> ${data.status.replace('_', ' ').toUpperCase()}</p>
                        <p><strong>Message:</strong> ${data.message}</p>
                        ${data.user ? `
                            <div class="user-details">
                                <p><strong>Name:</strong> ${data.user.name}</p>
                                <p><strong>Phone:</strong> ${data.user.phone}</p>
                                <p><strong>Constituency:</strong> ${data.user.constituency}</p>
                                <p><strong>Approved:</strong> ${new Date(data.user.approvedAt).toLocaleString()}</p>
                            </div>
                        ` : ''}
                        ${data.registration ? `
                            <div class="registration-details">
                                <p><strong>Name:</strong> ${data.registration.aadharName}</p>
                                <p><strong>Phone:</strong> ${data.registration.phone}</p>
                                <p><strong>Registered:</strong> ${new Date(data.registration.createdAt).toLocaleString()}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="email-status-card status-error">
                    <p>Error: ${data.message}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error checking email:', error);
        resultDiv.innerHTML = `
            <div class="email-status-card status-error">
                <p>Error checking email status</p>
            </div>
        `;
    }
}

async function loadRegisteredEmails() {
    try {
        const response = await fetch('/api/admin/registered-emails');
        const data = await response.json();
        
        if (data.success) {
            const container = document.getElementById('registeredEmailsList');
            const emails = data.emails;
            
            // Update stats
            document.getElementById('totalEmails').textContent = emails.length;
            document.getElementById('approvedEmails').textContent = emails.filter(e => e.status === 'approved').length;
            document.getElementById('pendingEmails').textContent = emails.filter(e => e.status === 'pending').length;
            document.getElementById('rejectedEmails').textContent = emails.filter(e => e.status === 'rejected').length;
            
            if (emails.length === 0) {
                container.innerHTML = '<p>No registered emails found</p>';
                return;
            }
            
            container.innerHTML = `
                <div class="emails-table">
                    <div class="table-header">
                        <span>Email</span>
                        <span>Name</span>
                        <span>Status</span>
                        <span>Registered</span>
                        <span>Action Date</span>
                    </div>
                    ${emails.map(email => `
                        <div class="table-row">
                            <span class="email-cell">${email.email}</span>
                            <span>${email.aadharName}</span>
                            <span class="status-badge status-${email.status}">${email.status}</span>
                            <span>${new Date(email.createdAt).toLocaleDateString()}</span>
                            <span>${email.approvedAt ? new Date(email.approvedAt).toLocaleDateString() : 
                                   email.rejectedAt ? new Date(email.rejectedAt).toLocaleDateString() : '-'}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading registered emails:', error);
        adminPanel.showAlert('Failed to load registered emails', 'error');
    }
}

async function loadEmailLogs() {
    try {
        const response = await fetch('/api/admin/email-logs');
        const data = await response.json();
        
        if (data.success) {
            const container = document.getElementById('emailLogsList');
            const logs = data.logs;
            
            if (logs.length === 0) {
                container.innerHTML = '<p>No email logs found</p>';
                return;
            }
            
            container.innerHTML = `
                <div class="logs-table">
                    <div class="table-header">
                        <span>Email</span>
                        <span>Check Type</span>
                        <span>Result</span>
                        <span>Timestamp</span>
                    </div>
                    ${logs.map(log => `
                        <div class="table-row">
                            <span class="email-cell">${log.email}</span>
                            <span>${log.checkType.replace('_', ' ')}</span>
                            <span class="result-badge result-${log.result}">${log.result}</span>
                            <span>${new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading email logs:', error);
        adminPanel.showAlert('Failed to load email logs', 'error');
    }
}

// Tab switching function
function showAdminTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data for specific tabs
    if (tabName === 'emailCheck') {
        loadRegisteredEmails();
    }
}

// Indian candidates data
const indianCandidates = [
    {
        id: 1,
        name: 'Narendra Modi',
        party: 'Bharatiya Janata Party (BJP)',
        achievements: [
            'Prime Minister of India (2014-present)',
            'Chief Minister of Gujarat (2001-2014)',
            'Digital India Initiative',
            'Swachh Bharat Mission'
        ],
        experience: '23+ years in politics',
        votes: 4247,
        percentage: 42
    },
    {
        id: 2,
        name: 'Rahul Gandhi',
        party: 'Indian National Congress (INC)',
        achievements: [
            'Member of Parliament, Wayanad',
            'Former Congress President (2017-2019)',
            'Youth Congress President (2007-2013)',
            'Advocate for farmers\' rights'
        ],
        experience: '19+ years in politics',
        votes: 2834,
        percentage: 28
    },
    {
        id: 3,
        name: 'Arvind Kejriwal',
        party: 'Aam Aadmi Party (AAP)',
        achievements: [
            'Chief Minister of Delhi (2015-present)',
            'Ramon Magsaysay Award (2006)',
            'Education & Healthcare reforms',
            'Anti-corruption activist'
        ],
        experience: '12+ years in politics',
        votes: 1518,
        percentage: 15
    },
    {
        id: 4,
        name: 'Mamata Banerjee',
        party: 'All India Trinamool Congress (AITC)',
        achievements: [
            'Chief Minister of West Bengal (2011-present)',
            'Railway Minister (2009-2012)',
            'Founded Trinamool Congress (1998)',
            'Women empowerment advocate'
        ],
        experience: '40+ years in politics',
        votes: 1012,
        percentage: 10
    },
    {
        id: 5,
        name: 'Yogi Adityanath',
        party: 'Bharatiya Janata Party (BJP)',
        achievements: [
            'Chief Minister of Uttar Pradesh (2017-present)',
            'Member of Parliament (1998-2017)',
            'Law & order improvements in UP',
            'Infrastructure development'
        ],
        experience: '25+ years in politics',
        votes: 506,
        percentage: 5
    }
];

// Add candidate management functions
function addCandidate() {
    const name = document.getElementById('candidateName').value;
    const party = document.getElementById('candidateParty').value;
    const photo = document.getElementById('candidatePhoto').files[0];
    
    if (!name || !party) {
        alert('Please fill in candidate name and party');
        return;
    }
    
    // In a real app, this would send to server
    alert(`Candidate ${name} from ${party} added successfully!`);
    
    // Clear form
    document.getElementById('candidateName').value = '';
    document.getElementById('candidateParty').value = '';
    document.getElementById('candidatePhoto').value = '';
    
    loadCandidatesList();
}

function loadCandidatesList() {
    const container = document.getElementById('candidatesList');
    if (!container) return;
    
    container.innerHTML = indianCandidates.map(candidate => `
        <div class="candidate-item">
            <div class="candidate-info">
                <div class="candidate-avatar">
                    <i class="fas fa-user-tie"></i>
                </div>
                <div class="candidate-details">
                    <h4>${candidate.name}</h4>
                    <p>${candidate.party}</p>
                    <div class="achievements">
                        ${candidate.achievements.map(achievement => 
                            `<span class="achievement">${achievement}</span>`
                        ).join('')}
                    </div>
                    <span class="experience">${candidate.experience}</span>
                </div>
            </div>
            <div class="candidate-actions">
                <button class="btn btn-edit" onclick="editCandidate(${candidate.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-delete" onclick="removeCandidate(${candidate.id})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');
}

function editCandidate(id) {
    const candidate = indianCandidates.find(c => c.id === id);
    if (candidate) {
        alert(`Edit candidate: ${candidate.name}\nFeature coming soon!`);
    }
}

function removeCandidate(id) {
    const candidate = indianCandidates.find(c => c.id === id);
    if (candidate && confirm(`Remove ${candidate.name} from the election?`)) {
        alert(`${candidate.name} removed from election`);
        // In real app, would remove from array and update server
        loadCandidatesList();
    }
}

// Election management functions
function createElection() {
    const title = document.getElementById('electionTitle').value;
    const description = document.getElementById('electionDescription').value;
    const startDate = document.getElementById('electionStart').value;
    const endDate = document.getElementById('electionEnd').value;
    
    if (!title || !description || !startDate || !endDate) {
        alert('Please fill in all election details');
        return;
    }
    
    alert(`Election "${title}" created successfully!\nStart: ${startDate}\nEnd: ${endDate}`);
    
    // Clear form
    document.getElementById('electionTitle').value = '';
    document.getElementById('electionDescription').value = '';
    document.getElementById('electionStart').value = '';
    document.getElementById('electionEnd').value = '';
}

// Voting control functions
function startVoting() {
    document.getElementById('electionStatus').textContent = 'Active';
    document.getElementById('electionStatus').className = 'status-indicator active';
    alert('Voting has been started!');
}

function pauseVoting() {
    document.getElementById('electionStatus').textContent = 'Paused';
    document.getElementById('electionStatus').className = 'status-indicator paused';
    alert('Voting has been paused!');
}

function stopVoting() {
    document.getElementById('electionStatus').textContent = 'Stopped';
    document.getElementById('electionStatus').className = 'status-indicator stopped';
    alert('Voting has been stopped!');
}

// Results functions
function generateResults() {
    const container = document.getElementById('resultsDisplay');
    if (!container) return;
    
    container.innerHTML = `
        <div class="results-summary">
            <h3>Election Results - General Election 2024</h3>
            <p>Total Votes Cast: ${indianCandidates.reduce((sum, c) => sum + c.votes, 0)}</p>
        </div>
        <div class="results-list">
            ${indianCandidates.sort((a, b) => b.votes - a.votes).map(candidate => `
                <div class="result-item">
                    <div class="candidate-result">
                        <div class="candidate-avatar">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="result-info">
                            <h4>${candidate.name}</h4>
                            <p>${candidate.party}</p>
                        </div>
                    </div>
                    <div class="vote-stats">
                        <div class="progress-bar">
                            <div class="progress" style="width: ${candidate.percentage}%"></div>
                        </div>
                        <span class="vote-count">${candidate.votes} votes (${candidate.percentage}%)</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    alert('Results generated successfully!');
}

function exportResults() {
    alert('Results exported to CSV file!');
}

function viewBlockchain() {
    alert('Opening blockchain explorer...');
}

// Initialize admin panel
const adminPanel = new AdminPanel();

// Load candidates list on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        loadCandidatesList();
        loadRegisteredEmails();
    }, 1000);
});