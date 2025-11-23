# SecureVote - Blockchain Voting System

A secure, transparent, and immutable voting system built with blockchain technology and admin approval workflow.

## Features

- 🔐 **Multi-factor Authentication** (Email OTP + Face Recognition)
- ⛓️ **Blockchain-secured** vote storage
- 👨‍💼 **Admin Approval System** for user registrations
- 📱 **Mobile-first** responsive design
- 🌐 **Multi-language** support (English, Hindi, Kannada)
- 🔍 **Real-time** result verification

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/blockchain-voting-app.git
cd blockchain-voting-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.env` file:
```env
# SMTP Configuration for Email OTP
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=3003
```

### 4. Start Application
```bash
npm start
```

### 5. Access Applications
- **Mobile Voting App:** http://localhost:3003/
- **Admin Panel:** http://localhost:3003/admin

## How It Works

### User Registration Flow
1. User fills registration form with Aadhar details
2. Face capture for biometric verification
3. Email OTP verification
4. Registration submitted with "Pending" status
5. Admin reviews and approves/rejects registration

### Login Flow
1. User enters email address
2. System checks registration status:
   - **Not Registered:** Redirected to registration
   - **Pending:** Wait for admin approval message
   - **Rejected:** Contact admin message
   - **Approved:** OTP sent for login
3. Email OTP verification
4. Access to voting dashboard

### Admin Panel
- View all user registrations
- Filter by status (All, Pending, Approved, Rejected)
- Approve or reject registrations
- Real-time statistics dashboard

## Technology Stack

- **Frontend:** Vanilla JavaScript, CSS3, HTML5
- **Backend:** Node.js, Express.js
- **Email:** Nodemailer with Gmail SMTP
- **Storage:** In-memory (upgrade to database for production)
- **Security:** OTP verification, Face recognition simulation

## API Endpoints

### User APIs
- `POST /api/send-otp` - Send OTP to email
- `POST /api/verify-otp` - Verify OTP code
- `POST /api/check-user` - Check user registration status
- `POST /api/complete-registration` - Complete user registration

### Admin APIs
- `GET /api/admin/registrations` - Get all registrations
- `GET /api/admin/stats` - Get registration statistics
- `POST /api/admin/approve/:id` - Approve registration
- `POST /api/admin/reject/:id` - Reject registration

## Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
1. Set environment variables
2. Use process manager like PM2
3. Configure reverse proxy (Nginx)
4. Enable HTTPS

## Security Features

- Email-based OTP authentication
- Face recognition for vote casting
- Admin approval for all registrations
- Blockchain vote immutability
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email team@securevote.com or create an issue on GitHub.

---

**SecureVote Team** - Building the future of secure digital democracy