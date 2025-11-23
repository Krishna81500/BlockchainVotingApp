const nodemailer = require('nodemailer');

const EMAIL_USER = 'securevote2024@gmail.com';
const EMAIL_PASS = 'jxfx jrge kpgl koat';

console.log('Email User:', EMAIL_USER);
console.log('Email Pass:', EMAIL_PASS ? 'Set' : 'Not set');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    debug: true,
    logger: true
});

async function testEmailWithDebug() {
    try {
        console.log('Testing SMTP connection...');
        
        // Test connection first
        await transporter.verify();
        console.log('✅ SMTP connection verified');
        
        // Send test email
        const info = await transporter.sendMail({
            from: EMAIL_USER,
            to: 'test@example.com',
            subject: 'Test OTP',
            text: 'Your OTP is: 123456'
        });
        
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        
    } catch (error) {
        console.error('❌ Email failed:');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error response:', error.response);
        console.error('Full error:', error);
    }
}

testEmailWithDebug();