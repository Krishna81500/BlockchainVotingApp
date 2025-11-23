const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve voting app
app.use('/votingapp', express.static(path.join(__dirname, 'votingapp')));

// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
    try {
        const { email, type } = req.body;
        
        if (!email || !type) {
            return res.status(400).json({ error: 'Email and type are required' });
        }
        
        const otp = generateOTP();
        const expiryTime = Date.now() + 2 * 60 * 1000; // 2 minutes
        
        // Store OTP with expiry
        otpStore.set(email, { otp, expiryTime, type });
        
        // Email content based on type
        const subject = type === 'login' ? 'SecureVote Login OTP' : 'SecureVote Registration OTP';
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">🗳️ SecureVote</h1>
                    <p style="color: white; margin: 10px 0 0 0;">Blockchain Voting System</p>
                </div>
                
                <div style="background: white; padding: 30px; border: 1px solid #e9ecef; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-bottom: 20px;">Your OTP Code</h2>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6;">
                        Use this OTP to ${type === 'login' ? 'login to' : 'complete your registration with'} SecureVote. 
                        This code will expire in <strong>2 minutes</strong>.
                    </p>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; color: #856404;">
                            <strong>Security Notice:</strong> Never share this OTP with anyone. SecureVote will never ask for your OTP via phone or email.
                        </p>
                    </div>
                    
                    <p style="color: #999; font-size: 14px; margin-top: 30px;">
                        If you didn't request this OTP, please ignore this email.
                    </p>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                    <p>© 2024 SecureVote - Blockchain Voting System</p>
                </div>
            </div>
        `;
        
        // Send email
        await transporter.sendMail({
            from: `"SecureVote" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: htmlContent
        });
        
        console.log(`OTP sent to ${email}: ${otp}`);
        res.json({ success: true, message: 'OTP sent successfully' });
        
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// Verify OTP endpoint
app.post('/api/verify-otp', (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }
        
        const storedData = otpStore.get(email);
        
        if (!storedData) {
            return res.status(400).json({ error: 'OTP not found or expired' });
        }
        
        if (Date.now() > storedData.expiryTime) {
            otpStore.delete(email);
            return res.status(400).json({ error: 'OTP expired' });
        }
        
        if (storedData.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        
        // OTP verified successfully
        otpStore.delete(email);
        res.json({ success: true, message: 'OTP verified successfully' });
        
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/votingapp', (req, res) => {
    res.sendFile(path.join(__dirname, 'votingapp', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        otpStoreSize: otpStore.size 
    });
});

// Clean up expired OTPs every minute
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of otpStore.entries()) {
        if (now > data.expiryTime) {
            otpStore.delete(email);
        }
    }
}, 60000);

app.listen(PORT, () => {
    console.log(`🚀 SecureVote Server v2.0 - Real SMTP OTP running on http://localhost:${PORT}`);
    console.log(`📱 Voting App: http://localhost:${PORT}/votingapp`);
    console.log(`⚙️  Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`📧 Real OTP System: ACTIVE`);
});

module.exports = app;