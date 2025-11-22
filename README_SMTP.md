# SMTP Gateway for OTP Email Authentication

This implementation adds email-based OTP authentication to the SecureVote blockchain voting app using an SMTP gateway.

## Features

- 📧 **Email OTP Authentication** - Secure OTP delivery via email
- ⏰ **5-minute OTP Expiry** - Time-limited OTPs for security
- 🔄 **Resend Functionality** - Users can request new OTPs
- 🎨 **Beautiful Email Templates** - Professional HTML email design
- 🔒 **Rate Limiting** - Maximum 3 attempts per OTP
- 📱 **Real-time Timer** - Live countdown display

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure SMTP Settings
1. Copy `.env.example` to `.env`
2. Update with your email credentials:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Gmail App Password Setup
1. Enable 2-Factor Authentication on your Google Account
2. Go to Google Account Settings > Security > App passwords
3. Generate an app password for "Mail"
4. Use this password in your `.env` file

### 4. Start the Server
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Send OTP
```http
POST /api/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "purpose": "login",
  "voterId": "V001"
}
```

### Verify OTP
```http
POST /api/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Get OTP Status
```http
GET /api/otp-status/user@example.com
```

## Email Template Features

- **Responsive Design** - Works on all devices
- **Branded Styling** - SecureVote theme with gold accents
- **Security Warnings** - Clear instructions about OTP security
- **Expiry Information** - Prominent 5-minute timer display
- **Professional Layout** - Clean, modern design

## Security Features

- **Time-based Expiry** - OTPs expire after 5 minutes
- **Attempt Limiting** - Maximum 3 verification attempts
- **Secure Storage** - OTPs stored temporarily in memory
- **Email Masking** - Email addresses partially hidden in UI
- **Input Validation** - Email format validation

## Frontend Integration

The frontend automatically:
- Validates email addresses
- Shows real-time countdown timers
- Handles OTP resend functionality
- Displays masked email addresses
- Provides user-friendly error messages

## Production Considerations

1. **Database Storage** - Replace in-memory storage with database
2. **Email Service** - Consider using services like SendGrid or AWS SES
3. **Rate Limiting** - Implement IP-based rate limiting
4. **Logging** - Add comprehensive logging for security monitoring
5. **SSL/TLS** - Ensure HTTPS in production

## Troubleshooting

### Common Issues

1. **Gmail Authentication Error**
   - Ensure 2FA is enabled
   - Use App Password, not regular password
   - Check Gmail security settings

2. **OTP Not Received**
   - Check spam/junk folder
   - Verify email address is correct
   - Check server logs for SMTP errors

3. **Timer Not Working**
   - Ensure server is running
   - Check browser console for errors
   - Verify API endpoints are accessible

## File Structure

```
├── server.js           # Main SMTP server
├── emailAuth.js        # Frontend email authentication
├── app.js             # Updated app with email OTP
├── .env.example       # Environment variables template
└── README_SMTP.md     # This documentation
```

## Email Template Preview

The OTP emails include:
- SecureVote branding
- Large, prominent OTP code
- 5-minute expiry warning
- Security instructions
- Professional styling with gradients

## Support

For issues or questions about the SMTP implementation, check:
1. Server console logs
2. Browser developer tools
3. Email service provider documentation
4. Gmail App Password setup guide