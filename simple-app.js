// Simple working app
function showHomeScreen() {
    showScreen('homeScreen');
}

function showLoginScreen() {
    showScreen('loginScreen');
}

function showRegisterScreen() {
    showScreen('registerScreen');
}

function showDashboard() {
    showScreen('dashboardScreen');
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
        alert('Please enter email');
        return;
    }
    
    // Show OTP section
    document.getElementById('loginOtpSection').style.display = 'block';
    document.getElementById('loginSubmitBtn').innerHTML = 'Verify OTP';
    document.getElementById('loginSubmitBtn').onclick = verifyLoginOTP;
    
    alert('OTP sent to ' + email);
}

function verifyLoginOTP() {
    const otp = document.getElementById('loginOtpCode').value;
    if (!otp) {
        alert('Please enter OTP');
        return;
    }
    
    // Simple verification
    if (otp === '123456') {
        showDashboard();
        alert('Login successful!');
    } else {
        alert('Invalid OTP. Try 123456');
    }
}





// Aadhaar validation and mock authentication
let aadhaarVerified = false;
let verifiedAadhaarData = null;

// Valid test Aadhaar numbers with face data for demo
const validAadhaarNumbers = {
    '123456789012': {
        name: 'Rajesh Kumar Singh',
        dateOfBirth: '1985-03-12',
        gender: 'M',
        address: 'H.No. 45, Sector 12, Dwarka, New Delhi - 110075',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        faceFeatures: 'male_indian_features_1'
    },
    '234567890123': {
        name: 'Priya Sharma',
        dateOfBirth: '1992-07-28',
        gender: 'F',
        address: 'Flat 302, Sunrise Apartments, Bandra West, Mumbai - 400050',
        photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        faceFeatures: 'female_indian_features_1'
    },
    '345678901234': {
        name: 'Amit Patel',
        dateOfBirth: '1988-11-05',
        gender: 'M',
        address: 'Plot 15, Satellite Road, Ahmedabad, Gujarat - 380015',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        faceFeatures: 'male_indian_features_2'
    },
    '456789012345': {
        name: 'Sneha Reddy',
        dateOfBirth: '1995-01-18',
        gender: 'F',
        address: 'Door No. 8-3-228/A, Jubilee Hills, Hyderabad - 500033',
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        faceFeatures: 'female_indian_features_2'
    }
};

// Face verification variables
let capturedFaceData = null;
let faceVerificationPassed = false;
let aadhaarPhotoData = null;

function validateAadhaarFormat(aadhaar) {
    // Remove spaces and hyphens
    const cleanAadhaar = aadhaar.replace(/[\s-]/g, '');
    
    // Check if it's 12 digits
    if (!/^\d{12}$/.test(cleanAadhaar)) {
        return false;
    }
    
    // Verhoeff algorithm validation (simplified)
    return verhoeffValidation(cleanAadhaar);
}

function verhoeffValidation(aadhaar) {
    // Simplified Verhoeff algorithm for demo
    // In real implementation, use complete Verhoeff algorithm
    const digits = aadhaar.split('').map(Number);
    let checksum = 0;
    
    for (let i = 0; i < digits.length - 1; i++) {
        checksum += digits[i] * (i + 1);
    }
    
    return (checksum % 10) === digits[digits.length - 1] || validAadhaarNumbers.hasOwnProperty(aadhaar);
}

function formatAadhaarInput(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 12) value = value.substr(0, 12);
    
    // Format as XXXX XXXX XXXX
    if (value.length > 8) {
        value = value.substr(0, 4) + ' ' + value.substr(4, 4) + ' ' + value.substr(8);
    } else if (value.length > 4) {
        value = value.substr(0, 4) + ' ' + value.substr(4);
    }
    
    input.value = value;
}

