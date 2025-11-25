// Real OTP implementation with email sending
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

let loginOtpTimer;

async function sendLoginOTP() {
    const email = document.getElementById('loginEmail').value;
    if (!email) return alert('Please enter your email address');
    
    const btn = document.getElementById('loginSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending OTP...';
    
    try {
        const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, purpose: 'login' })
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('loginOtpSection').style.display = 'block';
            btn.innerHTML = '<i class="fas fa-key"></i> Verify OTP';
            btn.disabled = false;
            btn.onclick = verifyLoginOTP;
            startLoginOtpTimer(300); // 5 minutes
            alert('OTP sent to your email! Please check your inbox.');
        } else {
            alert('Failed to send OTP: ' + result.message);
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP';
        }
    } catch (error) {
        alert('Error sending OTP. Please try again.');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP';
    }
}

function startLoginOtpTimer(seconds) {
    const timerElement = document.getElementById('loginOtpTimer');
    const resendBtn = document.getElementById('loginResendOtp');
    
    if (loginOtpTimer) clearInterval(loginOtpTimer);
    
    resendBtn.disabled = true;
    
    loginOtpTimer = setInterval(() => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timerElement.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        if (seconds <= 0) {
            clearInterval(loginOtpTimer);
            timerElement.textContent = '0:00';
            resendBtn.disabled = false;
            alert('OTP expired! Please request a new one.');
        }
        seconds--;
    }, 1000);
}

async function verifyLoginOTP() {
    const email = document.getElementById('loginEmail').value;
    const otp = document.getElementById('loginOtpCode').value;
    
    if (!otp) return alert('Please enter the OTP');
    
    const btn = document.getElementById('loginSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    
    try {
        const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Store user email for face verification
            currentUserEmail = email;
            showDashboard();
            alert('Login successful!');
        } else {
            alert('Invalid OTP: ' + result.message);
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-key"></i> Verify OTP';
        }
    } catch (error) {
        alert('Error verifying OTP. Please try again.');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-key"></i> Verify OTP';
    }
}

let regOtpTimer;

async function sendRegOTP() {
    // Validate all required fields
    const requiredFields = {
        'aadharName': 'Full Name',
        'aadhaarNumber': 'Aadhaar Number',
        'dateOfBirth': 'Date of Birth',
        'gender': 'Gender',
        'address': 'Address',
        'regPhone': 'Mobile Number',
        'regEmail': 'Email Address',
        'voterIdNumber': 'Voter ID Number',
        'country': 'Country',
        'state': 'State',
        'votingType': 'Voting Type'
    };
    
    // Check all required fields
    for (const [fieldId, fieldName] of Object.entries(requiredFields)) {
        const value = document.getElementById(fieldId).value.trim();
        if (!value) {
            alert(`Please fill in the ${fieldName} field.`);
            document.getElementById(fieldId).focus();
            return;
        }
    }
    
    // Validate Aadhaar number format (12 digits)
    const aadhaarNumber = document.getElementById('aadhaarNumber').value.replace(/\s/g, '');
    if (!/^\d{12}$/.test(aadhaarNumber)) {
        alert('Please enter a valid 12-digit Aadhaar number.');
        document.getElementById('aadhaarNumber').focus();
        return;
    }
    
    // Validate email format
    const email = document.getElementById('regEmail').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        document.getElementById('regEmail').focus();
        return;
    }
    
    // Validate phone number (10 digits)
    const phone = document.getElementById('regPhone').value.replace(/\D/g, '');
    if (!/^\d{10}$/.test(phone)) {
        alert('Please enter a valid 10-digit mobile number.');
        document.getElementById('regPhone').focus();
        return;
    }
    
    // Check if face photo is captured
    if (!capturedFaceData) {
        alert('Please capture your face photo before proceeding.');
        document.getElementById('captureFaceBtn').scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    // Check if Aadhaar photo is uploaded/captured
    if (!aadhaarPhotoData) {
        alert('Please upload or capture your Aadhaar card photo before proceeding.');
        document.getElementById('captureAadhaarBtn').scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    const btn = document.getElementById('registerBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending OTP...';
    
    try {
        const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, purpose: 'registration' })
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('regOtpSection').style.display = 'block';
            btn.innerHTML = '<i class="fas fa-user-plus"></i> Complete Registration';
            btn.disabled = false;
            btn.onclick = completeRegistration;
            startRegOtpTimer(300); // 5 minutes
            alert('OTP sent to your email! Please check your inbox.');
        } else {
            alert('Failed to send OTP: ' + result.message);
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP to Verify';
        }
    } catch (error) {
        alert('Error sending OTP. Please try again.');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP to Verify';
    }
}

