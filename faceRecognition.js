// Face Recognition and OTP Authentication System
class FaceRecognitionAuth {
    constructor() {
        this.faceData = new Map(); // Store face templates
        this.otpData = new Map(); // Store OTP data
        this.currentStream = null;
        this.faceDetected = false;
        this.init();
    }

    init() {
        this.loadStoredFaceData();
        this.setupFaceRecognition();
    }

    // Load stored face data (simulated)
    loadStoredFaceData() {
        // Simulate stored face templates for registered voters
        this.faceData.set('V001', {
            template: 'face_template_v001_hash',
            name: 'John Doe',
            phone: '+919876543210',
            email: 'your-test-email@gmail.com'
        });
        
        this.faceData.set('V002', {
            template: 'face_template_v002_hash',
            name: 'Jane Smith',
            phone: '+919876543211',
            email: 'your-test-email@gmail.com'
        });
        
        this.faceData.set('V003', {
            template: 'face_template_v003_hash',
            name: 'Mike Johnson',
            phone: '+919876543212',
            email: 'your-test-email@gmail.com'
        });
    }

    // Setup face recognition
    async setupFaceRecognition() {
        try {
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn('Camera access not supported');
                return;
            }
        } catch (error) {
            console.error('Face recognition setup error:', error);
        }
    }

    // Start camera for face recognition
    async startCamera(videoElement) {
        try {
            if (this.currentStream) {
                this.stopCamera();
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            videoElement.srcObject = stream;
            this.currentStream = stream;
            
            // Start face detection
            this.startFaceDetection(videoElement);
            
            return true;
        } catch (error) {
            console.error('Camera access error:', error);
            this.showFaceStatus('Camera access denied or not available', 'error');
            return false;
        }
    }

    // Stop camera
    stopCamera() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
    }

    // Simulate face detection
    startFaceDetection(videoElement) {
        const detectionInterval = setInterval(() => {
            if (!this.currentStream) {
                clearInterval(detectionInterval);
                return;
            }

            // Simulate face detection (in real app, use face-api.js or similar)
            const faceDetected = Math.random() > 0.3; // 70% chance of detection
            
            if (faceDetected && !this.faceDetected) {
                this.faceDetected = true;
                this.showFaceStatus('Face detected', 'success');
                
                // Enable relevant buttons
                this.enableFaceButtons();
            } else if (!faceDetected && this.faceDetected) {
                this.faceDetected = false;
                this.showFaceStatus('Position your face in the circle', 'scanning');
                this.disableFaceButtons();
            }
        }, 1000);
    }

    // Show face recognition status
    showFaceStatus(message, type) {
        // Remove existing status
        const existingStatus = document.querySelector('.face-status');
        if (existingStatus) {
            existingStatus.remove();
        }

        // Create new status
        const status = document.createElement('div');
        status.className = `face-status ${type}`;
        status.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-search'}"></i>
            <span>${message}</span>
        `;

        // Insert after face scanner
        const faceScanner = document.querySelector('.face-scanner, .mini-face-scanner, .reg-face-scanner');
        if (faceScanner && faceScanner.parentNode) {
            faceScanner.parentNode.insertBefore(status, faceScanner.nextSibling);
        }
    }

    // Enable face-related buttons
    enableFaceButtons() {
        const buttons = ['startFaceBtn', 'verifyFaceBtn', 'captureFaceBtn'];
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        });
        
        // Auto-enable capture button for demo
        setTimeout(() => {
            const captureBtn = document.getElementById('captureFaceBtn');
            if (captureBtn) {
                captureBtn.disabled = false;
                captureBtn.style.opacity = '1';
            }
        }, 1000);
    }

    // Disable face-related buttons
    disableFaceButtons() {
        const buttons = ['verifyFaceBtn', 'captureFaceBtn'];
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.disabled = true;
                btn.style.opacity = '0.6';
            }
        });
    }

    // Capture face template (simulated)
    captureFaceTemplate(videoElement) {
        // Always allow capture for demo purposes
        try {
            // Simulate face template extraction
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 320;
            canvas.height = 240;
            
            if (videoElement && videoElement.videoWidth > 0) {
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            }
            
            // Generate simulated face template hash
            const template = this.generateFaceTemplate();
            
            this.showFaceStatus('Face captured successfully!', 'success');
            return template;
        } catch (error) {
            console.error('Face capture error:', error);
            // Still return a template for demo
            const template = this.generateFaceTemplate();
            this.showFaceStatus('Face captured successfully!', 'success');
            return template;
        }
    }

    // Generate face template (simulated)
    generateFaceTemplate(imageData = null) {
        // Simulate face template generation
        const randomHash = Math.floor(Math.random() * 1000000);
        return `face_template_${randomHash}_${Date.now()}`;
    }

    // Verify face against stored template
    verifyFace(voterId, capturedTemplate) {
        const storedData = this.faceData.get(voterId);
        
        if (!storedData) {
            return { success: false, message: 'No face template found for this voter ID' };
        }

        // Simulate face matching (in real app, use proper face matching algorithms)
        const matchScore = Math.random();
        const threshold = 0.7;
        
        if (matchScore > threshold) {
            return { 
                success: true, 
                message: 'Face verification successful',
                confidence: Math.round(matchScore * 100)
            };
        } else {
            return { 
                success: false, 
                message: 'Face verification failed. Please try again.',
                confidence: Math.round(matchScore * 100)
            };
        }
    }

    // Generate OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP (simulated)
    async sendOTP(phoneNumber, voterId) {
        const otp = this.generateOTP();
        const expiryTime = Date.now() + (2 * 60 * 1000); // 2 minutes
        
        // Store OTP data
        this.otpData.set(phoneNumber, {
            otp: otp,
            voterId: voterId,
            expiryTime: expiryTime,
            attempts: 0
        });

        // Simulate SMS sending delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In real app, integrate with SMS service
        console.log(`OTP sent to ${phoneNumber}: ${otp}`);
        
        // Show OTP for demo purposes (remove in production)
        this.displayDemoOTP(otp, phoneNumber);
        
        return { success: true, message: 'OTP sent successfully' };
    }

    // Verify OTP
    verifyOTP(phoneNumber, enteredOTP) {
        const otpData = this.otpData.get(phoneNumber);
        
        if (!otpData) {
            return { success: false, message: 'No OTP found for this number' };
        }

        if (Date.now() > otpData.expiryTime) {
            this.otpData.delete(phoneNumber);
            return { success: false, message: 'OTP has expired' };
        }

        if (otpData.attempts >= 3) {
            this.otpData.delete(phoneNumber);
            return { success: false, message: 'Too many failed attempts' };
        }

        if (otpData.otp === enteredOTP) {
            this.otpData.delete(phoneNumber);
            return { 
                success: true, 
                message: 'OTP verified successfully',
                voterId: otpData.voterId
            };
        } else {
            otpData.attempts++;
            return { 
                success: false, 
                message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining`
            };
        }
    }

    // Register new voter with face template
    registerVoter(voterData, faceTemplate) {
        // Generate new voter ID
        const newVoterId = `V${String(this.faceData.size + 1).padStart(3, '0')}`;
        
        // Store face template and voter data
        this.faceData.set(newVoterId, {
            template: faceTemplate,
            name: voterData.aadharName,
            address: voterData.address,
            phone: voterData.phone,
            email: voterData.email,
            password: voterData.password, // In production, hash this
            country: voterData.country,
            state: voterData.state,
            votingType: voterData.votingType,
            registrationDate: new Date().toISOString()
        });

        // Add to blockchain's voter registry
        blockchain.registerNewVoter(newVoterId, {
            fullName: voterData.aadharName,
            address: voterData.address,
            phoneNumber: voterData.phone,
            email: voterData.email,
            country: voterData.country,
            state: voterData.state,
            votingType: voterData.votingType
        });
        
        return {
            success: true,
            voterId: newVoterId,
            message: 'Voter registered successfully'
        };
    }

    // Get OTP timer remaining time
    getOTPTimeRemaining(phoneNumber) {
        const otpData = this.otpData.get(phoneNumber);
        if (!otpData) return 0;
        
        const remaining = Math.max(0, otpData.expiryTime - Date.now());
        return Math.ceil(remaining / 1000);
    }

    // Display demo OTP (for testing only)
    displayDemoOTP(otp, phoneNumber) {
        // Create OTP display element
        const otpDisplay = document.createElement('div');
        otpDisplay.id = 'demoOtpDisplay';
        otpDisplay.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 20px;
            border-radius: 15px;
            z-index: 4000;
            text-align: center;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
            border: 2px solid #34d399;
            min-width: 280px;
        `;
        
        otpDisplay.innerHTML = `
            <div style="margin-bottom: 10px;">
                <i class="fas fa-sms" style="font-size: 24px; margin-bottom: 10px;"></i>
                <h3 style="margin: 0; font-size: 18px;">Demo OTP</h3>
            </div>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 15px 0;">
                ${otp}
            </div>
            <div style="font-size: 12px; opacity: 0.9; margin-bottom: 15px;">
                Sent to: ${phoneNumber.replace(/\d(?=\d{4})/g, '*')}
            </div>
            <button onclick="document.getElementById('demoOtpDisplay').remove()" 
                    style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); 
                           color: white; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 12px;">
                Close
            </button>
        `;
        
        // Remove existing OTP display
        const existing = document.getElementById('demoOtpDisplay');
        if (existing) {
            existing.remove();
        }
        
        document.body.appendChild(otpDisplay);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (document.getElementById('demoOtpDisplay')) {
                otpDisplay.remove();
            }
        }, 30000);
    }

    // Check if voter is registered
    isVoterRegistered(voterId) {
        return this.faceData.has(voterId);
    }

    // Get voter phone number
    getVoterPhone(voterId) {
        const voterData = this.faceData.get(voterId);
        return voterData ? voterData.phone : null;
    }

    // Get voter email
    getVoterEmail(voterId) {
        const voterData = this.faceData.get(voterId);
        return voterData ? voterData.email : null;
    }
}

// Initialize face recognition system
const faceAuth = new FaceRecognitionAuth();

// Export for use in other files
window.faceAuth = faceAuth;