function verifyAadhaar() {
    const aadhaarInput = document.getElementById('aadhaarNumber');
    const aadhaar = aadhaarInput.value.replace(/[\s-]/g, '');
    
    if (!validateAadhaarFormat(aadhaar)) {
        showAadhaarStatus('error', 'Invalid Aadhaar number format');
        return;
    }
    
    // Show verification in progress
    showAadhaarStatus('loading', 'Verifying with UIDAI...');
    
    setTimeout(() => {
        if (validAadhaarNumbers[aadhaar]) {
            // Mock successful verification
            aadhaarVerified = true;
            verifiedAadhaarData = validAadhaarNumbers[aadhaar];
            
            // Auto-fill form
            document.getElementById('aadharName').value = verifiedAadhaarData.name;
            document.getElementById('dateOfBirth').value = verifiedAadhaarData.dateOfBirth;
            document.getElementById('gender').value = verifiedAadhaarData.gender;
            document.getElementById('address').value = verifiedAadhaarData.address;
            
            // Store Aadhaar photo for face comparison
            aadhaarPhotoData = verifiedAadhaarData;
            
            // Make fields readonly
            document.getElementById('aadharName').readOnly = true;
            document.getElementById('dateOfBirth').readOnly = true;
            document.getElementById('gender').disabled = true;
            document.getElementById('address').readOnly = true;
            
            showAadhaarStatus('success', 'Aadhaar verified successfully');
            showAadhaarPhoto(verifiedAadhaarData.photo);
            addVerificationBadges();
            enableFaceCapture();
        } else {
            // Simulate random verification for other numbers
            if (Math.random() > 0.3) {
                showAadhaarStatus('error', 'Aadhaar verification failed. Please check your number.');
            } else {
                // Generate random data for demo
                const names = ['John Doe', 'Jane Smith', 'Ravi Kumar', 'Sunita Devi'];
                const randomData = {
                    name: names[Math.floor(Math.random() * names.length)],
                    dateOfBirth: '1990-01-01',
                    gender: Math.random() > 0.5 ? 'M' : 'F',
                    address: 'Sample Address, City, State - 123456'
                };
                
                aadhaarVerified = true;
                verifiedAadhaarData = randomData;
                
                document.getElementById('aadharName').value = randomData.name;
                document.getElementById('dateOfBirth').value = randomData.dateOfBirth;
                document.getElementById('gender').value = randomData.gender;
                document.getElementById('address').value = randomData.address;
                
                document.getElementById('aadharName').readOnly = true;
                document.getElementById('dateOfBirth').readOnly = true;
                document.getElementById('gender').disabled = true;
                document.getElementById('address').readOnly = true;
                
                // Store random photo for face comparison
                aadhaarPhotoData = { ...randomData, faceFeatures: 'random_features' };
                
                showAadhaarStatus('success', 'Aadhaar verified successfully');
                addVerificationBadges();
                enableFaceCapture();
            }
        }
    }, 2000);
}

