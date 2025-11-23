const nodemailer = require('nodemailer');

// Test SMTP connection
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'securevote2024@gmail.com',
        pass: 'jxfx jrge kpgl koat'
    }
});

// Test email
async function testEmail() {
    try {
        console.log('Testing SMTP connection...');
        
        const info = await transporter.sendMail({
            from: 'securevote2024@gmail.com',
            to: 'securevote2024@gmail.com', // Send to self for testing
            subject: 'Test Email',
            text: 'This is a test email to verify SMTP setup.'
        });
        
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Email failed:', error.message);
        console.error('Error code:', error.code);
    }
}

testEmail();