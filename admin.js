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

// Initialize admin panel
const adminPanel = new AdminPanel();