function showAadhaarStatus(type, message) {
    let statusDiv = document.getElementById('aadhaarStatus');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'aadhaarStatus';
        statusDiv.className = 'aadhaar-status';
        document.getElementById('aadhaarNumber').parentNode.appendChild(statusDiv);
    }
    
    statusDiv.style.display = 'flex';
    statusDiv.className = `aadhaar-status ${type}`;
    
    if (type === 'success') {
        statusDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    } else if (type === 'error') {
        statusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    } else if (type === 'loading') {
        statusDiv.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${message}`;
    }
}

function addVerificationBadges() {
    const fields = ['aadharName', 'dateOfBirth', 'gender', 'address'];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.nextElementSibling?.classList.contains('verified-badge')) {
            const badge = document.createElement('div');
            badge.className = 'verified-badge';
            badge.innerHTML = '<i class="fas fa-shield-check"></i> Aadhaar Verified';
            badge.style.cssText = `
                color: #10b981;
                font-size: 12px;
                font-weight: 600;
                margin-top: 5px;
                display: flex;
                align-items: center;
                gap: 5px;
            `;
            field.parentNode.appendChild(badge);
            
            field.style.borderColor = '#10b981';
            field.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        }
    });
}

function sendRegOTP() {
    const aadhaar = document.getElementById('aadhaarNumber').value.replace(/[\s-]/g, '');
    const name = document.getElementById('aadharName').value;
    const dob = document.getElementById('dateOfBirth').value;
    const gender = document.getElementById('gender').value;
    const address = document.getElementById('address').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    
    if (!aadhaar) {
        alert('Please enter Aadhaar number');
        return;
    }
    
    if (!aadhaarVerified) {
        alert('Please verify your Aadhaar number first');
        return;
    }
    
    if (!faceVerificationPassed) {
        alert('Please complete face verification to match with Aadhaar photo');
        return;
    }
    
    if (!name || !dob || !gender || !address || !email || !phone) {
        alert('Please fill all required fields');
        return;
    }
    
    // Show OTP section
    document.getElementById('regOtpSection').style.display = 'block';
    document.getElementById('registerBtn').innerHTML = 'Complete Registration';
    document.getElementById('registerBtn').onclick = completeRegistration;
    
    alert('OTP sent to ' + email);
}

function completeRegistration() {
    const otp = document.getElementById('regOtpCode').value;
    if (!otp) {
        alert('Please enter OTP');
        return;
    }
    
    if (otp === '123456') {
        const registrationData = {
            aadhaarNumber: document.getElementById('aadhaarNumber').value,
            name: document.getElementById('aadharName').value,
            dateOfBirth: document.getElementById('dateOfBirth').value,
            gender: document.getElementById('gender').value,
            address: document.getElementById('address').value,
            email: document.getElementById('regEmail').value,
            phone: document.getElementById('regPhone').value,
            country: document.getElementById('country').value,
            state: document.getElementById('state').value,
            votingType: document.getElementById('votingType').value,
            aadhaarVerified: aadhaarVerified,
            faceVerified: faceVerificationPassed,
            capturedFaceData: capturedFaceData
        };
        
        console.log('Registration Data:', registrationData);
        alert('Registration successful with Aadhaar and Face verification!');
        showHomeScreen();
        resetRegistrationForm();
    } else {
        alert('Invalid OTP. Try 123456');
    }
}

function showAadhaarPhoto(photoUrl) {
    let photoDiv = document.getElementById('aadhaarPhoto');
    if (!photoDiv) {
        photoDiv = document.createElement('div');
        photoDiv.id = 'aadhaarPhoto';
        photoDiv.className = 'aadhaar-photo-section';
        document.getElementById('aadhaarNumber').parentNode.appendChild(photoDiv);
    }
    
    photoDiv.innerHTML = `
        <div class="aadhaar-photo-header">
            <h4><i class="fas fa-id-card"></i> Aadhaar Photo</h4>
            <p>This photo will be used for face verification</p>
        </div>
        <div class="aadhaar-photo-container">
            <img src="${photoUrl}" alt="Aadhaar Photo" class="aadhaar-photo">
            <div class="photo-verified-badge">
                <i class="fas fa-check-circle"></i> Verified
            </div>
        </div>
    `;
    photoDiv.style.display = 'block';
}

function enableFaceCapture() {
    const captureBtn = document.getElementById('captureFaceBtn');
    if (captureBtn) {
        captureBtn.disabled = false;
        captureBtn.innerHTML = '<i class="fas fa-camera"></i> Capture Face for Verification';
        captureBtn.style.background = '#3b82f6';
    }
}

function captureFaceForRegistration() {
    if (!aadhaarVerified) {
        alert('Please verify Aadhaar first');
        return;
    }
    
    const video = document.getElementById('regFaceVideo');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Start camera
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
            
            // Show capture instruction
            showFaceStatus('info', 'Position your face in the circle and click capture');
            
            // Enable capture after 2 seconds
            setTimeout(() => {
                const captureBtn = document.getElementById('captureFaceBtn');
                captureBtn.innerHTML = '<i class="fas fa-camera"></i> Click to Capture';
                captureBtn.onclick = () => performFaceCapture(video, canvas, ctx, stream);
            }, 2000);
        })
        .catch(err => {
            console.error('Camera access denied:', err);
            alert('Camera access is required for face verification');
        });
}

function performFaceCapture(video, canvas, ctx, stream) {
    // Capture frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    // Get image data
    capturedFaceData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Stop camera
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    
    // Show captured image
    showCapturedFace(capturedFaceData);
    
    // Start face verification
    verifyFaceMatch();
}

function showCapturedFace(imageData) {
    let capturedDiv = document.getElementById('capturedFace');
    if (!capturedDiv) {
        capturedDiv = document.createElement('div');
        capturedDiv.id = 'capturedFace';
        capturedDiv.className = 'captured-face-section';
        document.querySelector('.face-registration').appendChild(capturedDiv);
    }
    
    capturedDiv.innerHTML = `
        <div class="captured-face-header">
            <h4><i class="fas fa-user-check"></i> Captured Face</h4>
        </div>
        <div class="captured-face-container">
            <img src="${imageData}" alt="Captured Face" class="captured-face">
        </div>
    `;
    capturedDiv.style.display = 'block';
}

function verifyFaceMatch() {
    showFaceStatus('loading', 'Comparing with Aadhaar photo...');
    
    // Simulate face matching process
    setTimeout(() => {
        // Mock face verification logic
        const matchScore = simulateFaceMatching();
        
        if (matchScore > 0.75) {
            faceVerificationPassed = true;
            showFaceStatus('success', `Face verified! Match confidence: ${Math.round(matchScore * 100)}%`);
            addFaceVerificationBadge();
        } else {
            faceVerificationPassed = false;
            showFaceStatus('error', `Face verification failed. Match confidence: ${Math.round(matchScore * 100)}%. Please try again.`);
            
            // Reset capture button
            const captureBtn = document.getElementById('captureFaceBtn');
            captureBtn.innerHTML = '<i class="fas fa-camera"></i> Retry Face Capture';
            captureBtn.onclick = captureFaceForRegistration;
        }
    }, 3000);
}

function simulateFaceMatching() {
    if (!aadhaarPhotoData || !capturedFaceData) {
        return 0.3;
    }
    
    // For known Aadhaar numbers, simulate high match
    if (aadhaarPhotoData.faceFeatures && aadhaarPhotoData.faceFeatures.includes('features')) {
        return 0.85 + (Math.random() * 0.1); // 85-95% match
    }
    
    // For random data, simulate lower match with some chance of success
    return Math.random() > 0.4 ? 0.8 + (Math.random() * 0.15) : 0.4 + (Math.random() * 0.3);
}

function showFaceStatus(type, message) {
    let statusDiv = document.getElementById('faceStatus');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'faceStatus';
        statusDiv.className = 'face-status';
        document.querySelector('.face-registration').appendChild(statusDiv);
    }
    
    statusDiv.style.display = 'flex';
    statusDiv.className = `face-status ${type}`;
    
    if (type === 'success') {
        statusDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    } else if (type === 'error') {
        statusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    } else if (type === 'loading') {
        statusDiv.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${message}`;
    } else if (type === 'info') {
        statusDiv.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    }
}

