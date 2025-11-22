// Simple working app - Fixed version
function showHomeScreen() {
    showScreen('homeScreen');
    updateNavigation('homeScreen');
}

function showLoginScreen() {
    showScreen('loginScreen');
    closeSettingsMenu();
}

function showRegisterScreen() {
    showScreen('registerScreen');
    closeSettingsMenu();
}

function showDashboard() {
    showScreen('dashboardScreen');
    updateNavigation('dashboardScreen');
    showLogoutButton();
}

function showVotingScreen() {
    showScreen('votingScreen');
    updateNavigation('votingScreen');
}

function showResultsScreen() {
    showScreen('resultsScreen');
    updateNavigation('resultsScreen');
}

function showBlockchainScreen() {
    showScreen('blockchainScreen');
    updateNavigation('blockchainScreen');
}

function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(screenId).classList.add('active');
    
    // Update navigation
    updateNavigation(screenId);
}

function updateNavigation(screenId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

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

function sendLoginOTP() {
    const email = document.getElementById('loginEmail').value;
    if (!email) {
        alert('Please enter email address');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Show OTP section
    document.getElementById('loginOtpSection').style.display = 'block';
    document.getElementById('loginSubmitBtn').innerHTML = '<i class="fas fa-key"></i> Verify OTP';
    document.getElementById('loginSubmitBtn').onclick = verifyLoginOTP;
    
    // Start OTP timer
    startOTPTimer('loginOtpTimer', 'loginResendOtp');
    
    alert('OTP sent to ' + email + '\nDemo OTP: 123456');
}

function verifyLoginOTP() {
    const otp = document.getElementById('loginOtpCode').value;
    const email = document.getElementById('loginEmail').value;
    
    if (!otp) {
        alert('Please enter OTP');
        return;
    }
    
    // Simple verification
    if (otp === '123456') {
        // Update user info
        document.getElementById('userName').textContent = email.split('@')[0] || 'Verified User';
        document.getElementById('userConstituency').textContent = 'Constituency: Central District';
        
        showDashboard();
        alert('Login successful! Welcome to SecureVote.');
        
        // Reset login form
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginOtpCode').value = '';
        document.getElementById('loginOtpSection').style.display = 'none';
        document.getElementById('loginSubmitBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP';
        document.getElementById('loginSubmitBtn').onclick = sendLoginOTP;
    } else {
        alert('Invalid OTP. Please use: 123456');
    }
}

function selectCandidate(id) {
    document.querySelectorAll('.candidate-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    document.getElementById('submitVoteBtn').disabled = false;
}

function submitVote() {
    const selectedCard = document.querySelector('.candidate-card.selected');
    if (!selectedCard) {
        alert('Please select a candidate first');
        return;
    }
    
    // Get candidate info
    const candidateName = selectedCard.querySelector('.candidate-details h4').textContent;
    const candidateParty = selectedCard.querySelector('.candidate-details p').textContent;
    const candidateImg = selectedCard.querySelector('.candidate-info img').src;
    
    // Update modal with selected candidate
    document.getElementById('selectedCandidateName').textContent = candidateName;
    document.getElementById('selectedCandidateParty').textContent = candidateParty;
    document.getElementById('selectedCandidateImg').src = candidateImg;
    
    // Show confirmation modal
    showVoteModal();
}

function showVoteModal() {
    const modal = document.getElementById('voteModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeVoteModal() {
    const modal = document.getElementById('voteModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
    
    // Reset face verification
    const verifyBtn = document.getElementById('verifyFaceBtn');
    const confirmBtn = document.getElementById('finalConfirmBtn');
    if (verifyBtn) verifyBtn.disabled = false;
    if (confirmBtn) confirmBtn.disabled = true;
}

function verifyFaceForVote() {
    const verifyBtn = document.getElementById('verifyFaceBtn');
    const confirmBtn = document.getElementById('finalConfirmBtn');
    
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    
    // Simulate face verification
    setTimeout(() => {
        verifyBtn.innerHTML = '<i class="fas fa-check"></i> Face Verified';
        verifyBtn.style.background = '#10b981';
        confirmBtn.disabled = false;
    }, 2000);
}

function confirmVote() {
    closeVoteModal();
    showLoadingOverlay();
    
    // Simulate blockchain submission
    setTimeout(() => {
        hideLoadingOverlay();
        alert('Vote successfully submitted to blockchain!\nTransaction ID: 0x7a8f...9c2d');
        showDashboard();
        
        // Reset voting screen
        document.querySelectorAll('.candidate-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById('submitVoteBtn').disabled = true;
    }, 3000);
}

function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('active');
        overlay.style.display = 'flex';
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
    }
}

function toggleSettingsMenu() {
    const dropdown = document.getElementById('settingsDropdown');
    dropdown.classList.toggle('active');
}

function changeLanguage(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
    alert('Language changed to ' + lang.toUpperCase());
}

function logout() {
    showHomeScreen();
    hideLogoutButton();
    resetUserSession();
    alert('Logged out successfully');
}

function closeSettingsMenu() {
    const dropdown = document.getElementById('settingsDropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
}

function showLogoutButton() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'flex';
}

function hideLogoutButton() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    if (loginBtn) loginBtn.style.display = 'flex';
    if (logoutBtn) logoutBtn.style.display = 'none';
}

function resetUserSession() {
    // Reset any user data
    document.getElementById('userName').textContent = 'Guest User';
    document.getElementById('userConstituency').textContent = 'Constituency: Not Set';
}

function showProfile() {
    closeSettingsMenu();
    alert('Profile feature coming soon!');
}

function showSettings() {
    closeSettingsMenu();
    alert('Settings feature coming soon!');
}

function showAboutApp() {
    closeSettingsMenu();
    alert('SecureVote - Blockchain Voting System\nVersion 1.0\nSecure, Transparent, Immutable');
}

function showAboutElection() {
    closeSettingsMenu();
    alert('General Election 2024\nCentral District Representative\nVoting Period: Active');
}

function resendLoginOTP() {
    const email = document.getElementById('loginEmail').value;
    if (email) {
        alert('New OTP sent to ' + email);
        // Reset timer
        startOTPTimer('loginOtpTimer', 'loginResendOtp');
    }
}

function resendRegOTP() {
    const email = document.getElementById('regEmail').value;
    if (email) {
        alert('New OTP sent to ' + email);
        // Reset timer
        startOTPTimer('regOtpTimer', 'regResendOtp');
    }
}

function startOTPTimer(timerId, resendBtnId) {
    let timeLeft = 120;
    const timerElement = document.getElementById(timerId);
    const resendBtn = document.getElementById(resendBtnId);
    
    if (!timerElement || !resendBtn) return;
    
    resendBtn.disabled = true;
    
    const timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            resendBtn.disabled = false;
            timerElement.textContent = '0';
        }
    }, 1000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Registration functions (simplified)
function sendRegOTP() {
    const email = document.getElementById('regEmail').value;
    const name = document.getElementById('aadharName').value;
    
    if (!name || !email) {
        alert('Please fill all required fields');
        return;
    }
    
    document.getElementById('regOtpSection').style.display = 'block';
    document.getElementById('registerBtn').innerHTML = 'Complete Registration';
    document.getElementById('registerBtn').onclick = completeRegistration;
    
    alert('OTP sent to ' + email + '\nDemo OTP: 123456');
}

function completeRegistration() {
    const otp = document.getElementById('regOtpCode').value;
    if (!otp) {
        alert('Please enter OTP');
        return;
    }
    
    if (otp === '123456') {
        alert('Registration successful!');
        showHomeScreen();
        resetRegistrationForm();
    } else {
        alert('Invalid OTP. Try 123456');
    }
}

function resetRegistrationForm() {
    document.getElementById('aadharName').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regOtpCode').value = '';
    document.getElementById('regOtpSection').style.display = 'none';
    document.getElementById('registerBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP to Verify';
    document.getElementById('registerBtn').onclick = sendRegOTP;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('SecureVote App loaded successfully');
    
    // Initialize app state
    showHomeScreen();
    hideLogoutButton();
    
    // Add click outside to close settings menu
    document.addEventListener('click', function(event) {
        const settingsMenu = document.querySelector('.settings-menu');
        const dropdown = document.getElementById('settingsDropdown');
        if (settingsMenu && dropdown && !settingsMenu.contains(event.target)) {
            dropdown.classList.remove('active');
        }
    });
    
    // Update blockchain info periodically
    updateBlockchainInfo();
    setInterval(updateBlockchainInfo, 30000); // Update every 30 seconds
});

function updateBlockchainInfo() {
    const blockHeight = document.getElementById('blockHeight');
    const totalVoters = document.getElementById('totalVoters');
    
    if (blockHeight) {
        const currentHeight = parseInt(blockHeight.textContent.replace(',', ''));
        blockHeight.textContent = (currentHeight + Math.floor(Math.random() * 3)).toLocaleString();
    }
    
    if (totalVoters) {
        const currentVoters = parseInt(totalVoters.textContent.replace(',', ''));
        totalVoters.textContent = (currentVoters + Math.floor(Math.random() * 5)).toLocaleString();
    }
}