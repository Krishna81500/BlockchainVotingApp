// Email OTP Authentication Module
class EmailAuth {
    constructor() {
        this.baseURL = 'http://localhost:3003/api';
        this.otpTimers = new Map();
    }

    // Send OTP to email
    async sendOTP(email, purpose = 'login', voterId = null) {
        try {
            const response = await fetch(`${this.baseURL}/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    purpose,
                    voterId
                })
            });

            const result = await response.json();
            
            if (result.success) {
                // Start timer for this email
                this.startOTPTimer(email, result.expiryTime);
                
                // Show preview URL for test emails
                if (result.previewUrl) {
                    console.log('📧 Email preview:', result.previewUrl);
                    // You can open this URL to see the email
                }
            }

            return result;
        } catch (error) {
            console.error('Send OTP error:', error);
            return {
                success: false,
                message: 'Network error. Please check your connection.'
            };
        }
    }

    // Verify OTP
    async verifyOTP(email, otp) {
        try {
            const response = await fetch(`${this.baseURL}/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    otp
                })
            });

            const result = await response.json();
            
            if (result.success) {
                // Clear timer for this email
                this.clearOTPTimer(email);
            }

            return result;
        } catch (error) {
            console.error('Verify OTP error:', error);
            return {
                success: false,
                message: 'Network error. Please check your connection.'
            };
        }
    }

    // Get OTP status
    async getOTPStatus(email) {
        try {
            const response = await fetch(`${this.baseURL}/otp-status/${encodeURIComponent(email)}`);
            return await response.json();
        } catch (error) {
            console.error('Get OTP status error:', error);
            return {
                exists: false,
                timeRemaining: 0
            };
        }
    }

    // Start OTP timer
    startOTPTimer(email, expiryTime) {
        // Clear existing timer if any
        this.clearOTPTimer(email);

        const timer = setInterval(async () => {
            const status = await this.getOTPStatus(email);
            
            if (!status.exists || status.timeRemaining <= 0) {
                this.clearOTPTimer(email);
                // Trigger expiry callback if set
                if (this.onOTPExpired) {
                    this.onOTPExpired(email);
                }
            }
        }, 1000);

        this.otpTimers.set(email, timer);
    }

    // Clear OTP timer
    clearOTPTimer(email) {
        const timer = this.otpTimers.get(email);
        if (timer) {
            clearInterval(timer);
            this.otpTimers.delete(email);
        }
    }

    // Get remaining time for OTP
    async getTimeRemaining(email) {
        const status = await this.getOTPStatus(email);
        return status.timeRemaining || 0;
    }

    // Format time remaining as MM:SS
    formatTimeRemaining(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Set callback for OTP expiry
    setOTPExpiredCallback(callback) {
        this.onOTPExpired = callback;
    }
}

// Create global instance
const emailAuth = new EmailAuth();