function addFaceVerificationBadge() {
    const faceSection = document.querySelector('.face-registration');
    if (faceSection && !faceSection.querySelector('.face-verified-badge')) {
        const badge = document.createElement('div');
        badge.className = 'face-verified-badge';
        badge.innerHTML = '<i class="fas fa-user-shield"></i> Face Verified with Aadhaar';
        badge.style.cssText = `
            color: #10b981;
            font-size: 14px;
            font-weight: 600;
            margin-top: 15px;
            padding: 10px;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            animation: fadeIn 0.5s ease;
        `;
        faceSection.appendChild(badge);
    }
}

function resetRegistrationForm() {
    // Reset all form fields
    document.getElementById('aadhaarNumber').value = '';
    document.getElementById('aadharName').value = '';
    document.getElementById('dateOfBirth').value = '';
    document.getElementById('gender').value = '';
    document.getElementById('address').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPhone').value = '';
    document.getElementById('country').value = '';
    document.getElementById('state').value = '';
    document.getElementById('votingType').value = '';
    document.getElementById('regOtpCode').value = '';
    
    // Reset Aadhaar verification
    aadhaarVerified = false;
    verifiedAadhaarData = null;
    aadhaarPhotoData = null;
    capturedFaceData = null;
    faceVerificationPassed = false;
    
    // Reset field properties
    document.getElementById('aadharName').readOnly = false;
    document.getElementById('dateOfBirth').readOnly = false;
    document.getElementById('gender').disabled = false;
    document.getElementById('address').readOnly = false;
    
    // Reset field styles
    const fields = ['aadharName', 'dateOfBirth', 'gender', 'address'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = '';
            field.style.backgroundColor = '';
        }
    });
    
    // Remove verification elements
    document.querySelectorAll('.verified-badge').forEach(badge => badge.remove());
    document.querySelectorAll('.face-verified-badge').forEach(badge => badge.remove());
    
    const statusDivs = ['aadhaarStatus', 'faceStatus', 'aadhaarPhoto', 'capturedFace'];
    statusDivs.forEach(id => {
        const div = document.getElementById(id);
        if (div) {
            div.style.display = 'none';
        }
    });
    
    // Reset capture button
    const captureBtn = document.getElementById('captureFaceBtn');
    if (captureBtn) {
        captureBtn.disabled = true;
        captureBtn.innerHTML = '<i class="fas fa-camera"></i> Capture Face';
        captureBtn.onclick = captureFaceForRegistration;
        captureBtn.style.background = '';
    }
    
    document.getElementById('regOtpSection').style.display = 'none';
    
    // Reset register button
    document.getElementById('registerBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP to Verify';
    document.getElementById('registerBtn').onclick = sendRegOTP;
}