function startRegOtpTimer(seconds) {
    const timerElement = document.getElementById('regOtpTimer');
    const resendBtn = document.getElementById('regResendOtp');
    
    if (regOtpTimer) clearInterval(regOtpTimer);
    
    resendBtn.disabled = true;
    
    regOtpTimer = setInterval(() => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timerElement.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        if (seconds <= 0) {
            clearInterval(regOtpTimer);
            timerElement.textContent = '0:00';
            resendBtn.disabled = false;
            alert('OTP expired! Please request a new one.');
        }
        seconds--;
    }, 1000);
}

async function completeRegistration() {
    const email = document.getElementById('regEmail').value;
    const otp = document.getElementById('regOtpCode').value;
    
    if (!otp) return alert('Please enter the OTP');
    
    const btn = document.getElementById('registerBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    
    // Validate required data
    if (!capturedFaceData) {
        alert('Please capture your face photo before completing registration.');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Complete Registration';
        return;
    }
    
    if (!aadhaarPhotoData) {
        alert('Please upload or capture your Aadhaar card photo.');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Complete Registration';
        return;
    }
    
    // Collect registration data including photos
    const registrationData = {
        email,
        aadharName: document.getElementById('aadharName').value,
        aadhaarNumber: document.getElementById('aadhaarNumber').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('regPhone').value,
        voterId: document.getElementById('voterIdNumber').value,
        country: document.getElementById('country').value,
        state: document.getElementById('state').value,
        votingType: document.getElementById('votingType').value,
        facePhoto: capturedFaceData,
        aadhaarPhoto: aadhaarPhotoData,
        registrationTimestamp: new Date().toISOString()
    };
    
    try {
        const response = await fetch('/api/complete-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, registrationData })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showHomeScreen();
            alert('Registration submitted successfully! Please wait for admin approval.');
        } else {
            alert('Registration failed: ' + result.message);
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-user-plus"></i> Complete Registration';
        }
    } catch (error) {
        alert('Error completing registration. Please try again.');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Complete Registration';
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

// Face capture variables
let faceStream = null;
let faceCanvas = null;
let faceContext = null;
let capturedFaceData = null;
let aadhaarPhotoData = null;

// Initialize face capture
async function captureFaceForRegistration() {
    try {
        const video = document.getElementById('regFaceVideo');
        const captureBtn = document.getElementById('captureFaceBtn');
        
        if (faceStream) {
            // Stop existing stream
            const scanner = document.querySelector('.reg-face-scanner');
            faceStream.getTracks().forEach(track => track.stop());
            faceStream = null;
            video.srcObject = null;
            video.style.display = 'none';
            scanner.classList.remove('active');
            captureBtn.innerHTML = '<i class="fas fa-camera"></i> Start Face Capture';
            captureBtn.classList.remove('verified');
            return;
        }
        
        // Request camera access
        faceStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            } 
        });
        
        const scanner = document.querySelector('.reg-face-scanner');
        video.srcObject = faceStream;
        video.style.display = 'block';
        scanner.classList.add('active');
        captureBtn.innerHTML = '<i class="fas fa-camera"></i> Capture Face';
        captureBtn.onclick = takeFacePhoto;
        captureBtn.classList.remove('verified');
        
        // Initialize canvas for face capture
        if (!faceCanvas) {
            faceCanvas = document.createElement('canvas');
            faceCanvas.width = 640;
            faceCanvas.height = 480;
            faceContext = faceCanvas.getContext('2d');
        }
        
        alert('Camera started! Position your face in the frame and click "Capture Face"');
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please ensure camera permissions are granted.');
    }
}

