# SecureVote - Blockchain Voting System

A comprehensive blockchain-based voting system with real OTP authentication, biometric verification, and admin panel.

## 🚀 Features

### Voting App (`/votingapp`)
- **Real OTP Authentication** - Email-based OTP verification
- **Camera Integration** - Aadhaar card and face photo capture
- **Biometric Verification** - Face matching for secure voting
- **Blockchain Integration** - Immutable vote recording
- **Multi-language Support** - English, Hindi, Kannada
- **Mobile-responsive Design** - Optimized for all devices

### Admin Panel (`/admin`)
- **Voter Management** - View, edit, delete registered voters
- **Candidate Management** - Add, edit, remove candidates
- **Election Control** - Start, pause, end elections
- **Live Results** - Real-time vote counting and analytics
- **Blockchain Monitor** - Network status and block explorer
- **Data Export** - CSV export for voters and results

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Gmail account for OTP emails
- Modern web browser with camera support

### Installation

1. **Clone or Download the Project**
   ```bash
   cd BlockchainVotingApp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Update the `.env` file with your Gmail credentials:
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password
   PORT=3003
   ```

   **Important:** Use Gmail App Password, not your regular password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"

4. **Start the Server**
   ```bash
   npm start
   ```

5. **Access the Applications**
   - **Main Page:** http://localhost:3003
   - **Voting App:** http://localhost:3003/votingapp
   - **Admin Panel:** http://localhost:3003/admin

## 📱 How to Use

### For Voters

1. **Registration**
   - Go to `/votingapp`
   - Click "Register as New Voter"
   - Fill in personal details
   - Capture Aadhaar card photo using camera
   - Capture face photo for biometric verification
   - Verify email with OTP

2. **Login & Voting**
   - Enter email address
   - Verify with OTP sent to email
   - Select candidate
   - Complete face verification
   - Submit vote to blockchain

### For Administrators

1. **Access Admin Panel**
   - Go to `/admin`
   - Navigate through different sections

2. **Manage Voters**
   - View all registered voters
   - Export voter data
   - Search and filter voters

3. **Manage Candidates**
   - Add new candidates
   - Edit candidate information
   - View vote counts

4. **Monitor Elections**
   - Start/pause/end elections
   - View live results
   - Monitor blockchain activity

## 🔧 Technical Details

### Architecture
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Node.js, Express.js
- **Email Service:** Nodemailer with Gmail SMTP
- **Storage:** LocalStorage (demo), easily upgradeable to database
- **Camera API:** WebRTC getUserMedia API

### Security Features
- **OTP Expiration:** 2-minute timeout
- **Email Verification:** Real SMTP integration
- **Biometric Verification:** Face photo capture and comparison
- **Blockchain Simulation:** Immutable vote recording
- **Data Validation:** Input sanitization and validation

### API Endpoints
- `POST /api/send-otp` - Send OTP to email
- `POST /api/verify-otp` - Verify OTP code
- `GET /api/health` - Server health check

## 🌐 Deployment

### Local Development
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Production Deployment
1. Set environment variables on your hosting platform
2. Install dependencies: `npm install --production`
3. Start server: `npm start`

### Recommended Hosting
- **Heroku:** Easy deployment with environment variables
- **Vercel:** Serverless deployment
- **DigitalOcean:** VPS hosting
- **AWS EC2:** Scalable cloud hosting

## 📊 Demo Data

The system includes sample data for testing:

### Test Candidates
- Alice Johnson (Democratic Party)
- Robert Smith (Republican Party)  
- Maria Garcia (Independent)

### Sample Workflow
1. Register with any email address
2. Use real OTP sent to your email
3. Capture photos using your device camera
4. Vote for any candidate
5. View results in admin panel

## 🔒 Security Considerations

### Production Recommendations
- Use HTTPS for all communications
- Implement rate limiting for OTP requests
- Add CAPTCHA for bot prevention
- Use proper database with encryption
- Implement JWT tokens for session management
- Add audit logging for all actions

### Privacy Features
- Photos stored locally (can be encrypted)
- Email addresses hashed in production
- Blockchain ensures vote anonymity
- No personal data in vote records

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - feel free to use for educational and commercial purposes.

## 🆘 Support

For issues and questions:
- Check the console for error messages
- Ensure camera permissions are granted
- Verify email credentials in `.env`
- Test with different browsers if needed

## 🔮 Future Enhancements

- Real blockchain integration (Ethereum, Hyperledger)
- Advanced biometric verification (fingerprint, iris)
- Mobile app development
- Multi-factor authentication
- Advanced analytics and reporting
- Integration with government ID systems
- Scalable database architecture
- Real-time notifications

---

**SecureVote** - Making democracy more secure, transparent, and accessible through blockchain technology.