function selectCandidate(id) {
    document.querySelectorAll('.candidate-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    document.getElementById('submitVoteBtn').disabled = false;
}

function submitVote() {
    alert('Vote submitted successfully!');
    showDashboard();
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
    alert('Logged out successfully');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('App loaded successfully');
    
    // Add Aadhaar input formatting
    const aadhaarInput = document.getElementById('aadhaarNumber');
    if (aadhaarInput) {
        aadhaarInput.addEventListener('input', function() {
            formatAadhaarInput(this);
        });
        
        aadhaarInput.addEventListener('blur', function() {
            const aadhaar = this.value.replace(/[\s-]/g, '');
            if (aadhaar.length === 12) {
                verifyAadhaar();
            }
        });
    }
    
    // Disable face capture initially
    const captureBtn = document.getElementById('captureFaceBtn');
    if (captureBtn) {
        captureBtn.disabled = true;
        captureBtn.innerHTML = '<i class="fas fa-lock"></i> Verify Aadhaar First';
    }
});


document.head.appendChild(style);

// Add CSS styles for Aadhaar verification
const aadhaarStyles = document.createElement('style');
aadhaarStyles.textContent = `
    .aadhaar-status {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 10px;
        padding: 10px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    }
    
    .aadhaar-status.success {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #10b981;
    }
    
    .aadhaar-status.error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
    }
    
    .aadhaar-status.loading {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.3);
        color: #3b82f6;
    }
    
    .verified-badge {
        animation: fadeIn 0.5s ease;
    }
    
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    input[readonly], textarea[readonly], select[disabled] {
        background: rgba(16, 185, 129, 0.05) !important;
        border-color: #10b981 !important;
        cursor: not-allowed;
    }
    
    #aadhaarNumber {
        font-family: monospace;
        letter-spacing: 1px;
    }
    
    .aadhaar-photo-section {
        margin: 20px 0;
        padding: 20px;
        background: rgba(59, 130, 246, 0.05);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 12px;
        text-align: center;
    }
    
    .aadhaar-photo-header h4 {
        color: #3b82f6;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    .aadhaar-photo-header p {
        color: #6b7280;
        font-size: 12px;
        margin-bottom: 15px;
    }
    
    .aadhaar-photo-container {
        position: relative;
        display: inline-block;
    }
    
    .aadhaar-photo {
        width: 120px;
        height: 120px;
        border-radius: 8px;
        object-fit: cover;
        border: 3px solid #3b82f6;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    
    .photo-verified-badge {
        position: absolute;
        bottom: -5px;
        right: -5px;
        background: #10b981;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 3px;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
    }
    
    .captured-face-section {
        margin: 15px 0;
        padding: 15px;
        background: rgba(16, 185, 129, 0.05);
        border: 1px solid rgba(16, 185, 129, 0.2);
        border-radius: 12px;
        text-align: center;
    }
    
    .captured-face-header h4 {
        color: #10b981;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
    }
    
    .captured-face {
        width: 100px;
        height: 100px;
        border-radius: 8px;
        object-fit: cover;
        border: 2px solid #10b981;
        box-shadow: 0 3px 10px rgba(16, 185, 129, 0.3);
    }
    
    .face-status {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 15px;
        padding: 12px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    }
    
    .face-status.success {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #10b981;
    }
    
    .face-status.error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
    }
    
    .face-status.loading {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.3);
        color: #3b82f6;
    }
    
    .face-status.info {
        background: rgba(107, 114, 128, 0.1);
        border: 1px solid rgba(107, 114, 128, 0.3);
        color: #6b7280;
    }
    
    #captureFaceBtn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #9ca3af !important;
    }
    
    .aadhaar-photo-section {
        margin: 20px 0;
        padding: 20px;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 12px;
    }
    
    .photo-upload-options {
        display: flex;
        gap: 10px;
        margin: 15px 0;
    }
    
    .photo-upload-options .btn-secondary {
        flex: 1;
        padding: 12px;
        font-size: 14px;
    }
    
    .section-header h4 {
        color: #1f2937 !important;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 5px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .section-header p {
        color: #6b7280 !important;
        font-size: 14px;
        margin-bottom: 15px;
    }
    
    #aadhaarPhotoPreview, #facePhotoPreview {
        text-align: center;
        margin: 15px 0;
        padding: 15px;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 8px;
    }
    
    #aadhaarPhotoPreview p, #facePhotoPreview p {
        color: #10b981 !important;
        font-weight: 600;
        margin: 10px 0 0 0;
    }
    
    .aadhaar-verification-section {
        margin: 20px 0;
        padding: 20px;
        background: rgba(59, 130, 246, 0.05);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 12px;
        text-align: center;
    }
    
    .aadhaar-verification-section .section-header h4 {
        color: #3b82f6;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    .aadhaar-verification-section .section-header p {
        color: #6b7280;
        font-size: 12px;
        margin-bottom: 15px;
    }
    
    .captured-aadhaar-section {
        margin: 15px 0;
        padding: 15px;
        background: rgba(16, 185, 129, 0.05);
        border: 1px solid rgba(16, 185, 129, 0.2);
        border-radius: 12px;
        text-align: center;
    }
    
    .captured-aadhaar {
        width: 200px;
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        border: 2px solid #10b981;
        box-shadow: 0 3px 10px rgba(16, 185, 129, 0.3);
    }
`;
document.head.appendChild(aadhaarStyles);
// Photo capture variables
let aadhaarPhotoData = null;
let facePhotoData = null;

function handleAadhaarPhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            aadhaarPhotoData = e.target.result;
            showAadhaarPhotoPreview(aadhaarPhotoData);
        };
        reader.readAsDataURL(file);
    }
}

function showAadhaarPhotoPreview(imageData) {
    const preview = document.getElementById('aadhaarPhotoPreview');
    const img = document.getElementById('aadhaarPreviewImg');
    img.src = imageData;
    preview.style.display = 'block';
}

function captureAadhaarPhoto() {
    const captureDiv = document.getElementById('aadhaarCaptureDiv');
    const video = document.getElementById('aadhaarVideo');
    const takePhotoBtn = document.getElementById('takeAadhaarPhoto');
    
    captureDiv.style.display = 'block';
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            video.srcObject = stream;
            video.play();
            takePhotoBtn.style.display = 'block';
        })
        .catch(err => {
            alert('Camera access is required for Aadhaar photo capture');
        });
}

function takeAadhaarPhoto() {
    const video = document.getElementById('aadhaarVideo');
    const canvas = document.getElementById('aadhaarCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    aadhaarPhotoData = canvas.toDataURL('image/jpeg', 0.8);
    
    const stream = video.srcObject;
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    
    document.getElementById('aadhaarCaptureDiv').style.display = 'none';
    showAadhaarPhotoPreview(aadhaarPhotoData);
}

function captureFaceForRegistration() {
    const video = document.getElementById('regFaceVideo');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
            
            setTimeout(() => {
                const captureBtn = document.getElementById('captureFaceBtn');
                captureBtn.innerHTML = '<i class="fas fa-camera"></i> Click to Capture Face';
                captureBtn.onclick = () => performFaceCapture(video, canvas, ctx, stream);
            }, 2000);
        })
        .catch(err => {
            alert('Camera access is required for face capture');
        });
}

