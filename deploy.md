# Deployment Guide

## Quick Deploy to GitHub

### 1. Upload to GitHub
```bash
# In your project folder
git add .
git commit -m "SecureVote Blockchain Voting System"
git remote add origin https://github.com/YOUR_USERNAME/blockchain-voting-app.git
git push -u origin master
```

### 2. Deploy to Heroku (Free)
```bash
# Install Heroku CLI first
heroku create securevote-app
heroku config:set EMAIL_USER=your-gmail@gmail.com
heroku config:set EMAIL_PASS=your-app-password
git push heroku master
```

### 3. Deploy to Vercel (Free)
```bash
# Install Vercel CLI
npm i -g vercel
vercel --prod
```

### 4. Deploy to Railway (Free)
- Connect GitHub repo to Railway.app
- Set environment variables
- Auto-deploys

## Environment Variables Needed:
- `EMAIL_USER` = your Gmail address
- `EMAIL_PASS` = your Gmail app password
- `PORT` = 3003 (or platform default)

## Access URLs:
- Mobile App: `https://your-app.herokuapp.com/`
- Admin Panel: `https://your-app.herokuapp.com/admin`