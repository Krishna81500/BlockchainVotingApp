# 🚀 Deployment Guide - Real SMTP OTP System

## 📋 Current Status
✅ Code pushed to GitHub: https://github.com/Krishna81500/BlockchainVotingApp  
✅ Real SMTP OTP functionality implemented  
✅ Server-side email API ready  

## 🌐 Deployment Options

### Option 1: Heroku (Recommended for Full Features)
```bash
# 1. Install Heroku CLI
# 2. Login to Heroku
heroku login

# 3. Create Heroku app
heroku create securevote-blockchain

# 4. Set environment variables
heroku config:set EMAIL_USER=securevote2024@gmail.com
heroku config:set EMAIL_PASS=jxfx_jrge_kpgl_koat
heroku config:set PORT=3003

# 5. Deploy
git push heroku master
```

**Live URLs:**
- Main App: `https://securevote-blockchain.herokuapp.com`
- Voting App: `https://securevote-blockchain.herokuapp.com/votingapp`
- Admin Panel: `https://securevote-blockchain.herokuapp.com/admin`

### Option 2: Vercel (Serverless)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Set environment variables in Vercel dashboard
```

### Option 3: Railway
```bash
# 1. Connect GitHub repo to Railway
# 2. Set environment variables
# 3. Auto-deploy from GitHub
```

### Option 4: DigitalOcean App Platform
```bash
# 1. Connect GitHub repository
# 2. Configure environment variables
# 3. Deploy with auto-scaling
```

## 🔧 Environment Variables Required
```env
EMAIL_USER=securevote2024@gmail.com
EMAIL_PASS=jxfx_jrge_kpgl_koat
PORT=3003
```

## 📱 Local Development
```bash
# 1. Clone repository
git clone https://github.com/Krishna81500/BlockchainVotingApp.git

# 2. Install dependencies
npm install

# 3. Start server
npm start

# 4. Access applications
# Voting App: http://localhost:3003/votingapp
# Admin Panel: http://localhost:3003/admin
```

## ✅ Features Working After Deployment
- ✅ Real SMTP OTP via Gmail
- ✅ Camera photo capture (Aadhaar + Face)
- ✅ Biometric verification simulation
- ✅ Admin panel with full management
- ✅ Live vote tracking and results
- ✅ Blockchain simulation
- ✅ Data export (CSV)
- ✅ Multi-language support

## 🔒 Security Notes
- Environment variables secure email credentials
- OTP expires in 2 minutes
- Face verification for voting
- Blockchain-style vote recording
- Admin panel access control

## 📞 Support
- GitHub: https://github.com/Krishna81500/BlockchainVotingApp
- Issues: Create GitHub issue for problems
- Email: Check server logs for email delivery status