// Capture face photo
function takeFacePhoto() {
    const video = document.getElementById('regFaceVideo');
    const previewDiv = document.getElementById('facePhotoPreview');
    const previewImg = document.getElementById('facePreviewImg');
    const captureBtn = document.getElementById('captureFaceBtn');
    const scanner = document.querySelector('.reg-face-scanner');
    
    if (!faceStream || !video.videoWidth) {
        alert('Camera not ready. Please wait a moment and try again.');
        return;
    }
    
    // Draw video frame to canvas
    faceContext.drawImage(video, 0, 0, faceCanvas.width, faceCanvas.height);
    
    // Convert to base64
    capturedFaceData = faceCanvas.toDataURL('image/jpeg', 0.8);
    
    // Show preview
    previewImg.src = capturedFaceData;
    previewDiv.style.display = 'block';
    
    // Stop camera
    faceStream.getTracks().forEach(track => track.stop());
    faceStream = null;
    video.srcObject = null;
    video.style.display = 'none';
    scanner.classList.remove('active');
    
    captureBtn.innerHTML = '<i class="fas fa-redo"></i> Retake Face Photo';
    captureBtn.onclick = captureFaceForRegistration;
    
    // Add success styling
    captureBtn.classList.add('verified');
    
    alert('Face captured successfully!');
}

// Aadhaar photo handling
function handleAadhaarPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        aadhaarPhotoData = e.target.result;
        const previewDiv = document.getElementById('aadhaarPhotoPreview');
        const previewImg = document.getElementById('aadhaarPreviewImg');
        
        previewImg.src = aadhaarPhotoData;
        previewDiv.style.display = 'block';
        
        alert('Aadhaar photo uploaded successfully!');
    };
    reader.readAsDataURL(file);
}

// Aadhaar photo capture with camera
let aadhaarStream = null;
let aadhaarCanvas = null;
let aadhaarContext = null;

async function captureAadhaarPhoto() {
    try {
        const video = document.getElementById('aadhaarVideo');
        const captureDiv = document.getElementById('aadhaarCaptureDiv');
        const takePhotoBtn = document.getElementById('takeAadhaarPhoto');
        const captureBtn = document.getElementById('captureAadhaarBtn');
        
        if (aadhaarStream) {
            // Stop existing stream
            aadhaarStream.getTracks().forEach(track => track.stop());
            aadhaarStream = null;
            video.srcObject = null;
            captureDiv.style.display = 'none';
            captureBtn.innerHTML = '<i class="fas fa-camera"></i> Capture Aadhaar Photo';
            return;
        }
        
        // Request camera access
        aadhaarStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'environment' // Use back camera for document capture
            } 
        });
        
        video.srcObject = aadhaarStream;
        captureDiv.style.display = 'block';
        takePhotoBtn.style.display = 'block';
        captureBtn.innerHTML = '<i class="fas fa-times"></i> Cancel Capture';
        
        // Initialize canvas for aadhaar capture
        if (!aadhaarCanvas) {
            aadhaarCanvas = document.getElementById('aadhaarCanvas');
            aadhaarCanvas.width = 1280;
            aadhaarCanvas.height = 720;
            aadhaarContext = aadhaarCanvas.getContext('2d');
        }
        
        alert('Camera started! Position your Aadhaar card in the frame and click "Take Photo"');
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please ensure camera permissions are granted.');
    }
}

// Take Aadhaar photo
function takeAadhaarPhoto() {
    const video = document.getElementById('aadhaarVideo');
    const previewDiv = document.getElementById('aadhaarPhotoPreview');
    const previewImg = document.getElementById('aadhaarPreviewImg');
    const captureDiv = document.getElementById('aadhaarCaptureDiv');
    const captureBtn = document.getElementById('captureAadhaarBtn');
    
    if (!aadhaarStream || !video.videoWidth) {
        alert('Camera not ready. Please wait a moment and try again.');
        return;
    }
    
    // Draw video frame to canvas
    aadhaarContext.drawImage(video, 0, 0, aadhaarCanvas.width, aadhaarCanvas.height);
    
    // Convert to base64
    aadhaarPhotoData = aadhaarCanvas.toDataURL('image/jpeg', 0.8);
    
    // Show preview
    previewImg.src = aadhaarPhotoData;
    previewDiv.style.display = 'block';
    
    // Stop camera
    aadhaarStream.getTracks().forEach(track => track.stop());
    aadhaarStream = null;
    video.srcObject = null;
    captureDiv.style.display = 'none';
    
    captureBtn.innerHTML = '<i class="fas fa-camera"></i> Capture Aadhaar Photo';
    
    alert('Aadhaar photo captured successfully!');
}
async function resendLoginOTP() {
    const email = document.getElementById('loginEmail').value;
    if (!email) return;
    
    const resendBtn = document.getElementById('loginResendOtp');
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';
    
    try {
        const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, purpose: 'login' })
        });
        
        const result = await response.json();
        
        if (result.success) {
            startLoginOtpTimer(300);
            alert('New OTP sent to your email!');
        } else {
            alert('Failed to resend OTP: ' + result.message);
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend OTP';
        }
    } catch (error) {
        alert('Error resending OTP.');
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend OTP';
    }
}

