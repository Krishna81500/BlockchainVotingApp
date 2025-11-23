class AdminAuth {
    constructor() {
        this.currentTab = 'login';
        this.init();
    }

    init() {
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Show/hide forms
        if (tab === 'login') {
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('registerForm').style.display = 'none';
        } else {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'block';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const officialId = document.getElementById('loginOfficialId').value;
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!this.validateOfficialId(officialId)) {
            this.showAlert('Invalid official ID format', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ officialId, email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminInfo', JSON.stringify(data.admin));
                this.showAlert('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = '/admin-dashboard';
                }, 1000);
            } else {
                this.showAlert(data.message, 'error');
            }
        } catch (error) {
            this.showAlert('Login failed. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const formData = {
            officialId: document.getElementById('regOfficialId').value,
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            phone: document.getElementById('regPhone').value,
            department: document.getElementById('regDepartment').value,
            designation: document.getElementById('regDesignation').value,
            password: document.getElementById('regPassword').value,
            confirmPassword: document.getElementById('regConfirmPassword').value
        };

        if (!this.validateRegistration(formData)) return;

        this.showLoading(true);

        try {
            const response = await fetch('/api/admin/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.showAlert('Registration successful! Please wait for approval.', 'success');
                document.getElementById('registerForm').reset();
                this.switchTab('login');
            } else {
                this.showAlert(data.message, 'error');
            }
        } catch (error) {
            this.showAlert('Registration failed. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    validateOfficialId(id) {
        // Basic validation for official ID (can be customized)
        return id && id.length >= 6 && /^[A-Z0-9]+$/i.test(id);
    }

    validateRegistration(data) {
        if (!this.validateOfficialId(data.officialId)) {
            this.showAlert('Invalid official ID format', 'error');
            return false;
        }

        if (data.password !== data.confirmPassword) {
            this.showAlert('Passwords do not match', 'error');
            return false;
        }

        if (data.password.length < 6) {
            this.showAlert('Password must be at least 6 characters', 'error');
            return false;
        }

        return true;
    }

    showLoading(show) {
        document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
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
function switchTab(tab) {
    adminAuth.switchTab(tab);
}

// Initialize
const adminAuth = new AdminAuth();