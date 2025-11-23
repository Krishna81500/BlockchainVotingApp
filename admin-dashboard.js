class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.checkAuth();
        this.loadDashboardData();
        this.setupEventListeners();
        
        // Refresh data every 30 seconds
        setInterval(() => {
            this.loadDashboardData();
        }, 30000);
    }

    checkAuth() {
        const token = localStorage.getItem('adminToken');
        const adminInfo = localStorage.getItem('adminInfo');
        
        if (!token || !adminInfo) {
            window.location.href = '/admin-login';
            return;
        }

        const admin = JSON.parse(adminInfo);
        document.getElementById('adminName').textContent = admin.name;
    }

    setupEventListeners() {
        document.getElementById('createElectionForm').addEventListener('submit', (e) => this.createElection(e));
        document.getElementById('addCandidateForm').addEventListener('submit', (e) => this.addCandidate(e));
        document.getElementById('bulkAddForm').addEventListener('submit', (e) => this.bulkAddCandidates(e));
    }

    showSection(section) {
        this.currentSection = section;
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Show/hide sections
        document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        
        // Load section-specific data
        switch(section) {
            case 'elections':
                this.loadElections();
                break;
            case 'candidates':
                this.loadElectionOptions();
                break;
            case 'registrations':
                this.loadRegistrations();
                break;
            case 'results':
                this.loadElectionOptions('resultsElectionSelect');
                break;
        }
    }

    async loadDashboardData() {
        try {
            const [statsRes, electionsRes, candidatesRes] = await Promise.all([
                fetch('/api/admin/stats'),
                fetch('/api/admin/elections'),
                fetch('/api/admin/candidates')
            ]);

            const stats = await statsRes.json();
            const elections = await electionsRes.json();
            const candidates = await candidatesRes.json();

            if (stats.success) {
                document.getElementById('approvedVoters').textContent = stats.stats.approved;
                document.getElementById('pendingApprovals').textContent = stats.stats.pending;
            }

            if (elections.success) {
                const activeElections = elections.elections.filter(e => e.status === 'active').length;
                document.getElementById('activeElections').textContent = activeElections;
            }

            if (candidates.success) {
                document.getElementById('totalCandidates').textContent = candidates.candidates.length;
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    // Election Management
    showCreateElection() {
        document.getElementById('createElectionModal').style.display = 'flex';
    }

    hideCreateElection() {
        document.getElementById('createElectionModal').style.display = 'none';
        document.getElementById('createElectionForm').reset();
    }

    async createElection(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('electionTitle').value,
            description: document.getElementById('electionDescription').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            type: document.getElementById('electionType').value
        };

        try {
            const response = await fetch('/api/admin/elections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.showAlert('Election created successfully!', 'success');
                this.hideCreateElection();
                this.loadElections();
                this.loadDashboardData();
            } else {
                this.showAlert(data.message, 'error');
            }
        } catch (error) {
            this.showAlert('Failed to create election', 'error');
        }
    }

    async loadElections() {
        try {
            const response = await fetch('/api/admin/elections');
            const data = await response.json();

            if (data.success) {
                this.displayElections(data.elections);
            }
        } catch (error) {
            console.error('Failed to load elections:', error);
        }
    }

    displayElections(elections) {
        const container = document.getElementById('electionsList');
        
        if (elections.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No elections found</p></div>';
            return;
        }

        container.innerHTML = elections.map(election => `
            <div class="election-item">
                <div class="election-info">
                    <h3>${election.title}</h3>
                    <p>${election.description}</p>
                    <div class="election-details">
                        <span><i class="fas fa-calendar"></i> ${new Date(election.startDate).toLocaleDateString()} - ${new Date(election.endDate).toLocaleDateString()}</span>
                        <span><i class="fas fa-tag"></i> ${election.type}</span>
                    </div>
                </div>
                <div class="election-actions">
                    <span class="status-badge status-${election.status}">${election.status}</span>
                    <button class="btn btn-sm btn-primary" onclick="editElection('${election.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="toggleElectionStatus('${election.id}', '${election.status}')">
                        <i class="fas fa-power-off"></i> ${election.status === 'active' ? 'Stop' : 'Start'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Candidate Management
    showAddCandidate() {
        this.loadElectionOptions('candidateElection');
        document.getElementById('addCandidateModal').style.display = 'flex';
    }

    hideAddCandidate() {
        document.getElementById('addCandidateModal').style.display = 'none';
        document.getElementById('addCandidateForm').reset();
    }

    async loadElectionOptions(selectId = 'candidateElectionSelect') {
        try {
            const response = await fetch('/api/admin/elections');
            const data = await response.json();

            if (data.success) {
                const select = document.getElementById(selectId);
                select.innerHTML = '<option value="">Choose an election</option>';
                
                data.elections.forEach(election => {
                    select.innerHTML += `<option value="${election.id}">${election.title}</option>`;
                });
            }
        } catch (error) {
            console.error('Failed to load elections:', error);
        }
    }

    async addCandidate(e) {
        e.preventDefault();
        
        const formData = {
            electionId: document.getElementById('candidateElection').value,
            name: document.getElementById('candidateName').value,
            party: document.getElementById('candidateParty').value,
            age: parseInt(document.getElementById('candidateAge').value),
            qualification: document.getElementById('candidateQualification').value,
            manifesto: document.getElementById('candidateManifesto').value
        };

        try {
            const response = await fetch('/api/admin/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.showAlert('Candidate added successfully!', 'success');
                this.hideAddCandidate();
                this.loadCandidates();
                this.loadDashboardData();
            } else {
                this.showAlert(data.message, 'error');
            }
        } catch (error) {
            this.showAlert('Failed to add candidate', 'error');
        }
    }

    showBulkAdd() {
        this.loadElectionOptions('bulkElection');
        document.getElementById('bulkAddModal').style.display = 'flex';
        this.generateCandidateFields();
    }

    hideBulkAdd() {
        document.getElementById('bulkAddModal').style.display = 'none';
        document.getElementById('bulkAddForm').reset();
    }

    generateCandidateFields() {
        const count = parseInt(document.getElementById('candidateCount')?.value || 2);
        const container = document.getElementById('candidateFields');
        
        container.innerHTML = '';
        
        for (let i = 1; i <= count; i++) {
            const candidateDiv = document.createElement('div');
            candidateDiv.className = 'candidate-form-group';
            candidateDiv.innerHTML = `
                <h4>Candidate ${i}</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" name="candidate_${i}_name" required>
                    </div>
                    <div class="form-group">
                        <label>Party</label>
                        <input type="text" name="candidate_${i}_party" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Age</label>
                        <input type="number" name="candidate_${i}_age" min="18" required>
                    </div>
                    <div class="form-group">
                        <label>Qualification</label>
                        <input type="text" name="candidate_${i}_qualification" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Manifesto</label>
                    <textarea name="candidate_${i}_manifesto" rows="2"></textarea>
                </div>
            `;
            container.appendChild(candidateDiv);
        }
    }

    async bulkAddCandidates(e) {
        e.preventDefault();
        
        const electionId = document.getElementById('bulkElection').value;
        const count = parseInt(document.getElementById('candidateCount')?.value || 2);
        const candidates = [];
        
        for (let i = 1; i <= count; i++) {
            const name = document.querySelector(`[name="candidate_${i}_name"]`).value;
            const party = document.querySelector(`[name="candidate_${i}_party"]`).value;
            const age = parseInt(document.querySelector(`[name="candidate_${i}_age"]`).value);
            const qualification = document.querySelector(`[name="candidate_${i}_qualification"]`).value;
            const manifesto = document.querySelector(`[name="candidate_${i}_manifesto"]`).value;
            
            if (name && party && age && qualification) {
                candidates.push({
                    electionId,
                    name,
                    party,
                    age,
                    qualification,
                    manifesto
                });
            }
        }
        
        if (candidates.length === 0) {
            this.showAlert('Please fill at least one candidate', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/admin/candidates/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidates })
            });

            const data = await response.json();

            if (data.success) {
                this.showAlert(`${candidates.length} candidates added successfully!`, 'success');
                this.hideBulkAdd();
                this.loadCandidates();
                this.loadDashboardData();
            } else {
                this.showAlert(data.message, 'error');
            }
        } catch (error) {
            this.showAlert('Failed to add candidates', 'error');
        }
    }

    async loadCandidates() {
        const electionId = document.getElementById('candidateElectionSelect').value;
        if (!electionId) {
            document.getElementById('candidatesList').innerHTML = '<div class="empty-state"><p>Please select an election</p></div>';
            return;
        }

        try {
            const response = await fetch(`/api/admin/candidates?electionId=${electionId}`);
            const data = await response.json();

            if (data.success) {
                this.displayCandidates(data.candidates);
            }
        } catch (error) {
            console.error('Failed to load candidates:', error);
        }
    }

    displayCandidates(candidates) {
        const container = document.getElementById('candidatesList');
        
        if (candidates.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No candidates found</p></div>';
            return;
        }

        container.innerHTML = candidates.map(candidate => `
            <div class="candidate-item">
                <div class="candidate-info">
                    <h3>${candidate.name}</h3>
                    <p><strong>Party:</strong> ${candidate.party}</p>
                    <p><strong>Age:</strong> ${candidate.age} | <strong>Qualification:</strong> ${candidate.qualification}</p>
                    <p><strong>Manifesto:</strong> ${candidate.manifesto}</p>
                </div>
                <div class="candidate-actions">
                    <button class="btn btn-sm btn-primary" onclick="editCandidate('${candidate.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="removeCandidate('${candidate.id}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Registration Management (existing functionality)
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
        
        let filtered = registrations;
        if (this.currentFilter !== 'all') {
            filtered = registrations.filter(reg => reg.status === this.currentFilter);
        }

        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No registrations found</p></div>';
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
                        ${registration.hasFaceData ? ' • <i class="fas fa-camera" style="color: #10b981;"></i> Face Data' : ''}
                        ${registration.hasDocument ? ' • <i class="fas fa-file-image" style="color: #3b82f6;"></i> Document' : ''}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="status-badge status-${registration.status}">${registration.status}</span>
                    <div class="action-buttons">
                        ${registration.hasFaceData ? `
                            <button class="btn btn-view" onclick="viewFaceData('${registration.id}')">
                                <i class="fas fa-eye"></i> Face
                            </button>
                        ` : ''}
                        ${registration.hasDocument ? `
                            <button class="btn btn-view" onclick="viewDocument('${registration.id}')">
                                <i class="fas fa-file"></i> Document
                            </button>
                        ` : ''}
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

    async viewFaceData(id) {
        try {
            const response = await fetch(`/api/admin/user-face/${id}`);
            const data = await response.json();
            
            if (data.success) {
                this.showFaceModal(data.faceData, id);
            } else {
                this.showAlert(data.message, 'error');
            }
        } catch (error) {
            this.showAlert('Failed to load face data', 'error');
        }
    }

    async viewDocument(id) {
        try {
            const response = await fetch(`/api/admin/user-document/${id}`);
            const data = await response.json();
            
            if (data.success) {
                this.showDocumentModal(data.documentData);
            } else {
                this.showAlert(data.message, 'error');
            }
        } catch (error) {
            this.showAlert('Failed to load document', 'error');
        }
    }

    showFaceModal(faceData, registrationId) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Face Verification - ${faceData.userName}</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="${faceData.imageData}" alt="User Face" style="max-width: 200px; border-radius: 10px; border: 2px solid #d4af37;">
                    </div>
                    <div class="face-info">
                        <p><strong>Email:</strong> ${faceData.email}</p>
                        <p><strong>Captured:</strong> ${new Date(faceData.capturedAt).toLocaleString()}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${faceData.verified ? 'approved' : 'pending'}">${faceData.verified ? 'Verified' : 'Pending'}</span></p>
                    </div>
                </div>
                <div class="modal-actions">
                    ${!faceData.verified ? `
                        <button class="btn btn-approve" onclick="verifyFace('${registrationId}', true)">
                            <i class="fas fa-check"></i> Verify Face
                        </button>
                        <button class="btn btn-reject" onclick="verifyFace('${registrationId}', false)">
                            <i class="fas fa-times"></i> Reject Face
                        </button>
                    ` : '<p style="color: #10b981; text-align: center;">Face already verified</p>'}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showDocumentModal(documentData) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Document Verification - ${documentData.userName}</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="${documentData.documentImage}" alt="User Document" style="max-width: 100%; border-radius: 10px; border: 2px solid #d4af37;">
                    </div>
                    <div class="document-info">
                        <p><strong>Email:</strong> ${documentData.email}</p>
                        <p><strong>Uploaded:</strong> ${new Date(documentData.uploadedAt).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async verifyFace(registrationId, verified) {
        try {
            const response = await fetch(`/api/admin/verify-face/${registrationId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verified })
            });
            const data = await response.json();
            
            if (data.success) {
                this.showAlert(data.message, 'success');
                document.querySelector('.modal').remove();
                this.loadRegistrations();
            } else {
                this.showAlert(data.message, 'error');
            }
        } catch (error) {
            this.showAlert('Failed to verify face', 'error');
        }
    }

    filterRegistrations(filter) {
        this.currentFilter = filter;
        
        document.querySelectorAll('.filter-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        this.loadRegistrations();
    }

    async approveRegistration(id) {
        try {
            const response = await fetch(`/api/admin/approve/${id}`, { method: 'POST' });
            const data = await response.json();
            
            if (data.success) {
                this.showAlert('Registration approved successfully', 'success');
                this.loadRegistrations();
                this.loadDashboardData();
            } else {
                this.showAlert(data.message, 'error');
            }
        } catch (error) {
            this.showAlert('Failed to approve registration', 'error');
        }
    }

    async rejectRegistration(id) {
        try {
            const response = await fetch(`/api/admin/reject/${id}`, { method: 'POST' });
            const data = await response.json();
            
            if (data.success) {
                this.showAlert('Registration rejected', 'success');
                this.loadRegistrations();
                this.loadDashboardData();
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
            if (document.body.contains(alert)) {
                document.body.removeChild(alert);
            }
        }, 3000);
    }
}

// Global functions
function showSection(section) {
    dashboard.showSection(section);
}

function showCreateElection() {
    dashboard.showCreateElection();
}

function hideCreateElection() {
    dashboard.hideCreateElection();
}

function showAddCandidate() {
    dashboard.showAddCandidate();
}

function hideAddCandidate() {
    dashboard.hideAddCandidate();
}

function loadCandidates() {
    dashboard.loadCandidates();
}

function filterRegistrations(filter) {
    dashboard.filterRegistrations(filter);
}

function approveRegistration(id) {
    dashboard.approveRegistration(id);
}

function rejectRegistration(id) {
    dashboard.rejectRegistration(id);
}

function viewFaceData(id) {
    dashboard.viewFaceData(id);
}

function viewDocument(id) {
    dashboard.viewDocument(id);
}

function verifyFace(id, verified) {
    dashboard.verifyFace(id, verified);
}

function showBulkAdd() {
    dashboard.showBulkAdd();
}

function hideBulkAdd() {
    dashboard.hideBulkAdd();
}

function generateCandidateFields() {
    dashboard.generateCandidateFields();
}

function updateCandidateCount() {
    const count = document.getElementById('candidateCount').value;
    if (count > 0 && count <= 20) {
        dashboard.generateCandidateFields();
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    window.location.href = '/admin-login';
}

// Initialize dashboard
const dashboard = new AdminDashboard();