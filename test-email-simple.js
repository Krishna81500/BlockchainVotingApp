require('dotenv').config();
const nodemailer = require('nodemailer');

// Test SMTP configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function testEmail() {
    console.log('Testing email configuration...');
    console.log('Email User:', process.env.EMAIL_USER);
    console.log('Email Pass:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
    
    try {
        // Verify connection
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        
        // Send test email
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self for testing
            subject: 'Test Email - SecureVote',
            text: 'This is a test email from SecureVote app. If you receive this, email is working!'
        });
        
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        
    } catch (error) {
        console.error('❌ Email test failed:');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
    }
}

testEmail();