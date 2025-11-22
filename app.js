// Ultra minimal working app
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function showHomeScreen() { showScreen('homeScreen'); }
function showLoginScreen() { showScreen('loginScreen'); }
function showRegisterScreen() { showScreen('registerScreen'); }
function showDashboard() { showScreen('dashboardScreen'); }
function showVotingScreen() { showScreen('votingScreen'); }
function showResultsScreen() { showScreen('resultsScreen'); }
function showBlockchainScreen() { showScreen('blockchainScreen'); }

function sendLoginOTP() {
    const email = document.getElementById('loginEmail').value;
    if (!email) return alert('Enter email');
    document.getElementById('loginOtpSection').style.display = 'block';
    document.getElementById('loginSubmitBtn').onclick = verifyLoginOTP;
    alert('OTP: 123456');
}

function verifyLoginOTP() {
    const otp = document.getElementById('loginOtpCode').value;
    if (otp === '123456') {
        showDashboard();
        alert('Login success!');
    } else {
        alert('Wrong OTP. Use: 123456');
    }
}

function sendRegOTP() {
    const email = document.getElementById('regEmail').value;
    if (!email) return alert('Enter email');
    document.getElementById('regOtpSection').style.display = 'block';
    document.getElementById('registerBtn').onclick = completeRegistration;
    alert('OTP: 123456');
}

function completeRegistration() {
    const otp = document.getElementById('regOtpCode').value;
    if (otp === '123456') {
        showHomeScreen();
        alert('Registration success!');
    } else {
        alert('Wrong OTP. Use: 123456');
    }
}

function selectCandidate(id) {
    document.querySelectorAll('.candidate-card').forEach(c => c.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    document.getElementById('submitVoteBtn').disabled = false;
}

function submitVote() {
    alert('Vote submitted!');
    showDashboard();
}

function toggleSettingsMenu() {
    document.getElementById('settingsDropdown').classList.toggle('active');
}

function showProfile() { alert('Profile coming soon!'); }
function showSettings() { alert('Settings coming soon!'); }
function showAboutApp() { alert('SecureVote v1.0'); }
function showAboutElection() { alert('Election 2024'); }
function changeLanguage(lang) { alert('Language: ' + lang); }
function logout() { showHomeScreen(); alert('Logged out'); }
function showHistoryScreen() { alert('History coming soon!'); }

// Dummy functions for HTML compatibility
function handleAadhaarPhotoUpload() { alert('Photo uploaded!'); }
function captureAadhaarPhoto() { alert('Photo captured!'); }
function takeAadhaarPhoto() { alert('Photo taken!'); }
function captureFaceForRegistration() { alert('Face captured!'); }
function resendLoginOTP() { alert('OTP resent!'); }
function resendRegOTP() { alert('OTP resent!'); }
function showVoteModal() { document.getElementById('voteModal').style.display = 'flex'; }
function closeVoteModal() { document.getElementById('voteModal').style.display = 'none'; }
function verifyFaceForVote() { 
    document.getElementById('finalConfirmBtn').disabled = false;
    alert('Face verified!');
}
function confirmVote() {
    closeVoteModal();
    alert('Vote confirmed!');
    showDashboard();
}

document.addEventListener('DOMContentLoaded', function() {
    showHomeScreen();
    console.log('App loaded');
});