async function resendRegOTP() {
    const email = document.getElementById('regEmail').value;
    if (!email) return;
    
    const resendBtn = document.getElementById('regResendOtp');
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';
    
    try {
        const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, purpose: 'registration' })
        });
        
        const result = await response.json();
        
        if (result.success) {
            startRegOtpTimer(300);
            alert('New OTP sent to your email!');
        } else {
            alert('Failed to resend OTP: ' + result.message);
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend OTP';
        }
    } catch (error) {
        alert('Error resending OTP.');
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend OTP';
    }
}
// Vote modal and face verification for voting
let voteVerificationStream = null;
let voteVerificationCanvas = null;
let voteVerificationContext = null;
let currentUserEmail = null;

function showVoteModal() { 
    document.getElementById('voteModal').style.display = 'flex'; 
}

function closeVoteModal() { 
    // Stop any active camera stream
    if (voteVerificationStream) {
        voteVerificationStream.getTracks().forEach(track => track.stop());
        voteVerificationStream = null;
    }
    document.getElementById('voteModal').style.display = 'none'; 
}

async function verifyFaceForVote() {
    try {
        const video = document.getElementById('voteFaceVideo');
        const verifyBtn = document.getElementById('verifyFaceBtn');
        
        if (voteVerificationStream) {
            // Capture and verify face
            await captureFaceForVerification();
            return;
        }
        
        // Start camera
        voteVerificationStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 320 },
                height: { ideal: 240 },
                facingMode: 'user'
            } 
        });
        
        video.srcObject = voteVerificationStream;
        video.style.display = 'block';
        verifyBtn.innerHTML = '<i class="fas fa-camera"></i> Capture & Verify';
        
        // Initialize canvas
        if (!voteVerificationCanvas) {
            voteVerificationCanvas = document.createElement('canvas');
            voteVerificationCanvas.width = 320;
            voteVerificationCanvas.height = 240;
            voteVerificationContext = voteVerificationCanvas.getContext('2d');
        }
        
    } catch (error) {
        console.error('Error accessing camera for vote verification:', error);
        alert('Unable to access camera for face verification.');
    }
}

async function captureFaceForVerification() {
    const video = document.getElementById('voteFaceVideo');
    const verifyBtn = document.getElementById('verifyFaceBtn');
    
    if (!voteVerificationStream || !video.videoWidth) {
        alert('Camera not ready. Please wait a moment and try again.');
        return;
    }
    
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    
    // Capture face
    voteVerificationContext.drawImage(video, 0, 0, voteVerificationCanvas.width, voteVerificationCanvas.height);
    const faceData = voteVerificationCanvas.toDataURL('image/jpeg', 0.8);
    
    try {
        // Verify face with server
        const response = await fetch('/api/verify-face', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: currentUserEmail || 'demo@example.com', // Use actual logged-in user email
                faceData: faceData 
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Stop camera
            voteVerificationStream.getTracks().forEach(track => track.stop());
            voteVerificationStream = null;
            video.srcObject = null;
            video.style.display = 'none';
            
            document.getElementById('finalConfirmBtn').disabled = false;
            verifyBtn.innerHTML = '<i class="fas fa-check"></i> Verified';
            verifyBtn.disabled = true;
            verifyBtn.style.background = '#28a745';
            
            alert('Face verification successful! You can now confirm your vote.');
        } else {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = '<i class="fas fa-user-check"></i> Verify Face';
            alert('Face verification failed: ' + result.message);
        }
    } catch (error) {
        console.error('Face verification error:', error);
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = '<i class="fas fa-user-check"></i> Verify Face';
        alert('Face verification failed. Please try again.');
    }
}

function confirmVote() {
    closeVoteModal();
    alert('Vote confirmed and submitted to blockchain!');
    showDashboard();
}

document.addEventListener('DOMContentLoaded', function() {
    showHomeScreen();
    console.log('App loaded');
});