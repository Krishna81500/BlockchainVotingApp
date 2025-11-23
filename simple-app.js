// Minimal working app - No freezing
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
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

// Screen navigation functions
function showHomeScreen() {
    showScreen('homeScreen');
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
    showLogoutButton();
}

function showVotingScreen() {
    showScreen('votingScreen');
}

function showResultsScreen() {
    showScreen('resultsScreen');
}

function showBlockchainScreen() {
    showScreen('blockchainScreen');
}

function showHistoryScreen() {
    alert('Vote History feature coming soon!');
}

// Login functions
function sendLoginOTP() {
    const email = document.getElementById('loginEmail').value;
    if (!email) {
        alert('Please enter email');
        return;
    }
    
    document.getElementById('loginOtpSection').style.display = 'block';
    document.getElementById('loginSubmitBtn').innerHTML = 'Verify OTP';
    document.getElementById('loginSubmitBtn').onclick = verifyLoginOTP;
    
    alert('OTP sent to ' + email + '\nDemo OTP: 123456');
}

function verifyLoginOTP() {
    const otp = document.getElementById('loginOtpCode').value;
    const email = document.getElementById('loginEmail').value;
    
    if (!otp) {
        alert('Please enter OTP');
        return;
    }
    
    if (otp === '123456') {
        document.getElementById('userName').textContent = email.split('@')[0] || 'User';
        showDashboard();
        alert('Login successful!');
        resetLoginForm();
    } else {
        alert('Invalid OTP. Use: 123456');
    }
}

function resetLoginForm() {
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginOtpCode').value = '';
    document.getElementById('loginOtpSection').style.display = 'none';
    document.getElementById('loginSubmitBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP';
    document.getElementById('loginSubmitBtn').onclick = sendLoginOTP;
}

// Registration functions
function sendRegOTP() {
    const email = document.getElementById('regEmail').value;
    const name = document.getElementById('aadharName').value;
    
    if (!name || !email) {
        alert('Please fill name and email');
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
        alert('Invalid OTP. Use: 123456');
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

// Voting functions
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
        alert('Please select a candidate');
        return;
    }
    
    const candidateName = selectedCard.querySelector('.candidate-details h4').textContent;
    document.getElementById('selectedCandidateName').textContent = candidateName;
    document.getElementById('selectedCandidateParty').textContent = selectedCard.querySelector('.candidate-details p').textContent;
    document.getElementById('selectedCandidateImg').src = selectedCard.querySelector('.candidate-info img').src;
    
    showVoteModal();
}

function showVoteModal() {
    document.getElementById('voteModal').style.display = 'flex';
}

function closeVoteModal() {
    document.getElementById('voteModal').style.display = 'none';
    document.getElementById('verifyFaceBtn').disabled = false;
    document.getElementById('finalConfirmBtn').disabled = true;
}

function verifyFaceForVote() {
    const verifyBtn = document.getElementById('verifyFaceBtn');
    const confirmBtn = document.getElementById('finalConfirmBtn');
    
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = 'Verifying...';
    
    setTimeout(() => {
        verifyBtn.innerHTML = 'Face Verified';
        verifyBtn.style.background = '#10b981';
        confirmBtn.disabled = false;
    }, 1500);
}

function confirmVote() {
    closeVoteModal();
    showLoadingOverlay();
    
    setTimeout(() => {
        hideLoadingOverlay();
        alert('Vote submitted to blockchain!\nTransaction: 0x7a8f...9c2d');
        showDashboard();
        
        document.querySelectorAll('.candidate-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById('submitVoteBtn').disabled = true;
    }, 2000);
}

function showLoadingOverlay() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoadingOverlay() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Settings functions
function toggleSettingsMenu() {
    const dropdown = document.getElementById('settingsDropdown');
    dropdown.classList.toggle('active');
}

function closeSettingsMenu() {
    const dropdown = document.getElementById('settingsDropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
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
    alert('SecureVote v1.0\nBlockchain Voting System');
}

function showAboutElection() {
    closeSettingsMenu();
    alert('General Election 2024\nCentral District');
}

function changeLanguage(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
    alert('Language: ' + lang.toUpperCase());
}

function logout() {
    showHomeScreen();
    hideLogoutButton();
    document.getElementById('userName').textContent = 'Guest';
    alert('Logged out');
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

// Photo capture functions (simplified)
function handleAadhaarPhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('aadhaarPreviewImg').src = e.target.result;
            document.getElementById('aadhaarPhotoPreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function captureAadhaarPhoto() {
    alert('Camera feature simulated. Photo captured!');
    document.getElementById('aadhaarPhotoPreview').style.display = 'block';
}

function takeAadhaarPhoto() {
    alert('Photo taken!');
    document.getElementById('aadhaarCaptureDiv').style.display = 'none';
    document.getElementById('aadhaarPhotoPreview').style.display = 'block';
}

function captureFaceForRegistration() {
    alert('Face capture simulated. Face registered!');
    document.getElementById('facePhotoPreview').style.display = 'block';
}

function resendLoginOTP() {
    alert('New OTP sent!');
}

function resendRegOTP() {
    alert('New OTP sent!');
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('SecureVote loaded');
    showHomeScreen();
    hideLogoutButton();
    
    // Close settings menu when clicking outside
    document.addEventListener('click', function(event) {
        const settingsMenu = document.querySelector('.settings-menu');
        const dropdown = document.getElementById('settingsDropdown');
        if (settingsMenu && dropdown && !settingsMenu.contains(event.target)) {
            dropdown.classList.remove('active');
        }
    });
    
    // Update blockchain info
    setInterval(() => {
        const blockHeight = document.getElementById('blockHeight');
        const totalVoters = document.getElementById('totalVoters');
        
        if (blockHeight) {
            const current = parseInt(blockHeight.textContent.replace(',', ''));
            blockHeight.textContent = (current + Math.floor(Math.random() * 3)).toLocaleString();
        }
        
        if (totalVoters) {
            const current = parseInt(totalVoters.textContent.replace(',', ''));
            totalVoters.textContent = (current + Math.floor(Math.random() * 5)).toLocaleString();
        }
    }, 30000);
});