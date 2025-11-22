require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory storage for OTPs (use database in production)
const otpStore = new Map();

// In-memory storage for user registrations with face data
const userRegistrations = new Map();
const approvedUsers = new Map();
const faceData = new Map(); // Store face capture data separately for security
const userDocuments = new Map(); // Store document images
const digilockerSessions = new Map(); // Store DigiLocker session data
const aadhaarVerifications = new Map(); // Store Aadhaar verification results

// In-memory storage for admin users
const adminUsers = new Map();
const adminSessions = new Map();

// In-memory storage for elections and candidates
const elections = new Map();
const candidates = new Map();

// Create default admin user
const defaultAdmin = {
    id: 'admin001',
    officialId: 'ADMIN001',
    name: 'System Administrator',
    email: 'admin@securevote.com',
    password: 'admin123', // In production, this should be hashed
    department: 'election-commission',
    designation: 'Chief Election Officer',
    status: 'approved',
    createdAt: new Date().toISOString()
};
adminUsers.set(defaultAdmin.officialId, defaultAdmin);

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// SMTP Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Test connection
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP connection failed:', error);
    } else {
        console.log('📧 Gmail SMTP server ready for email sending');
    }
});

// Generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email
async function sendOTPEmail(email, otp, purpose = 'login') {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'securevote2024@gmail.com',
        to: email,
        subject: `SecureVote - Your OTP for ${purpose}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #d4af37; margin: 0;">🗳️ SecureVote</h1>
                    <p style="margin: 5px 0; opacity: 0.9;">Blockchain Voting System</p>
                </div>
                
                <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
                    <h2 style="color: #d4af37; text-align: center; margin-bottom: 20px;">Your OTP Code</h2>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="display: inline-block; background: #d4af37; color: #1a1a2e; padding: 15px 30px; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                            ${otp}
                        </div>
                    </div>
                    
                    <p style="text-align: center; margin: 20px 0; font-size: 16px;">
                        Use this OTP to complete your ${purpose} process
                    </p>
                    
                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; text-align: center;">
                            ⏰ This OTP will expire in <strong>5 minutes</strong>
                        </p>
                    </div>
                    
                    <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px; margin-top: 30px;">
                        <p style="font-size: 12px; opacity: 0.8; text-align: center; margin: 0;">
                            🔒 For security reasons, never share this OTP with anyone.<br>
                            If you didn't request this OTP, please ignore this email.
                        </p>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; opacity: 0.7;">
                    <p style="font-size: 12px; margin: 0;">
                        © 2024 SecureVote - Secure Blockchain Voting System
                    </p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('To:', email);
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email send error:', error.message);
        console.error('Error code:', error.code);
        console.error('To email:', email);
        return { success: false, error: error.message };
    }
}

// API Routes

// Send OTP
app.post('/api/send-otp', async (req, res) => {
    try {
        const { email, purpose = 'login', voterId } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Store OTP
        otpStore.set(email, {
            otp,
            expiryTime,
            purpose,
            voterId,
            attempts: 0
        });

        // Send email
        const emailResult = await sendOTPEmail(email, otp, purpose);

        if (emailResult.success) {
            res.json({
                success: true,
                message: 'OTP sent successfully to your email',
                expiryTime
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP email'
            });
        }
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify OTP
app.post('/api/verify-otp', (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: 'No OTP found for this email'
            });
        }

        // Check expiry
        if (Date.now() > storedData.expiryTime) {
            otpStore.delete(email);
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Check attempts
        if (storedData.attempts >= 3) {
            otpStore.delete(email);
            return res.status(400).json({
                success: false,
                message: 'Too many failed attempts. Please request a new OTP'
            });
        }

        // Verify OTP
        if (storedData.otp === otp) {
            otpStore.delete(email);
            res.json({
                success: true,
                message: 'OTP verified successfully',
                purpose: storedData.purpose,
                voterId: storedData.voterId
            });
        } else {
            storedData.attempts++;
            otpStore.set(email, storedData);
            res.status(400).json({
                success: false,
                message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining`
            });
        }
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get OTP status
app.get('/api/otp-status/:email', (req, res) => {
    try {
        const { email } = req.params;
        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.json({
                exists: false,
                timeRemaining: 0
            });
        }

        const timeRemaining = Math.max(0, Math.floor((storedData.expiryTime - Date.now()) / 1000));

        res.json({
            exists: true,
            timeRemaining,
            attempts: storedData.attempts,
            maxAttempts: 3
        });
    } catch (error) {
        console.error('OTP status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Complete user registration with face data
app.post('/api/complete-registration', (req, res) => {
    try {
        const { email, otp, registrationData, faceImageData, documentImage } = req.body;

        // Verify OTP first
        const storedData = otpStore.get(email);
        if (!storedData || storedData.otp !== otp || Date.now() > storedData.expiryTime) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Create registration record
        const registrationId = generateId();
        const registration = {
            id: registrationId,
            ...registrationData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            hasFaceData: !!faceImageData,
            hasDocument: !!documentImage
        };

        // Store face data separately for security
        if (faceImageData) {
            faceData.set(registrationId, {
                imageData: faceImageData,
                capturedAt: new Date().toISOString(),
                verified: false
            });
        }

        // Store document image
        if (documentImage) {
            userDocuments.set(registrationId, {
                documentImage: documentImage,
                uploadedAt: new Date().toISOString()
            });
        }

        userRegistrations.set(registrationId, registration);
        otpStore.delete(email); // Clear OTP

        res.json({
            success: true,
            message: 'Registration submitted successfully. Please wait for admin approval.',
            registrationId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
});

// Get user face data (admin only)
app.get('/api/admin/user-face/:id', (req, res) => {
    try {
        const { id } = req.params;
        const face = faceData.get(id);
        const registration = userRegistrations.get(id);
        
        if (!face || !registration) {
            return res.status(404).json({
                success: false,
                message: 'Face data not found'
            });
        }

        res.json({
            success: true,
            faceData: {
                imageData: face.imageData,
                capturedAt: face.capturedAt,
                verified: face.verified,
                userName: registration.aadharName,
                email: registration.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve face data'
        });
    }
});

// Get user document (admin only)
app.get('/api/admin/user-document/:id', (req, res) => {
    try {
        const { id } = req.params;
        const document = userDocuments.get(id);
        const registration = userRegistrations.get(id);
        
        if (!document || !registration) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        res.json({
            success: true,
            documentData: {
                documentImage: document.documentImage,
                uploadedAt: document.uploadedAt,
                userName: registration.aadharName,
                email: registration.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve document'
        });
    }
});

// Verify face data (admin only)
app.post('/api/admin/verify-face/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { verified } = req.body;
        const face = faceData.get(id);
        
        if (!face) {
            return res.status(404).json({
                success: false,
                message: 'Face data not found'
            });
        }

        face.verified = verified;
        face.verifiedAt = new Date().toISOString();
        faceData.set(id, face);

        res.json({
            success: true,
            message: `Face data ${verified ? 'verified' : 'rejected'} successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to verify face data'
        });
    }
});

// Check if user is registered and approved
app.post('/api/check-user', (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if user is approved
        const approvedUser = approvedUsers.get(email);
        if (approvedUser) {
            return res.json({
                success: true,
                isRegistered: true,
                isApproved: true,
                user: approvedUser
            });
        }

        // Check if user has pending registration
        const pendingRegistration = Array.from(userRegistrations.values())
            .find(reg => reg.email === email && reg.status === 'pending');
        
        if (pendingRegistration) {
            return res.json({
                success: true,
                isRegistered: true,
                isApproved: false,
                status: 'pending'
            });
        }

        // Check if user was rejected
        const rejectedRegistration = Array.from(userRegistrations.values())
            .find(reg => reg.email === email && reg.status === 'rejected');
        
        if (rejectedRegistration) {
            return res.json({
                success: true,
                isRegistered: true,
                isApproved: false,
                status: 'rejected'
            });
        }

        res.json({
            success: true,
            isRegistered: false,
            isApproved: false
        });
    } catch (error) {
        console.error('Check user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check user status'
        });
    }
});

// Admin routes
app.get('/api/admin/registrations', (req, res) => {
    try {
        const registrations = Array.from(userRegistrations.values())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json({
            success: true,
            registrations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load registrations'
        });
    }
});

app.get('/api/admin/stats', (req, res) => {
    try {
        const registrations = Array.from(userRegistrations.values());
        const stats = {
            total: registrations.length,
            pending: registrations.filter(r => r.status === 'pending').length,
            approved: registrations.filter(r => r.status === 'approved').length,
            rejected: registrations.filter(r => r.status === 'rejected').length
        };
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load stats'
        });
    }
});

app.post('/api/admin/approve/:id', (req, res) => {
    try {
        const { id } = req.params;
        const registration = userRegistrations.get(id);
        
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        // Update registration status
        registration.status = 'approved';
        registration.approvedAt = new Date().toISOString();
        userRegistrations.set(id, registration);

        // Add to approved users with face verification status
        const face = faceData.get(id);
        approvedUsers.set(registration.email, {
            id: registration.id,
            name: registration.aadharName,
            email: registration.email,
            phone: registration.phone,
            constituency: `${registration.state}, ${registration.country}`,
            approvedAt: registration.approvedAt,
            faceVerified: face ? face.verified : false,
            hasFaceData: !!face
        });

        res.json({
            success: true,
            message: 'Registration approved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to approve registration'
        });
    }
});

app.post('/api/admin/reject/:id', (req, res) => {
    try {
        const { id } = req.params;
        const registration = userRegistrations.get(id);
        
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        // Update registration status
        registration.status = 'rejected';
        registration.rejectedAt = new Date().toISOString();
        userRegistrations.set(id, registration);

        res.json({
            success: true,
            message: 'Registration rejected'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to reject registration'
        });
    }
});

// Admin authentication routes
app.post('/api/admin/register', async (req, res) => {
    try {
        const { officialId, name, email, phone, department, designation, password } = req.body;

        // Check if admin already exists
        if (adminUsers.has(officialId)) {
            return res.status(400).json({
                success: false,
                message: 'Admin with this official ID already exists'
            });
        }

        // Create admin record
        const adminId = generateId();
        const admin = {
            id: adminId,
            officialId,
            name,
            email,
            phone,
            department,
            designation,
            password, // In production, hash this
            status: 'pending', // Requires approval
            createdAt: new Date().toISOString()
        };

        adminUsers.set(officialId, admin);

        res.json({
            success: true,
            message: 'Admin registration submitted. Please wait for approval.'
        });
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
});

app.post('/api/admin/login', async (req, res) => {
    try {
        const { officialId, email, password } = req.body;

        const admin = adminUsers.get(officialId);
        if (!admin || admin.email !== email || admin.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (admin.status !== 'approved') {
            return res.status(401).json({
                success: false,
                message: 'Admin account not approved yet'
            });
        }

        // Create session token
        const token = generateId();
        adminSessions.set(token, {
            adminId: admin.id,
            officialId: admin.officialId,
            loginTime: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                department: admin.department,
                designation: admin.designation
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

// Election management routes
app.post('/api/admin/elections', async (req, res) => {
    try {
        const { title, description, startDate, endDate, type } = req.body;

        const electionId = generateId();
        const election = {
            id: electionId,
            title,
            description,
            startDate,
            endDate,
            type,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
            candidates: []
        };

        elections.set(electionId, election);

        res.json({
            success: true,
            message: 'Election created successfully',
            election
        });
    } catch (error) {
        console.error('Create election error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create election'
        });
    }
});

app.get('/api/admin/elections', (req, res) => {
    try {
        const electionList = Array.from(elections.values())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json({
            success: true,
            elections: electionList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load elections'
        });
    }
});

// Candidate management routes
app.post('/api/admin/candidates', async (req, res) => {
    try {
        const { electionId, name, party, age, qualification, manifesto } = req.body;

        const election = elections.get(electionId);
        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election not found'
            });
        }

        const candidateId = generateId();
        const candidate = {
            id: candidateId,
            electionId,
            name,
            party,
            age,
            qualification,
            manifesto,
            votes: 0,
            createdAt: new Date().toISOString()
        };

        candidates.set(candidateId, candidate);
        
        // Add candidate to election
        if (!election.candidates) election.candidates = [];
        election.candidates.push(candidateId);
        elections.set(electionId, election);

        res.json({
            success: true,
            message: 'Candidate added successfully',
            candidate
        });
    } catch (error) {
        console.error('Add candidate error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add candidate'
        });
    }
});

// Bulk add candidates
app.post('/api/admin/candidates/bulk', async (req, res) => {
    try {
        const { candidates: candidateList } = req.body;
        
        if (!candidateList || candidateList.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No candidates provided'
            });
        }
        
        const addedCandidates = [];
        
        for (const candidateData of candidateList) {
            const { electionId, name, party, age, qualification, manifesto } = candidateData;
            
            const election = elections.get(electionId);
            if (!election) {
                continue; // Skip invalid elections
            }
            
            const candidateId = generateId();
            const candidate = {
                id: candidateId,
                electionId,
                name,
                party,
                age,
                qualification,
                manifesto,
                votes: 0,
                createdAt: new Date().toISOString()
            };
            
            candidates.set(candidateId, candidate);
            
            // Add candidate to election
            if (!election.candidates) election.candidates = [];
            election.candidates.push(candidateId);
            elections.set(electionId, election);
            
            addedCandidates.push(candidate);
        }
        
        res.json({
            success: true,
            message: `${addedCandidates.length} candidates added successfully`,
            candidates: addedCandidates
        });
    } catch (error) {
        console.error('Bulk add candidates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add candidates'
        });
    }
});

app.get('/api/admin/candidates', (req, res) => {
    try {
        const { electionId } = req.query;
        let candidateList = Array.from(candidates.values());
        
        if (electionId) {
            candidateList = candidateList.filter(c => c.electionId === electionId);
        }
        
        candidateList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json({
            success: true,
            candidates: candidateList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to load candidates'
        });
    }
});

// Update candidate
app.put('/api/admin/candidates/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, party, age, qualification, manifesto } = req.body;
        
        const candidate = candidates.get(id);
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }
        
        // Update candidate data
        candidate.name = name;
        candidate.party = party;
        candidate.age = age;
        candidate.qualification = qualification;
        candidate.manifesto = manifesto;
        candidate.updatedAt = new Date().toISOString();
        
        candidates.set(id, candidate);
        
        res.json({
            success: true,
            message: 'Candidate updated successfully',
            candidate
        });
    } catch (error) {
        console.error('Update candidate error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update candidate'
        });
    }
});

// Delete candidate
app.delete('/api/admin/candidates/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const candidate = candidates.get(id);
        
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }
        
        // Remove from election
        const election = elections.get(candidate.electionId);
        if (election && election.candidates) {
            election.candidates = election.candidates.filter(cId => cId !== id);
            elections.set(candidate.electionId, election);
        }
        
        // Delete candidate
        candidates.delete(id);
        
        res.json({
            success: true,
            message: 'Candidate deleted successfully'
        });
    } catch (error) {
        console.error('Delete candidate error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete candidate'
        });
    }
});

// Serve admin pages
app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// DigiLocker Integration Routes
app.post('/api/digilocker/initiate', async (req, res) => {
    try {
        const { email } = req.body;
        const sessionId = generateId();
        
        // DigiLocker OAuth URL
        const authUrl = `${process.env.DIGILOCKER_API_URL}/oauth2/1/authorize?` +
            `response_type=code&` +
            `client_id=${process.env.DIGILOCKER_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(process.env.DIGILOCKER_REDIRECT_URI)}&` +
            `state=${sessionId}&` +
            `scope=aadhaar`;
        
        // Store session data
        digilockerSessions.set(sessionId, {
            email,
            createdAt: new Date().toISOString(),
            status: 'initiated'
        });
        
        res.json({
            success: true,
            authUrl,
            sessionId
        });
    } catch (error) {
        console.error('DigiLocker initiate error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate DigiLocker verification'
        });
    }
});

app.get('/api/digilocker/callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        const session = digilockerSessions.get(state);
        
        if (!session) {
            return res.status(400).json({
                success: false,
                message: 'Invalid session'
            });
        }
        
        // Exchange code for access token
        const tokenResponse = await axios.post(`${process.env.DIGILOCKER_API_URL}/oauth2/1/token`, {
            grant_type: 'authorization_code',
            code: code,
            client_id: process.env.DIGILOCKER_CLIENT_ID,
            client_secret: process.env.DIGILOCKER_CLIENT_SECRET,
            redirect_uri: process.env.DIGILOCKER_REDIRECT_URI
        });
        
        const { access_token } = tokenResponse.data;
        
        // Get Aadhaar data
        const aadhaarResponse = await axios.get(`${process.env.DIGILOCKER_API_URL}/partner/aadhaar/v1.0`, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const aadhaarData = aadhaarResponse.data;
        
        // Store verification result
        aadhaarVerifications.set(session.email, {
            verified: true,
            aadhaarNumber: aadhaarData.uid,
            name: aadhaarData.name,
            dateOfBirth: aadhaarData.dob,
            gender: aadhaarData.gender,
            address: aadhaarData.address,
            verifiedAt: new Date().toISOString(),
            sessionId: state
        });
        
        // Update session
        session.status = 'completed';
        session.completedAt = new Date().toISOString();
        digilockerSessions.set(state, session);
        
        // Redirect to success page
        res.redirect(`/?digilocker=success&session=${state}`);
        
    } catch (error) {
        console.error('DigiLocker callback error:', error);
        res.redirect('/?digilocker=error');
    }
});

app.get('/api/digilocker/status/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = digilockerSessions.get(sessionId);
        
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        
        const verification = aadhaarVerifications.get(session.email);
        
        res.json({
            success: true,
            status: session.status,
            verified: !!verification,
            aadhaarData: verification ? {
                name: verification.name,
                dateOfBirth: verification.dateOfBirth,
                gender: verification.gender,
                verifiedAt: verification.verifiedAt
            } : null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get verification status'
        });
    }
});

app.post('/api/verify-aadhaar', (req, res) => {
    try {
        const { email } = req.body;
        const verification = aadhaarVerifications.get(email);
        
        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'Aadhaar not verified for this email'
            });
        }
        
        res.json({
            success: true,
            verified: true,
            aadhaarData: {
                name: verification.name,
                dateOfBirth: verification.dateOfBirth,
                gender: verification.gender,
                verifiedAt: verification.verifiedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to verify Aadhaar'
        });
    }
});

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 SecureVote server running on http://localhost:${PORT}`);
    console.log('📧 SMTP gateway ready for OTP email authentication');
});

// Cleanup expired OTPs every minute
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of otpStore.entries()) {
        if (now > data.expiryTime) {
            otpStore.delete(email);
        }
    }
}, 60000);