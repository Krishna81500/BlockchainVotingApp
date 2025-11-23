// Test OTP Email Configuration
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConfig() {
    console.log('🔧 Testing Email Configuration...\n');
    
    // Check environment variables
    console.log('📧 Email User:', process.env.EMAIL_USER);
    console.log('🔑 Email Pass:', process.env.EMAIL_PASS ? '***configured***' : '❌ NOT SET');
    console.log('🚪 Port:', process.env.PORT || 3003);
    console.log('');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('❌ Email credentials not configured in .env file');
        console.log('');
        console.log('📝 To fix this:');
        console.log('1. Go to Google Account Settings');
        console.log('2. Security → 2-Step Verification → App passwords');
        console.log('3. Generate app password for "Mail"');
        console.log('4. Update .env file with your Gmail and app password');
        return;
    }
    
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        console.log('🔄 Testing SMTP connection...');
        
        // Verify connection
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        
        // Send test email
        console.log('📤 Sending test OTP email...');
        
        const testOTP = '123456';
        const testEmail = process.env.EMAIL_USER; // Send to self for testing
        
        const mailOptions = {
            from: `"SecureVote Test" <${process.env.EMAIL_USER}>`,
            to: testEmail,
            subject: 'SecureVote OTP Test',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>🗳️ SecureVote OTP Test</h2>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                        <h1 style="color: #667eea; font-size: 36px; margin: 0;">${testOTP}</h1>
                    </div>
                    <p>✅ Email configuration is working correctly!</p>
                    <p><small>This is a test email from your SecureVote system.</small></p>
                </div>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully!');
        console.log(`📧 Check your inbox: ${testEmail}`);
        console.log('');
        console.log('🎉 OTP system is working correctly!');
        
    } catch (error) {
        console.log('❌ Email configuration failed:');
        console.log('Error:', error.message);
        console.log('');
        console.log('🔧 Common fixes:');
        console.log('1. Enable 2-Step Verification in Google Account');
        console.log('2. Generate App Password (not regular password)');
        console.log('3. Use App Password in EMAIL_PASS');
        console.log('4. Check if Gmail account allows less secure apps');
    }
}

// Run test
testEmailConfig();