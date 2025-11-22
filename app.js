// Blockchain Voting App - Main Application Logic
class VotingApp {
    constructor() {
        this.currentUser = null;
        this.selectedCandidate = null;
        this.registrationData = {};
        this.registrationFaceTemplate = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
        this.startPeriodicUpdates();
    }

    setupEventListeners() {
        // Handle screen navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[onclick]')) {
                e.preventDefault();
            }
        });
    }

    // Show different screens
    showHomeScreen() {
        this.showScreen('homeScreen');
    }

    showLoginScreen() {
        this.showScreen('loginScreen');
    }

    showRegisterScreen() {
        this.showScreen('registerScreen');
    }

    // Send OTP for login
    async sendLoginOTP() {
        const email = document.getElementById('loginEmail').value.trim();

        if (!email) {
            this.showAlert('Please enter your email address', 'error');
            return;
        }

        if (!emailAuth.isValidEmail(email)) {
            this.showAlert('Please enter a valid email address', 'error');
            return;
        }

        this.showLoading('Checking registration status...');

        try {
            // First check if user is registered and approved
            const userCheck = await fetch('/api/check-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            const userStatus = await userCheck.json();

            if (!userStatus.success) {
                this.hideLoading();
                this.showAlert('Failed to check user status', 'error');
                return;
            }

            if (!userStatus.isRegistered) {
                this.hideLoading();
                this.showAlert('You are not registered. Please register first before logging in.', 'error');
                setTimeout(() => {
                    this.showRegisterScreen();
                }, 2000);
                return;
            }

            if (!userStatus.isApproved) {
                this.hideLoading();
                if (userStatus.status === 'pending') {
                    this.showAlert('Your registration is pending admin approval. Please wait for approval before logging in.', 'warning');
                } else if (userStatus.status === 'rejected') {
                    this.showAlert('Your registration was rejected. Please contact admin or register again.', 'error');
                }
                return;
            }

            // User is approved, proceed with OTP
            const result = await emailAuth.sendOTP(email, 'login');
            this.hideLoading();

            if (result.success) {
                this.showLoginOTPSection();
                this.startLoginOTPTimer(email);
                this.showAlert(`OTP sent to ${email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`, 'success');
            } else {
                this.showAlert(result.message, 'error');
            }
        } catch (error) {
            this.hideLoading();
            this.showAlert('Failed to send OTP. Please try again.', 'error');
        }
    }

    // Show login OTP section
    showLoginOTPSection() {
        document.getElementById('loginOtpSection').style.display = 'block';
        const loginBtn = document.getElementById('loginSubmitBtn');
        loginBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Verify OTP';
        loginBtn.setAttribute('onclick', 'verifyLoginOTP()');
    }

    // Start login OTP timer
    startLoginOTPTimer(email) {
        const timerElement = document.getElementById('loginOtpTimer');
        const resendBtn = document.getElementById('loginResendOtp');
        
        const updateTimer = async () => {
            const remaining = await emailAuth.getTimeRemaining(email);
            
            if (remaining > 0) {
                timerElement.textContent = emailAuth.formatTimeRemaining(remaining);
                setTimeout(updateTimer, 1000);
            } else {
                timerElement.textContent = '00:00';
                resendBtn.disabled = false;
                this.showAlert('OTP expired. Please request a new one.', 'warning');
            }
        };
        
        updateTimer();
    }

    // Verify login OTP
    async verifyLoginOTP() {
        const email = document.getElementById('loginEmail').value.trim();
        const otpCode = document.getElementById('loginOtpCode').value.trim();

        if (!otpCode) {
            this.showAlert('Please enter the OTP', 'error');
            return;
        }

        this.showLoading('Verifying OTP...');

        const otpResult = await emailAuth.verifyOTP(email, otpCode);
        
        this.hideLoading();
        
        if (!otpResult.success) {
            this.showAlert(otpResult.message, 'error');
            return;
        }

        // Create user session with email
        this.currentUser = {
            id: email.replace('@', '_').replace('.', '_'),
            name: email.split('@')[0],
            email: email,
            constituency: 'Public Voter'
        };
        
        // Reset login form
        this.resetLoginForm();
        
        this.showDashboard();
        this.updateUserInfo();
        
        // Update login/logout buttons
        document.getElementById('logoutBtn').style.display = 'block';
        document.getElementById('loginBtn').style.display = 'none';
        
        this.showAlert('Login successful!', 'success');
    }

    // Resend login OTP
    async resendLoginOTP() {
        const email = document.getElementById('loginEmail').value.trim();
        
        document.getElementById('loginResendOtp').disabled = true;
        
        try {
            const result = await emailAuth.sendOTP(email, 'login');
            
            if (result.success) {
                this.startLoginOTPTimer(email);
                this.showAlert('New OTP sent to your email', 'success');
            } else {
                this.showAlert(result.message, 'error');
                document.getElementById('loginResendOtp').disabled = false;
            }
        } catch (error) {
            this.showAlert('Failed to resend OTP', 'error');
            document.getElementById('loginResendOtp').disabled = false;
        }
    }

    // Reset login form
    resetLoginForm() {
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginOtpCode').value = '';
        document.getElementById('loginOtpSection').style.display = 'none';
        const loginBtn = document.getElementById('loginSubmitBtn');
        loginBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP';
        loginBtn.setAttribute('onclick', 'sendLoginOTP()');
    }

    // Update user information in dashboard
    updateUserInfo() {
        if (!this.currentUser) return;

        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userConstituency').textContent = `Constituency: ${this.currentUser.constituency}`;
    }

    // Show different screens
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        document.getElementById(screenId).classList.add('active');

        // Update navigation
        this.updateNavigation(screenId);
    }

    showDashboard() {
        this.showScreen('dashboardScreen');
    }

    showVotingScreen() {
        if (!this.currentUser) {
            this.showAlert('Please login first', 'error');
            return;
        }

        if (blockchain.hasVoted(this.currentUser.id)) {
            this.showAlert('You have already voted in this election', 'warning');
            return;
        }

        this.showScreen('votingScreen');
        this.loadCandidates();
    }

    showResultsScreen() {
        this.showScreen('resultsScreen');
        this.loadResults();
    }

    showBlockchainScreen() {
        this.showScreen('blockchainScreen');
        this.loadBlockchainData();
    }

    showHistoryScreen() {
        // Implementation for vote history
        this.showAlert('Vote history feature coming soon!', 'info');
    }

    // Load candidates for voting
    loadCandidates() {
        const candidatesList = document.querySelector('.candidates-list');
        candidatesList.innerHTML = '';

        for (let candidate of blockchain.candidates.values()) {
            const candidateCard = document.createElement('div');
            candidateCard.className = 'candidate-card';
            candidateCard.onclick = () => this.selectCandidate(candidate.id);
            
            candidateCard.innerHTML = `
                <div class="candidate-info">
                    <img src="${candidate.image}" alt="${candidate.name}">
                    <div class="candidate-details">
                        <h4>${candidate.name}</h4>
                        <p>${candidate.party}</p>
                        <span class="experience">${candidate.experience}</span>
                    </div>
                </div>
                <div class="vote-checkbox">
                    <i class="fas fa-circle"></i>
                </div>
            `;
            
            candidatesList.appendChild(candidateCard);
        }
    }

    // Select candidate for voting
    selectCandidate(candidateId) {
        // Remove previous selection
        document.querySelectorAll('.candidate-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked card
        event.currentTarget.classList.add('selected');
        
        // Update selected candidate
        this.selectedCandidate = candidateId;
        
        // Enable submit button
        const submitBtn = document.getElementById('submitVoteBtn');
        submitBtn.disabled = false;
        
        // Update checkbox icon
        const checkbox = event.currentTarget.querySelector('.vote-checkbox i');
        checkbox.className = 'fas fa-check-circle';
    }

    // Submit vote to blockchain
    submitVote() {
        if (!this.selectedCandidate) {
            this.showAlert('Please select a candidate', 'error');
            return;
        }

        const candidate = blockchain.candidates.get(this.selectedCandidate);
        
        // Show confirmation modal
        this.showVoteConfirmation(candidate);
    }

    // Show vote confirmation modal
    showVoteConfirmation(candidate) {
        const modal = document.getElementById('voteModal');
        
        // Update modal content
        document.getElementById('selectedCandidateImg').src = candidate.image;
        document.getElementById('selectedCandidateName').textContent = candidate.name;
        document.getElementById('selectedCandidateParty').textContent = candidate.party;
        
        // Reset face verification
        document.getElementById('finalConfirmBtn').disabled = true;
        
        modal.classList.add('active');
    }

    // Verify face for vote casting
    async verifyFaceForVote() {
        const faceVideo = document.getElementById('voteFaceVideo');
        const verifyBtn = document.getElementById('verifyFaceBtn');
        
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
        
        const cameraStarted = await faceAuth.startCamera(faceVideo);
        
        if (!cameraStarted) {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = '<i class="fas fa-user-check"></i> Verify Face';
            this.showAlert('Camera access required for face verification', 'error');
            return;
        }

        // Wait for face detection and verification
        setTimeout(() => {
            const faceTemplate = faceAuth.captureFaceTemplate(faceVideo);
            
            if (faceTemplate) {
                const faceResult = faceAuth.verifyFace(this.currentUser.id, faceTemplate);
                
                if (faceResult.success) {
                    document.getElementById('finalConfirmBtn').disabled = false;
                    verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
                    verifyBtn.style.background = '#10b981';
                    
                    // Show success indicator
                    const successDiv = document.createElement('div');
                    successDiv.className = 'verification-success';
                    successDiv.innerHTML = '<i class="fas fa-check-circle"></i> Face verified successfully';
                    
                    const voteVerification = document.querySelector('.vote-face-verification');
                    voteVerification.appendChild(successDiv);
                } else {
                    verifyBtn.disabled = false;
                    verifyBtn.innerHTML = '<i class="fas fa-user-check"></i> Verify Face';
                    this.showAlert(faceResult.message, 'error');
                }
            } else {
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = '<i class="fas fa-user-check"></i> Verify Face';
                this.showAlert('Face verification failed. Please try again.', 'error');
            }
            
            faceAuth.stopCamera();
        }, 3000);
    }

    // Close vote confirmation modal
    closeVoteModal() {
        document.getElementById('voteModal').classList.remove('active');
        faceAuth.stopCamera();
        
        // Reset verification state
        const verifyBtn = document.getElementById('verifyFaceBtn');
        if (verifyBtn) {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = '<i class="fas fa-user-check"></i> Verify Face';
            verifyBtn.style.background = '';
        }
        
        // Remove success indicators
        const successDiv = document.querySelector('.verification-success');
        if (successDiv) {
            successDiv.remove();
        }
    }

    // Confirm and cast vote
    confirmVote() {
        this.closeVoteModal();
        this.showLoading('Submitting vote to blockchain...');

        // Simulate blockchain transaction delay
        setTimeout(() => {
            try {
                const vote = blockchain.castVote(this.currentUser.id, this.selectedCandidate);
                
                this.hideLoading();
                this.showAlert('Vote successfully cast and recorded on blockchain!', 'success');
                
                // Reset voting screen
                this.selectedCandidate = null;
                document.getElementById('submitVoteBtn').disabled = true;
                
                // Go back to dashboard
                setTimeout(() => {
                    this.showDashboard();
                }, 2000);
                
            } catch (error) {
                this.hideLoading();
                this.showAlert(error.message, 'error');
            }
        }, 3000);
    }

    // Load and display results
    loadResults() {
        const results = blockchain.getResults();
        const totalVotes = results.reduce((sum, candidate) => sum + candidate.votes, 0);
        
        // Update summary
        document.querySelector('.summary-card .count').textContent = totalVotes.toLocaleString();
        
        // Calculate turnout (assuming 12,500 total eligible voters)
        const turnout = Math.round((totalVotes / 12500) * 100);
        document.querySelector('.summary-card .percentage').textContent = `${turnout}%`;
        
        // Update results list
        const resultsList = document.querySelector('.results-list');
        resultsList.innerHTML = '';
        
        results.forEach(candidate => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            resultItem.innerHTML = `
                <div class="candidate-result">
                    <img src="${candidate.image}" alt="${candidate.name}">
                    <div class="result-info">
                        <h4>${candidate.name}</h4>
                        <p>${candidate.party}</p>
                    </div>
                </div>
                <div class="vote-stats">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${candidate.percentage}%"></div>
                    </div>
                    <span class="vote-count">${candidate.votes.toLocaleString()} votes (${candidate.percentage}%)</span>
                </div>
            `;
            
            resultsList.appendChild(resultItem);
        });
        
        // Update last update time
        document.getElementById('lastUpdate').textContent = '2 minutes ago';
    }

    // Load blockchain data for explorer
    loadBlockchainData() {
        const stats = blockchain.getBlockchainStats();
        
        // Update blockchain stats
        document.querySelector('.stat-card .stat-value').textContent = stats.totalBlocks.toLocaleString();
        
        // Load recent blocks
        const recentBlocks = blockchain.getRecentBlocks(5);
        const blockList = document.querySelector('.block-list');
        blockList.innerHTML = '';
        
        recentBlocks.forEach(block => {
            const blockItem = document.createElement('div');
            blockItem.className = 'block-item';
            
            blockItem.innerHTML = `
                <div class="block-info">
                    <span class="block-number">#${block.number}</span>
                    <span class="block-hash">${block.hash}</span>
                </div>
                <div class="block-details">
                    <span class="transaction-count">${block.voteCount} votes</span>
                    <span class="block-time">${block.timeAgo}</span>
                </div>
            `;
            
            blockList.appendChild(blockItem);
        });
    }

    // Update navigation active state
    updateNavigation(screenId) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Map screen IDs to nav items
        const navMapping = {
            'dashboardScreen': 0,
            'votingScreen': 1,
            'resultsScreen': 2,
            'blockchainScreen': 3
        };

        const navIndex = navMapping[screenId];
        if (navIndex !== undefined) {
            document.querySelectorAll('.nav-item')[navIndex].classList.add('active');
        }
    }

    // Show loading overlay
    showLoading(message) {
        const overlay = document.getElementById('loadingOverlay');
        const messageElement = overlay.querySelector('p');
        messageElement.textContent = message;
        overlay.classList.add('active');
    }

    // Hide loading overlay
    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }

    // Show alert messages
    showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 3000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideDown 0.3s ease;
        `;
        alert.textContent = message;
        
        document.body.appendChild(alert);
        
        // Remove after 3 seconds
        setTimeout(() => {
            alert.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(alert);
            }, 300);
        }, 3000);
    }

    // Start periodic updates
    startPeriodicUpdates() {
        // Update blockchain stats every 30 seconds
        setInterval(() => {
            updateBlockchainUI();
            
            // Update results if on results screen
            if (document.getElementById('resultsScreen').classList.contains('active')) {
                this.loadResults();
            }
            
            // Update blockchain data if on blockchain screen
            if (document.getElementById('blockchainScreen').classList.contains('active')) {
                this.loadBlockchainData();
            }
        }, 30000);
    }

    // Send registration OTP
    async sendRegOTP() {
        const aadharName = document.getElementById('aadharName').value.trim();
        const address = document.getElementById('address').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value.trim();
        const country = document.getElementById('country').value;
        const state = document.getElementById('state').value;
        const votingType = document.getElementById('votingType').value;

        if (!aadharName || !address || !phone || !email || !password || !country || !state || !votingType) {
            this.showAlert('Please fill all required fields', 'error');
            return;
        }

        if (!emailAuth.isValidEmail(email)) {
            this.showAlert('Please enter a valid email address', 'error');
            return;
        }

        if (!this.registrationFaceTemplate) {
            this.showAlert('Please capture your face for registration', 'error');
            return;
        }

        // Store registration data
        this.registrationData = {
            aadharName,
            address,
            phone,
            email,
            password,
            country,
            state,
            votingType
        };

        this.showLoading('Sending OTP to your email...');

        try {
            const result = await emailAuth.sendOTP(email, 'registration');
            this.hideLoading();

            if (result.success) {
                this.showRegOTPSection();
                this.startRegOTPTimer(email);
                this.showAlert('OTP sent to your email address', 'success');
            } else {
                this.showAlert(result.message, 'error');
            }
        } catch (error) {
            this.hideLoading();
            this.showAlert('Failed to send OTP. Please try again.', 'error');
        }
    }

    // Show registration OTP section
    showRegOTPSection() {
        document.getElementById('regOtpSection').style.display = 'block';
        document.getElementById('registerBtn').innerHTML = '<i class="fas fa-user-plus"></i> Complete Registration';
        document.getElementById('registerBtn').onclick = () => this.completeRegistration();
    }

    // Start registration OTP timer
    startRegOTPTimer(email) {
        const timerElement = document.getElementById('regOtpTimer');
        const resendBtn = document.getElementById('regResendOtp');
        
        const updateTimer = async () => {
            const remaining = await emailAuth.getTimeRemaining(email);
            
            if (remaining > 0) {
                timerElement.textContent = emailAuth.formatTimeRemaining(remaining);
                setTimeout(updateTimer, 1000);
            } else {
                timerElement.textContent = '00:00';
                resendBtn.disabled = false;
                this.showAlert('OTP expired. Please request a new one.', 'warning');
            }
        };
        
        updateTimer();
    }

    // Complete registration
    async completeRegistration() {
        const otpCode = document.getElementById('regOtpCode').value.trim();

        if (!otpCode) {
            this.showAlert('Please enter the OTP', 'error');
            return;
        }

        this.showLoading('Completing registration...');

        try {
            const response = await fetch('/api/complete-registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.registrationData.email,
                    otp: otpCode,
                    registrationData: this.registrationData
                })
            });

            const result = await response.json();
            this.hideLoading();
            
            if (result.success) {
                this.showAlert('Registration submitted successfully! Please wait for admin approval before you can login.', 'success');
                
                // Reset form and go to home
                setTimeout(() => {
                    this.showHomeScreen();
                    this.resetRegistrationForm();
                }, 3000);
            } else {
                this.showAlert(result.message, 'error');
            }
        } catch (error) {
            this.hideLoading();
            this.showAlert('Registration failed. Please try again.', 'error');
        }
    }

    // Resend registration OTP
    async resendRegOTP() {
        document.getElementById('regResendOtp').disabled = true;
        
        try {
            const result = await emailAuth.sendOTP(this.registrationData.email, 'registration');
            
            if (result.success) {
                this.startRegOTPTimer(this.registrationData.email);
                this.showAlert('New OTP sent to your email', 'success');
            } else {
                this.showAlert(result.message, 'error');
                document.getElementById('regResendOtp').disabled = false;
            }
        } catch (error) {
            this.showAlert('Failed to resend OTP', 'error');
            document.getElementById('regResendOtp').disabled = false;
        }
    }

    // Start face recognition for login
    async startFaceRecognition() {
        const faceVideo = document.getElementById('faceVideo');
        const startBtn = document.getElementById('startFaceBtn');
        
        startBtn.disabled = true;
        startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting Camera...';
        
        const cameraStarted = await faceAuth.startCamera(faceVideo);
        
        if (cameraStarted) {
            startBtn.innerHTML = '<i class="fas fa-camera"></i> Camera Active';
            startBtn.style.background = '#10b981';
        } else {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-camera"></i> Start Face Scan';
        }
    }

    // Capture face for registration
    async captureFaceForRegistration() {
        const faceVideo = document.getElementById('regFaceVideo');
        const captureBtn = document.getElementById('captureFaceBtn');
        
        // Start camera if not already started
        if (!faceAuth.currentStream) {
            const cameraStarted = await faceAuth.startCamera(faceVideo);
            if (!cameraStarted) {
                this.showAlert('Camera access required for registration', 'error');
                return;
            }
        }
        
        captureBtn.disabled = true;
        captureBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Capturing...';
        
        setTimeout(() => {
            const faceTemplate = faceAuth.captureFaceTemplate(faceVideo);
            
            if (faceTemplate) {
                this.registrationFaceTemplate = faceTemplate;
                captureBtn.innerHTML = '<i class="fas fa-check-circle"></i> Face Captured';
                captureBtn.style.background = '#10b981';
                
                // Turn off camera after successful capture
                faceAuth.stopCamera();
                faceVideo.style.display = 'none';
                
                // Show success message
                const successDiv = document.createElement('div');
                successDiv.className = 'verification-success';
                successDiv.innerHTML = '<i class="fas fa-check-circle"></i> Face captured and camera turned off';
                faceVideo.parentNode.appendChild(successDiv);
                
                // Enable register button if all fields are filled
                this.checkRegistrationForm();
            } else {
                captureBtn.disabled = false;
                captureBtn.innerHTML = '<i class="fas fa-camera"></i> Capture Face';
                this.showAlert('Face capture failed. Please try again.', 'error');
            }
        }, 2000);
    }

    // Check registration form completion
    checkRegistrationForm() {
        const aadharName = document.getElementById('aadharName').value.trim();
        const address = document.getElementById('address').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value.trim();
        const country = document.getElementById('country').value;
        const state = document.getElementById('state').value;
        const votingType = document.getElementById('votingType').value;
        
        if (aadharName && address && phone && email && password && country && state && votingType && this.registrationFaceTemplate) {
            document.getElementById('registerBtn').disabled = false;
        }
    }

    // Register new voter
    async registerVoter() {
        const voterData = {
            fullName: document.getElementById('regFullName').value.trim(),
            aadharNumber: document.getElementById('regAadharNumber').value.trim(),
            phoneNumber: document.getElementById('regPhoneNumber').value.trim(),
            constituency: document.getElementById('regConstituency').value
        };
        
        this.showLoading('Registering voter...');
        
        try {
            const result = faceAuth.registerVoter(voterData, this.registrationFaceTemplate);
            
            this.hideLoading();
            
            if (result.success) {
                this.closeRegistrationModal();
                this.showAlert(`Registration successful! Your Voter ID: ${result.voterId}`, 'success');
                
                // Auto-fill voter ID in login form
                document.getElementById('voterId').value = result.voterId;
            } else {
                this.showAlert(result.message, 'error');
            }
        } catch (error) {
            this.hideLoading();
            this.showAlert('Registration failed. Please try again.', 'error');
        }
    }

    // Reset registration form
    resetRegistrationForm() {
        document.getElementById('aadharName').value = '';
        document.getElementById('address').value = '';
        document.getElementById('regPhone').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('country').value = '';
        document.getElementById('state').value = '';
        document.getElementById('votingType').value = '';
        document.getElementById('regOtpCode').value = '';
        document.getElementById('regOtpSection').style.display = 'none';
        document.getElementById('registerBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP to Verify';
        document.getElementById('registerBtn').setAttribute('onclick', 'sendRegOTP()');
        this.registrationData = {};
        this.registrationFaceTemplate = null;
    }

    // Update UI elements
    updateUI() {
        updateBlockchainUI();
        
        // Add event listeners for registration form
        const formInputs = ['aadharName', 'address', 'regPhone', 'regEmail', 'regPassword', 'country', 'state', 'votingType'];
        formInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.checkRegistrationForm());
                input.addEventListener('change', () => this.checkRegistrationForm());
            }
        });
    }
}

// Global functions for onclick handlers
function showHomeScreen() {
    app.showHomeScreen();
}

function showLoginScreen() {
    app.showLoginScreen();
}

function showRegisterScreen() {
    app.showRegisterScreen();
}

function sendLoginOTP() {
    app.sendLoginOTP();
}

function verifyLoginOTP() {
    app.verifyLoginOTP();
}

function resendLoginOTP() {
    app.resendLoginOTP();
}

function sendRegOTP() {
    app.sendRegOTP();
}

function completeRegistration() {
    app.completeRegistration();
}

function resendRegOTP() {
    app.resendRegOTP();
}

function captureFaceForRegistration() {
    app.captureFaceForRegistration();
}

function verifyFaceForVote() {
    app.verifyFaceForVote();
}

function showDashboard() {
    app.showDashboard();
}

function showVotingScreen() {
    app.showVotingScreen();
}

function showResultsScreen() {
    app.showResultsScreen();
}

function showBlockchainScreen() {
    app.showBlockchainScreen();
}

function showHistoryScreen() {
    app.showHistoryScreen();
}

function selectCandidate(candidateId) {
    app.selectCandidate(candidateId);
}

function submitVote() {
    app.submitVote();
}

function closeVoteModal() {
    app.closeVoteModal();
}

function confirmVote() {
    app.confirmVote();
}

// Language and Settings Functions
function changeLanguage(lang) {
    // Remove active class from all language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to selected language
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
    
    // Store language preference
    localStorage.setItem('selectedLanguage', lang);
    
    // Update UI text based on language
    updateLanguageText(lang);
    
    app.showAlert(`Language changed to ${lang.toUpperCase()}`, 'success');
}

function updateLanguageText(lang) {
    const translations = {
        'en': {
            'profile': 'Profile',
            'settings': 'Settings',
            'about-app': 'About App',
            'about-election': 'About Election',
            'logout': 'Logout',
            'login': 'Login'
        },
        'hi': {
            'profile': 'प्रोफ़ाइल',
            'settings': 'सेटिंग्स',
            'about-app': 'ऐप के बारे में',
            'about-election': 'चुनाव के बारे में',
            'logout': 'लॉगआउट',
            'login': 'लॉगिन'
        },
        'kn': {
            'profile': 'ಪ್ರೊಫೈಲ್',
            'settings': 'ಸೆಟ್ಟಿಂಗ್ಸ್',
            'about-app': 'ಅಪ್ಲಿಕೇಶನ್ ಬಗ್ಗೆ',
            'about-election': 'ಚುನಾವಣೆ ಬಗ್ಗೆ',
            'logout': 'ಲಾಗ್ಔಟ್',
            'login': 'ಲಾಗಿನ್'
        }
    };
    
    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

function toggleSettingsMenu() {
    const dropdown = document.getElementById('settingsDropdown');
    dropdown.classList.toggle('active');
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.closest('.settings-menu')) {
            dropdown.classList.remove('active');
            document.removeEventListener('click', closeDropdown);
        }
    });
}

function showProfile() {
    document.getElementById('settingsDropdown').classList.remove('active');
    app.showAlert('Profile feature coming soon!', 'info');
}

function showSettings() {
    document.getElementById('settingsDropdown').classList.remove('active');
    app.showAlert('Settings feature coming soon!', 'info');
}

function showAboutApp() {
    document.getElementById('settingsDropdown').classList.remove('active');
    
    const aboutModal = document.createElement('div');
    aboutModal.className = 'modal active';
    aboutModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>About SecureVote</h3>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 20px;">
                    <i class="fas fa-vote-yea" style="font-size: 48px; color: #4f46e5; margin-bottom: 15px;"></i>
                    <h4>SecureVote v1.0</h4>
                </div>
                <p><strong>Blockchain-Based Voting System</strong></p>
                <p>SecureVote is a revolutionary voting platform that uses blockchain technology to ensure transparent, secure, and immutable elections.</p>
                <br>
                <p><strong>Key Features:</strong></p>
                <ul style="margin-left: 20px;">
                    <li>🔐 Multi-factor authentication (OTP + Face Recognition)</li>
                    <li>⛓️ Blockchain-secured vote storage</li>
                    <li>🔍 Real-time result verification</li>
                    <li>📱 Mobile-first design</li>
                    <li>🌐 Multi-language support</li>
                </ul>
                <br>
                <p><strong>Developer:</strong> SecureVote Team</p>
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>License:</strong> MIT License</p>
            </div>
            <div class="modal-actions">
                <button class="btn-primary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(aboutModal);
}

function showAboutElection() {
    document.getElementById('settingsDropdown').classList.remove('active');
    
    const electionModal = document.createElement('div');
    electionModal.className = 'modal active';
    electionModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>About This Election</h3>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 20px;">
                    <i class="fas fa-landmark" style="font-size: 48px; color: #4f46e5; margin-bottom: 15px;"></i>
                    <h4>General Election 2024</h4>
                </div>
                <p><strong>Election Type:</strong> General Election</p>
                <p><strong>Voting Period:</strong> March 15-17, 2024</p>
                <p><strong>Eligible Voters:</strong> 12,500 registered voters</p>
                <br>
                <p><strong>Candidates:</strong></p>
                <ul style="margin-left: 20px;">
                    <li>🔵 Alice Johnson - Democratic Party</li>
                    <li>🔴 Robert Smith - Republican Party</li>
                    <li>🟡 Maria Garcia - Independent</li>
                </ul>
                <br>
                <p><strong>Voting Rules:</strong></p>
                <ul style="margin-left: 20px;">
                    <li>✅ One vote per registered voter</li>
                    <li>✅ Face verification required</li>
                    <li>✅ Votes are immutable once cast</li>
                    <li>✅ Real-time blockchain verification</li>
                </ul>
                <br>
                <p><strong>Election Commission:</strong> Blockchain Election Authority</p>
                <p><strong>Contact:</strong> election@securevote.com</p>
            </div>
            <div class="modal-actions">
                <button class="btn-primary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(electionModal);
}

function logout() {
    document.getElementById('settingsDropdown').classList.remove('active');
    
    if (app.currentUser) {
        app.currentUser = null;
        app.resetLoginForm();
        app.showHomeScreen();
        
        // Update login/logout buttons
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('loginBtn').style.display = 'block';
        
        app.showAlert('Logged out successfully', 'success');
    } else {
        app.showAlert('No user logged in', 'info');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VotingApp();
    
    // Load saved language preference
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    changeLanguage(savedLang);
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);