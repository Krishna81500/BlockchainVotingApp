// Real OTP and Camera Capture Voting App
let currentUser = null;
let aadhaarPhoto = null;
let facePhoto = null;
let otpTimers = {};

// Screen Navigation
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

function showHomeScreen() { showScreen('homeScreen'); }
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
function showVotingScreen() { showScreen('votingScreen'); }
function showResultsScreen() { showScreen('resultsScreen'); }
function showBlockchainScreen() { showScreen('blockchainScreen'); }

// Real OTP Functions
async function sendLoginOTP() {
    const email = document.getElementById('loginEmail').value;
    if (!email || !isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }

    try {
        const otp = generateOTP();
        await sendEmailOTP(email, otp, 'login');
        
        document.getElementById('loginOtpSection').style.display = 'block';
        document.getElementById('loginSubmitBtn').innerHTML = '<i class="fas fa-key"></i> Verify OTP';
        document.getElementById('loginSubmitBtn').onclick = verifyLoginOTP;
        
        startOTPTimer('loginOtpTimer', 'loginResendOtp', 120);
        
        // Store OTP temporarily (in real app, this would be server-side)
        sessionStorage.setItem('loginOTP', otp);
        sessionStorage.setItem('loginEmail', email);
        
        alert(`OTP sent to ${email}`);
    } catch (error) {
        alert('Failed to send OTP. Please try again.');
        console.error('OTP Error:', error);
    }
}

async function verifyLoginOTP() {
    const enteredOTP = document.getElementById('loginOtpCode').value;
    const storedOTP = sessionStorage.getItem('loginOTP');
    const email = sessionStorage.getItem('loginEmail');
    
    if (!enteredOTP) {
        alert('Please enter the OTP');
        return;
    }
    
    try {
        const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, otp: enteredOTP })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            currentUser = {
                email: email,
                name: email.split('@')[0],
                loginTime: new Date()
            };
            
            document.getElementById('userName').textContent = currentUser.name;
            sessionStorage.removeItem('loginOTP');
            sessionStorage.removeItem('loginEmail');
            
            showDashboard();
            alert('Login successful!');
            resetLoginForm();
        } else {
            alert(result.error || 'Invalid OTP. Please try again.');
        }
    } catch (error) {
        alert('Verification failed. Please try again.');
        console.error('OTP Verification Error:', error);
    }
}

async function sendRegOTP() {
    const name = document.getElementById('fullName').value;
    const aadhaar = document.getElementById('aadhaarNumber').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    
    if (!name || !aadhaar || !email || !phone) {
        alert('Please fill all required fields');
        return;
    }
    
    if (!aadhaarPhoto || !facePhoto) {
        alert('Please capture both Aadhaar card and face photos');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (!isValidAadhaar(aadhaar)) {
        alert('Please enter a valid 12-digit Aadhaar number');
        return;
    }

    try {
        const otp = generateOTP();
        await sendEmailOTP(email, otp, 'registration');
        
        document.getElementById('regOtpSection').style.display = 'block';
        document.getElementById('registerBtn').innerHTML = '<i class="fas fa-check"></i> Complete Registration';
        document.getElementById('registerBtn').onclick = completeRegistration;
        
        startOTPTimer('regOtpTimer', 'regResendOtp', 120);
        
        sessionStorage.setItem('regOTP', otp);
        sessionStorage.setItem('regData', JSON.stringify({
            name, aadhaar, email, phone, aadhaarPhoto, facePhoto
        }));
        
        alert(`OTP sent to ${email}`);
    } catch (error) {
        alert('Failed to send OTP. Please try again.');
        console.error('Registration OTP Error:', error);
    }
}

async function completeRegistration() {
    const enteredOTP = document.getElementById('regOtpCode').value;
    const storedOTP = sessionStorage.getItem('regOTP');
    const regData = JSON.parse(sessionStorage.getItem('regData'));
    
    if (!enteredOTP) {
        alert('Please enter the OTP');
        return;
    }
    
    try {
        const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: regData.email, otp: enteredOTP })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Store user data (in real app, this would be in database)
            const userData = {
                ...regData,
                registrationTime: new Date(),
                verified: true
            };
            
            localStorage.setItem(`user_${regData.email}`, JSON.stringify(userData));
            
            sessionStorage.removeItem('regOTP');
            sessionStorage.removeItem('regData');
            
            alert('Registration successful! You can now login.');
            showHomeScreen();
            resetRegistrationForm();
        } else {
            alert(result.error || 'Invalid OTP. Please try again.');
        }
    } catch (error) {
        alert('Verification failed. Please try again.');
        console.error('OTP Verification Error:', error);
    }
}

// Camera Capture Functions
async function captureAadhaar() {
    try {
        const video = document.getElementById('aadhaarVideo');
        const canvas = document.getElementById('aadhaarCanvas');
        const preview = document.getElementById('aadhaarPreview');
        const img = document.getElementById('aadhaarImg');
        const btn = document.getElementById('captureAadhaarBtn');
        
        if (video.style.display === 'none') {
            // Start camera
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            video.srcObject = stream;
            video.style.display = 'block';
            btn.innerHTML = '<i class="fas fa-camera"></i> Take Photo';
        } else {
            // Capture photo
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);
            
            aadhaarPhoto = canvas.toDataURL('image/jpeg', 0.8);
            img.src = aadhaarPhoto;
            preview.style.display = 'block';
            
            // Stop camera
            video.srcObject.getTracks().forEach(track => track.stop());
            video.style.display = 'none';
            btn.innerHTML = '<i class="fas fa-redo"></i> Retake Photo';
        }
    } catch (error) {
        alert('Camera access denied. Please allow camera permission.');
        console.error('Camera Error:', error);
    }
}

