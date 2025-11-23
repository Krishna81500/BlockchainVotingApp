const nodemailer = require('nodemailer');

// Simple OTP system
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'securevote2024@gmail.com',
        pass: 'jxfx jrge kpgl koat'
    }
});

// Generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP
async function sendOTP(email) {
    const otp = generateOTP();
    
    try {
        await transporter.sendMail({
            from: 'securevote2024@gmail.com',
            to: email,
            subject: 'SecureVote - Your OTP',
            html: `
                <h2>SecureVote OTP</h2>
                <p>Your OTP code is: <strong>${otp}</strong></p>
                <p>This code expires in 5 minutes.</p>
            `
        });
        
        console.log(`✅ OTP sent to ${email}: ${otp}`);
        return { success: true, otp };
    } catch (error) {
        console.error('❌ Failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Test with your email
const testEmail = 'securevote2024@gmail.com'; // Test email
sendOTP(testEmail);