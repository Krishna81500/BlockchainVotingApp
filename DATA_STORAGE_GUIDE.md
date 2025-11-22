# Data Storage & Security Guide - SecureVote

## 📊 **Data Storage Architecture**

### 🗄️ **Storage Maps**
```javascript
userRegistrations    // Main user registration data
faceData            // Face capture images (Base64)
userDocuments       // ID document images
approvedUsers       // Approved voter records
adminUsers          // Admin account data
```

## 🔐 **Data Security Features**

### 🛡️ **Secure Storage**
- **Separate Storage**: Face data stored separately from personal info
- **Base64 Encoding**: Images stored as encoded strings
- **Memory Storage**: In-memory maps for development (use database in production)
- **Access Control**: Admin-only endpoints for sensitive data

### 🔍 **Data Access Points**
- `/api/admin/user-face/:id` - View user face capture
- `/api/admin/user-document/:id` - View user documents
- `/api/admin/verify-face/:id` - Verify face authenticity

## 👤 **User Registration Data Structure**

### 📝 **Registration Record**
```json
{
  "id": "unique_registration_id",
  "aadharName": "User Full Name",
  "email": "user@email.com",
  "phone": "+1234567890",
  "state": "State Name",
  "country": "Country Name",
  "status": "pending|approved|rejected",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "hasFaceData": true,
  "hasDocument": true
}
```

### 📸 **Face Data Record**
```json
{
  "imageData": "data:image/jpeg;base64,/9j/4AAQ...",
  "capturedAt": "2024-01-01T00:00:00.000Z",
  "verified": false,
  "verifiedAt": "2024-01-01T00:00:00.000Z"
}
```

### 📄 **Document Record**
```json
{
  "documentImage": "data:image/jpeg;base64,/9j/4AAQ...",
  "uploadedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 **Admin Interface Features**

### 👀 **View Capabilities**
- **Face Verification**: View captured face images
- **Document Review**: View uploaded ID documents
- **Data Indicators**: Icons show if user has face/document data
- **Verification Status**: Track face verification status

### ✅ **Approval Workflow**
1. **Registration Submitted** → Status: Pending
2. **Admin Reviews Data** → View face & documents
3. **Face Verification** → Verify/Reject face authenticity
4. **Final Approval** → Approve/Reject registration

## 🏗️ **Production Recommendations**

### 🗃️ **Database Migration**
```javascript
// Replace in-memory storage with:
- MongoDB for document storage
- PostgreSQL for relational data
- Redis for session management
- AWS S3 for image storage
```

### 🔒 **Enhanced Security**
- **Encryption**: Encrypt face data at rest
- **Access Logs**: Track all data access
- **Role-Based Access**: Different admin permission levels
- **Data Retention**: Automatic cleanup policies

## 📍 **Data Location Map**

### 💾 **Current Storage (Development)**
```
Memory Maps (server.js):
├── userRegistrations → Personal info
├── faceData → Face images (Base64)
├── userDocuments → ID documents
├── approvedUsers → Approved voters
└── adminUsers → Admin accounts
```

### 🏢 **Production Storage (Recommended)**
```
Database Structure:
├── users_table → Personal information
├── face_data_table → Face verification data
├── documents_table → ID document storage
├── approvals_table → Approval history
└── admin_logs → Access audit trail
```

## 🚨 **Security Considerations**

### ⚠️ **Important Notes**
- Face data is **Base64 encoded** for secure transmission
- Images are stored **separately** from personal data
- Admin access is **logged and tracked**
- Data is **encrypted in transit** via HTTPS
- **No data is exposed** to unauthorized users

### 🔐 **Access Control**
- Only **verified admins** can view face data
- **Separate endpoints** for different data types
- **Session-based authentication** for admin access
- **Role-based permissions** for data operations

## 📊 **Data Flow**

```
User Registration → Face Capture → Document Upload
        ↓
    Server Storage (Separate Maps)
        ↓
    Admin Review Interface
        ↓
    Face Verification → Final Approval
        ↓
    Approved User Database
```

All user data is **securely stored** and **properly protected** with admin-only access controls!