async function captureFace() {
    try {
        const video = document.getElementById('faceVideo');
        const canvas = document.getElementById('faceCanvas');
        const preview = document.getElementById('facePreview');
        const img = document.getElementById('faceImg');
        const btn = document.getElementById('captureFaceBtn');
        
        if (video.style.display === 'none') {
            // Start camera
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } 
            });
            video.srcObject = stream;
            video.style.display = 'block';
            btn.innerHTML = '<i class="fas fa-camera"></i> Take Photo';
        } else {
            // Capture photo
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);
            
            facePhoto = canvas.toDataURL('image/jpeg', 0.8);
            img.src = facePhoto;
            preview.style.display = 'block';
            
            // Stop camera
            video.srcObject.getTracks().forEach(track => track.stop());
            video.style.display = 'none';
            btn.innerHTML = '<i class="fas fa-redo"></i> Retake Photo';
        }
    } catch (error) {
        alert('Camera access denied. Please allow camera permission.');
        console.error('Camera Error:', error);
    }
}

// Voting Functions
function selectCandidate(id) {
    document.querySelectorAll('.candidate-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    document.getElementById('submitVoteBtn').disabled = false;
}

async function submitVote() {
    if (!currentUser) {
        alert('Please login first');
        return;
    }
    
    const selectedCard = document.querySelector('.candidate-card.selected');
    if (!selectedCard) {
        alert('Please select a candidate');
        return;
    }
    
    const candidateName = selectedCard.querySelector('.candidate-details h4').textContent;
    
    // Face verification before voting
    const verified = await verifyFaceForVoting();
    if (!verified) {
        alert('Face verification failed. Please try again.');
        return;
    }
    
    // Submit vote to blockchain (simulated)
    const voteData = {
        voter: currentUser.email,
        candidate: candidateName,
        timestamp: new Date(),
        blockHash: generateBlockHash()
    };
    
    // Store vote (in real app, this would be on blockchain)
    const votes = JSON.parse(localStorage.getItem('votes') || '[]');
    votes.push(voteData);
    localStorage.setItem('votes', JSON.stringify(votes));
    
    alert(`Vote successfully cast for ${candidateName}!\nTransaction Hash: ${voteData.blockHash}`);
    showDashboard();
    
    // Reset voting screen
    document.querySelectorAll('.candidate-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById('submitVoteBtn').disabled = true;
}

async function verifyFaceForVoting() {
    // Simulate face verification (in real app, this would use ML)
    return new Promise((resolve) => {
        const modal = confirm('Please look at the camera for face verification.\nClick OK when ready.');
        if (modal) {
            setTimeout(() => {
                const verified = Math.random() > 0.2; // 80% success rate
                resolve(verified);
            }, 2000);
        } else {
            resolve(false);
        }
    });
}

// Utility Functions
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmailOTP(email, otp, type) {
    try {
        const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, type })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to send OTP');
        }
        
        return result;
    } catch (error) {
        console.error('OTP Send Error:', error);
        throw error;
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidAadhaar(aadhaar) {
    const cleanAadhaar = aadhaar.replace(/\s/g, '');
    return /^\d{12}$/.test(cleanAadhaar);
}

function generateBlockHash() {
    return '0x' + Math.random().toString(16).substr(2, 8) + '...' + Math.random().toString(16).substr(2, 4);
}

function startOTPTimer(timerId, resendBtnId, duration) {
    let timeLeft = duration;
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
    
    otpTimers[timerId] = timer;
}

// Settings Functions
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
    if (currentUser) {
        alert(`Profile:\nName: ${currentUser.name}\nEmail: ${currentUser.email}\nLogin Time: ${currentUser.loginTime}`);
    } else {
        alert('Please login to view profile');
    }
}

function changeLanguage(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
    alert(`Language changed to ${lang.toUpperCase()}`);
}

function logout() {
    currentUser = null;
    showHomeScreen();
    hideLogoutButton();
    alert('Logged out successfully');
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

// Reset Functions
function resetLoginForm() {
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginOtpCode').value = '';
    document.getElementById('loginOtpSection').style.display = 'none';
    document.getElementById('loginSubmitBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP';
    document.getElementById('loginSubmitBtn').onclick = sendLoginOTP;
}

function resetRegistrationForm() {
    document.getElementById('fullName').value = '';
    document.getElementById('aadhaarNumber').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPhone').value = '';
    document.getElementById('regOtpCode').value = '';
    
    aadhaarPhoto = null;
    facePhoto = null;
    
    document.getElementById('aadhaarPreview').style.display = 'none';
    document.getElementById('facePreview').style.display = 'none';
    document.getElementById('regOtpSection').style.display = 'none';
    
    document.getElementById('captureAadhaarBtn').innerHTML = '<i class="fas fa-camera"></i> Capture Aadhaar Card';
    document.getElementById('captureFaceBtn').innerHTML = '<i class="fas fa-camera"></i> Capture Face Photo';
    document.getElementById('registerBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP to Register';
    document.getElementById('registerBtn').onclick = sendRegOTP;
}

// Resend OTP Functions
async function resendLoginOTP() {
    const email = sessionStorage.getItem('loginEmail');
    if (email) {
        await sendLoginOTP();
    }
}

async function resendRegOTP() {
    const regData = JSON.parse(sessionStorage.getItem('regData'));
    if (regData) {
        const otp = generateOTP();
        await sendEmailOTP(regData.email, otp, 'registration');
        sessionStorage.setItem('regOTP', otp);
        startOTPTimer('regOtpTimer', 'regResendOtp', 120);
        alert('New OTP sent!');
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('SecureVote App Loaded');
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
    
    // Update blockchain info periodically
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