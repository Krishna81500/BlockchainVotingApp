# Public Gmail OTP Setup

## Public Gmail Account Created:
- **Email:** securevote.demo2024@gmail.com
- **Password:** SecureVote@2024
- **App Password:** (will be generated)

## How it works:
1. Users enter their own Gmail address
2. System sends OTP to their email using our public Gmail account
3. Users receive OTP in their inbox
4. Users enter OTP to login

## Setup Steps:
1. Create Gmail account: securevote.demo2024@gmail.com
2. Enable 2FA on the account
3. Generate App Password for Mail
4. Update .env with credentials

## User Flow:
1. User enters: john.doe@gmail.com
2. System sends OTP to john.doe@gmail.com from securevote.demo2024@gmail.com
3. User checks their john.doe@gmail.com inbox
4. User enters OTP to complete login