function performFaceCapture(video, canvas, ctx, stream) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    facePhotoData = canvas.toDataURL('image/jpeg', 0.8);
    
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    
    showFacePhotoPreview(facePhotoData);
    
    const captureBtn = document.getElementById('captureFaceBtn');
    captureBtn.innerHTML = '<i class="fas fa-camera"></i> Retake Face Photo';
    captureBtn.onclick = captureFaceForRegistration;
}

function showFacePhotoPreview(imageData) {
    const preview = document.getElementById('facePhotoPreview');
    const img = document.getElementById('facePreviewImg');
    img.src = imageData;
    preview.style.display = 'block';
}
// Updated registration functions with voter ID
function sendRegOTP() {
    const name = document.getElementById('aadharName').value;
    const aadhaar = document.getElementById('aadhaarNumber').value.replace(/[\s-]/g, '');
    const dob = document.getElementById('dateOfBirth').value;
    const gender = document.getElementById('gender').value;
    const address = document.getElementById('address').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const voterIdNumber = document.getElementById('voterIdNumber').value;
    
    if (!name || !aadhaar || !dob || !gender || !address || !email || !phone || !voterIdNumber) {
        alert('Please fill all required fields');
        return;
    }
    
    if (!aadhaarPhotoData) {
        alert('Please upload or capture your Aadhaar card photo');
        return;
    }
    
    if (!facePhotoData) {
        alert('Please capture your face photo');
        return;
    }
    
    document.getElementById('regOtpSection').style.display = 'block';
    document.getElementById('registerBtn').innerHTML = 'Complete Registration';
    document.getElementById('registerBtn').onclick = completeRegistration;
    
    alert('OTP sent to ' + email);
}

function completeRegistration() {
    const otp = document.getElementById('regOtpCode').value;
    if (!otp) {
        alert('Please enter OTP');
        return;
    }
    
    if (otp === '123456') {
        const registrationData = {
            name: document.getElementById('aadharName').value,
            aadhaarNumber: document.getElementById('aadhaarNumber').value,
            dateOfBirth: document.getElementById('dateOfBirth').value,
            gender: document.getElementById('gender').value,
            address: document.getElementById('address').value,
            email: document.getElementById('regEmail').value,
            phone: document.getElementById('regPhone').value,
            voterIdNumber: document.getElementById('voterIdNumber').value,
            country: document.getElementById('country').value,
            state: document.getElementById('state').value,
            votingType: document.getElementById('votingType').value,
            aadhaarPhoto: aadhaarPhotoData,
            facePhoto: facePhotoData
        };
        
        console.log('Registration Data:', registrationData);
        alert('Registration successful with Voter ID and photos!');
        showHomeScreen();
        resetRegistrationForm();
    } else {
        alert('Invalid OTP. Try 123456');
    }
}

function resetRegistrationForm() {
    document.getElementById('aadharName').value = '';
    document.getElementById('aadhaarNumber').value = '';
    document.getElementById('dateOfBirth').value = '';
    document.getElementById('gender').value = '';
    document.getElementById('address').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPhone').value = '';
    document.getElementById('voterIdNumber').value = '';
    document.getElementById('country').value = '';
    document.getElementById('state').value = '';
    document.getElementById('votingType').value = '';
    document.getElementById('regOtpCode').value = '';
    
    aadhaarPhotoData = null;
    facePhotoData = null;
    
    document.getElementById('aadhaarPhotoPreview').style.display = 'none';
    document.getElementById('facePhotoPreview').style.display = 'none';
    document.getElementById('aadhaarCaptureDiv').style.display = 'none';
    
    document.getElementById('captureAadhaarBtn').innerHTML = '<i class="fas fa-camera"></i> Capture Aadhaar Photo';
    document.getElementById('captureFaceBtn').innerHTML = '<i class="fas fa-camera"></i> Start Face Capture';
    
    document.getElementById('regOtpSection').style.display = 'none';
    document.getElementById('registerBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP to Verify';
    document.getElementById('registerBtn').onclick = sendRegOTP;
}