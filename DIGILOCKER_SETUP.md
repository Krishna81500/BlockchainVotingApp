# DigiLocker Integration Setup Guide

## 🔐 **DigiLocker API Integration**

### 📋 **Prerequisites**
1. **DigiLocker Developer Account** - Register at [DigiLocker Developer Portal](https://digitallocker.gov.in/developer)
2. **Client ID & Secret** - Obtain from DigiLocker after app registration
3. **Aadhaar API Access** - Request access to Aadhaar verification APIs

### 🛠️ **Setup Steps**

#### 1. **Register Your Application**
```
1. Visit DigiLocker Developer Portal
2. Create new application
3. Set redirect URI: http://localhost:3003/api/digilocker/callback
4. Request Aadhaar API access
5. Get Client ID and Client Secret
```

#### 2. **Update Environment Variables**
```env
# Add to .env file
DIGILOCKER_CLIENT_ID=your_actual_client_id
DIGILOCKER_CLIENT_SECRET=your_actual_client_secret
DIGILOCKER_REDIRECT_URI=http://localhost:3003/api/digilocker/callback
DIGILOCKER_API_URL=https://api.digitallocker.gov.in
```

#### 3. **Install Required Dependencies**
```bash
npm install axios
```

## 🔄 **Integration Flow**

### 📱 **User Experience**
1. **User clicks "Verify with DigiLocker"** on registration form
2. **Popup opens** with DigiLocker OAuth login
3. **User authenticates** with DigiLocker credentials
4. **Aadhaar data retrieved** and auto-filled in form
5. **Form fields locked** with verification badges

### 🔧 **Technical Flow**
```
Frontend → Initiate DigiLocker → OAuth Popup → User Auth
    ↓
DigiLocker Callback → Exchange Code → Get Access Token
    ↓
Fetch Aadhaar Data → Store Verification → Auto-fill Form
```

## 🌐 **API Endpoints**

### 🔗 **New Endpoints Added**
- `POST /api/digilocker/initiate` - Start DigiLocker verification
- `GET /api/digilocker/callback` - Handle OAuth callback
- `GET /api/digilocker/status/:sessionId` - Check verification status
- `POST /api/verify-aadhaar` - Verify Aadhaar for email

## 📊 **Data Storage**

### 🗄️ **New Storage Maps**
```javascript
digilockerSessions    // OAuth session tracking
aadhaarVerifications  // Verified Aadhaar data
```

### 📝 **Aadhaar Data Structure**
```json
{
  "verified": true,
  "aadhaarNumber": "XXXX-XXXX-1234",
  "name": "John Doe",
  "dateOfBirth": "01-01-1990",
  "gender": "M",
  "address": "Complete Address",
  "verifiedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔒 **Security Features**

### 🛡️ **Data Protection**
- **OAuth 2.0** secure authentication
- **Session-based** verification tracking
- **Encrypted data** transmission
- **No Aadhaar storage** - only verification status
- **Secure callbacks** with state validation

### 🔐 **Privacy Compliance**
- **Minimal data collection** - only required fields
- **Secure data handling** - encrypted in transit
- **Government approved** - official DigiLocker API
- **User consent** - explicit verification request

## 🎯 **Features**

### ✅ **Auto-Fill Registration**
- **Name** - From Aadhaar card
- **Date of Birth** - From Aadhaar card  
- **Gender** - From Aadhaar card
- **Address** - From Aadhaar card

### 🔒 **Verification Badges**
- **Green borders** on verified fields
- **Lock icons** prevent manual editing
- **Verification badges** show DigiLocker status
- **Secure validation** ensures data integrity

## 🚀 **Production Deployment**

### 🌐 **Domain Setup**
```env
# Update for production
DIGILOCKER_REDIRECT_URI=https://yourdomain.com/api/digilocker/callback
```

### 📋 **DigiLocker App Configuration**
1. **Update redirect URI** in DigiLocker developer portal
2. **Add production domain** to allowed origins
3. **Request production API access**
4. **Update SSL certificates**

## 🔧 **Testing**

### 🧪 **Test Flow**
1. **Start registration** process
2. **Click DigiLocker button**
3. **Use test credentials** (provided by DigiLocker)
4. **Verify auto-fill** functionality
5. **Check verification badges**

### 📱 **Test Credentials**
```
Test Aadhaar: 999999990019
Test Mobile: +91-9999999999
(Use DigiLocker sandbox credentials)
```

## ⚠️ **Important Notes**

### 🚨 **Compliance**
- **UIDAI Guidelines** - Follow Aadhaar usage guidelines
- **Data Protection** - Comply with data protection laws
- **User Consent** - Explicit consent for Aadhaar verification
- **Audit Trail** - Maintain verification logs

### 🔄 **Fallback Options**
- **Manual entry** if DigiLocker fails
- **Alternative verification** methods
- **Error handling** for API failures
- **Graceful degradation** for unsupported browsers

## 📞 **Support**

### 🆘 **Troubleshooting**
- **Check API credentials** in .env file
- **Verify redirect URI** matches exactly
- **Test network connectivity** to DigiLocker APIs
- **Check browser popup blockers**

### 📧 **Contact**
- **DigiLocker Support**: support@digitallocker.gov.in
- **Developer Portal**: https://digitallocker.gov.in/developer
- **API Documentation**: Available in developer portal

The DigiLocker integration provides **secure, government-verified Aadhaar authentication** for enhanced voter registration security!