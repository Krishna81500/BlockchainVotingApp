class DigiLockerIntegration {
    constructor() {
        this.sessionId = null;
        this.verificationStatus = 'pending';
        this.init();
    }

    init() {
        // Check for DigiLocker callback parameters
        const urlParams = new URLSearchParams(window.location.search);
        const digilockerStatus = urlParams.get('digilocker');
        const sessionId = urlParams.get('session');

        if (digilockerStatus === 'success' && sessionId) {
            this.handleCallback(sessionId);
        } else if (digilockerStatus === 'error') {
            this.showAlert('DigiLocker verification failed', 'error');
        }
    }

    async initiateVerification(email) {
        try {
            this.showLoading(true, 'Initiating DigiLocker verification...');

            const response = await fetch('/api/digilocker/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                this.sessionId = data.sessionId;
                localStorage.setItem('digilockerSession', data.sessionId);
                
                // Open DigiLocker in new window
                const popup = window.open(
                    data.authUrl,
                    'digilocker',
                    'width=600,height=700,scrollbars=yes,resizable=yes'
                );

                // Monitor popup
                this.monitorPopup(popup);
            } else {
                this.showAlert(data.message, 'error');
            }
        } catch (error) {
            this.showAlert('Failed to initiate DigiLocker verification', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    monitorPopup(popup) {
        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                this.checkVerificationStatus();
            }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
            if (!popup.closed) {
                popup.close();
                clearInterval(checkClosed);
                this.showAlert('DigiLocker verification timed out', 'error');
            }
        }, 300000);
    }

    async checkVerificationStatus() {
        const sessionId = localStorage.getItem('digilockerSession');
        if (!sessionId) return;

        try {
            const response = await fetch(`/api/digilocker/status/${sessionId}`);
            const data = await response.json();

            if (data.success && data.verified) {
                this.handleVerificationSuccess(data.aadhaarData);
            } else {
                this.showAlert('DigiLocker verification incomplete', 'warning');
            }
        } catch (error) {
            this.showAlert('Failed to check verification status', 'error');
        }
    }

    async handleCallback(sessionId) {
        try {
            this.showLoading(true, 'Processing DigiLocker verification...');

            const response = await fetch(`/api/digilocker/status/${sessionId}`);
            const data = await response.json();

            if (data.success && data.verified) {
                this.handleVerificationSuccess(data.aadhaarData);
            } else {
                this.showAlert('DigiLocker verification failed', 'error');
            }
        } catch (error) {
            this.showAlert('Failed to process DigiLocker callback', 'error');
        } finally {
            this.showLoading(false);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    handleVerificationSuccess(aadhaarData) {
        this.verificationStatus = 'verified';
        
        // Update UI with verified data
        this.updateRegistrationForm(aadhaarData);
        
        // Show success message
        this.showAlert('Aadhaar verified successfully via DigiLocker!', 'success');
        
        // Store verification status
        localStorage.setItem('aadhaarVerified', 'true');
        localStorage.setItem('aadhaarData', JSON.stringify(aadhaarData));
    }

    updateRegistrationForm(aadhaarData) {
        // Auto-fill registration form with verified data
        const nameField = document.getElementById('aadharName');
        const dobField = document.getElementById('dateOfBirth');
        const genderField = document.getElementById('gender');

        if (nameField) nameField.value = aadhaarData.name;
        if (dobField) dobField.value = aadhaarData.dateOfBirth;
        if (genderField) genderField.value = aadhaarData.gender;

        // Mark fields as verified
        [nameField, dobField, genderField].forEach(field => {
            if (field) {
                field.style.borderColor = '#10b981';
                field.style.backgroundColor = '#ecfdf5';
                field.readOnly = true;
                
                // Add verification badge
                const badge = document.createElement('span');
                badge.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
                badge.style.cssText = `
                    color: #10b981;
                    font-size: 12px;
                    font-weight: 600;
                    margin-left: 8px;
                `;
                
                if (!field.nextElementSibling?.classList.contains('verified-badge')) {
                    badge.classList.add('verified-badge');
                    field.parentNode.appendChild(badge);
                }
            }
        });
    }

    async verifyAadhaar(email) {
        try {
            const response = await fetch('/api/verify-aadhaar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            return { success: false, message: 'Verification check failed' };
        }
    }

    showDigiLockerButton() {
        const container = document.querySelector('.auth-form');
        if (!container || document.getElementById('digilockerBtn')) return;

        const digilockerSection = document.createElement('div');
        digilockerSection.innerHTML = `
            <div style="text-align: center; margin: 20px 0;">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <hr style="flex: 1; border: none; height: 1px; background: rgba(168, 85, 247, 0.3);">
                    <span style="margin: 0 15px; color: #c084fc; font-weight: 600; font-size: 14px;">AADHAAR VERIFICATION</span>
                    <hr style="flex: 1; border: none; height: 1px; background: rgba(168, 85, 247, 0.3);">
                </div>
                <button type="button" id="digilockerBtn" class="digilocker-btn">
                    <i class="fas fa-id-card"></i>
                    Verify with DigiLocker
                </button>
                <p style="font-size: 12px; color: rgba(192, 132, 252, 0.7); margin-top: 10px;">
                    Secure Aadhaar verification via Government of India's DigiLocker
                </p>
            </div>
        `;

        container.insertBefore(digilockerSection, container.firstChild);

        // Add click handler
        document.getElementById('digilockerBtn').addEventListener('click', () => {
            const email = document.getElementById('email')?.value;
            if (!email) {
                this.showAlert('Please enter your email first', 'warning');
                return;
            }
            this.initiateVerification(email);
        });
    }

    showLoading(show, message = 'Processing...') {
        let overlay = document.getElementById('digilockerLoading');
        
        if (show) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'digilockerLoading';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                `;
                
                overlay.innerHTML = `
                    <div style="text-align: center; color: #c084fc;">
                        <div style="width: 50px; height: 50px; border: 3px solid rgba(168, 85, 247, 0.3); border-top: 3px solid #a855f7; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                        <h3 style="margin-bottom: 10px;">${message}</h3>
                        <p>Please complete the process in the DigiLocker window</p>
                    </div>
                `;
                
                document.body.appendChild(overlay);
            }
        } else {
            if (overlay) {
                overlay.remove();
            }
        }
    }

    showAlert(message, type) {
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#ef4444'};
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
        }, 4000);
    }
}

// Initialize DigiLocker integration
const digilocker = new DigiLockerIntegration();

// Add CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .digilocker-btn {
        width: 100%;
        padding: 15px;
        background: linear-gradient(135deg, #1e40af, #3b82f6);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }
    
    .digilocker-btn:hover {
        background: linear-gradient(135deg, #1d4ed8, #2563eb);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }
`;
document.head.appendChild(style);