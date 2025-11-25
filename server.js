require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory storage for OTPs (use database in production)
const otpStore = new Map();

// Initialize SQLite database
const dbPath = path.join(__dirname, 'voting_system.db');
const db = new sqlite3.Database(dbPath);

// Create tables if they don't exist
db.serialize(() => {
    // User registrations table
    db.run(`CREATE TABLE IF NOT EXISTS user_registrations (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        aadharName TEXT NOT NULL,
        aadhaarNumber TEXT,
        dateOfBirth TEXT,
        gender TEXT,
        phone TEXT,
        voterId TEXT,
        address TEXT,
        state TEXT,
        country TEXT,
        votingType TEXT,
        facePhoto TEXT,
        aadhaarPhoto TEXT,
        registrationTimestamp TEXT,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        approvedAt DATETIME,
        rejectedAt DATETIME
    )`);
    
    // Approved users table for quick lookup
    db.run(`CREATE TABLE IF NOT EXISTS approved_users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        constituency TEXT,
        approvedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Email check log table
    db.run(`CREATE TABLE IF NOT EXISTS email_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        checkType TEXT NOT NULL,
        result TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

console.log('📊 Database initialized successfully');

// In-memory storage for user registrations (keeping for backward compatibility)
const userRegistrations = new Map();
const approvedUsers = new Map();

// Load existing data from database into memory
function loadDataFromDatabase() {
    db.all('SELECT * FROM user_registrations', (err, rows) => {
        if (err) {
            console.error('Error loading registrations:', err);
            return;
        }
        rows.forEach(row => {
            userRegistrations.set(row.id, row);
        });
        console.log(`📋 Loaded ${rows.length} registrations from database`);
    });
    
    db.all('SELECT * FROM approved_users', (err, rows) => {
        if (err) {
            console.error('Error loading approved users:', err);
            return;
        }
        rows.forEach(row => {
            approvedUsers.set(row.email, row);
        });
        console.log(`✅ Loaded ${rows.length} approved users from database`);
    });
}

// Load data on startup
loadDataFromDatabase();

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

        // Check email registration status based on purpose
        if (purpose === 'registration') {
            // Log email check
            db.run('INSERT INTO email_checks (email, checkType, result) VALUES (?, ?, ?)', 
                [email, 'registration_attempt', 'checking']);
            
            // Check if user is already approved
            const approvedUser = approvedUsers.get(email);
            if (approvedUser) {
                db.run('INSERT INTO email_checks (email, checkType, result) VALUES (?, ?, ?)', 
                    [email, 'registration_attempt', 'already_approved']);
                return res.status(400).json({
                    success: false,
                    message: 'This email is already registered and approved. Please use login instead.'
                });
            }

            // Check if user has pending registration
            const pendingRegistration = Array.from(userRegistrations.values())
                .find(reg => reg.email === email && reg.status === 'pending');
            
            if (pendingRegistration) {
                db.run('INSERT INTO email_checks (email, checkType, result) VALUES (?, ?, ?)', 
                    [email, 'registration_attempt', 'pending_approval']);
                return res.status(400).json({
                    success: false,
                    message: 'Registration with this email is already pending approval.'
                });
            }
            
            // Log successful email check
            db.run('INSERT INTO email_checks (email, checkType, result) VALUES (?, ?, ?)', 
                [email, 'registration_attempt', 'allowed']);
        } else if (purpose === 'login') {
            // For login, check if email is registered and approved
            db.run('INSERT INTO email_checks (email, checkType, result) VALUES (?, ?, ?)', 
                [email, 'login_attempt', 'checking']);
            
            const approvedUser = approvedUsers.get(email);
            if (!approvedUser) {
                db.run('INSERT INTO email_checks (email, checkType, result) VALUES (?, ?, ?)', 
                    [email, 'login_attempt', 'not_registered']);
                return res.status(400).json({
                    success: false,
                    message: 'This email is not registered or not approved yet. Please register first.'
                });
            }
            
            // Log successful login check
            db.run('INSERT INTO email_checks (email, checkType, result) VALUES (?, ?, ?)', 
                [email, 'login_attempt', 'allowed']);
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
            // Log successful OTP send
            db.run('INSERT INTO email_checks (email, checkType, result) VALUES (?, ?, ?)', 
                [email, 'otp_sent', 'success']);
            res.json({
                success: true,
                message: 'OTP sent successfully to your email',
                expiryTime
            });
        } else {
            // Log failed OTP send
            db.run('INSERT INTO email_checks (email, checkType, result) VALUES (?, ?, ?)', 
                [email, 'otp_sent', 'failed']);
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

// Complete user registration
app.post('/api/complete-registration', (req, res) => {
    try {
        const { email, otp, registrationData } = req.body;
        
        console.log('Registration request received:', { email, hasOtp: !!otp, hasData: !!registrationData });

        // Verify OTP first
        const storedData = otpStore.get(email);
        if (!storedData || storedData.otp !== otp || Date.now() > storedData.expiryTime) {
            console.log('OTP verification failed:', { hasStoredData: !!storedData, otpMatch: storedData?.otp === otp, expired: Date.now() > (storedData?.expiryTime || 0) });
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Ensure email is in registrationData
        registrationData.email = email;

        // Create registration record
        const registrationId = generateId();
        const registration = {
            id: registrationId,
            ...registrationData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        console.log('Saving registration to database:', registrationId);

        // Save to database with photos
        db.run(`INSERT INTO user_registrations 
            (id, email, aadharName, aadhaarNumber, dateOfBirth, gender, phone, voterId, 
             address, state, country, votingType, facePhoto, aadhaarPhoto, 
             registrationTimestamp, status, createdAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [registrationId, email, registrationData.aadharName, 
             registrationData.aadhaarNumber, registrationData.dateOfBirth, registrationData.gender,
             registrationData.phone, registrationData.voterId, registrationData.address,
             registrationData.state, registrationData.country, registrationData.votingType, 
             registrationData.facePhoto, registrationData.aadhaarPhoto, 
             registrationData.registrationTimestamp, 'pending', registration.createdAt],
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to save registration: ' + err.message
                    });
                }
                
                console.log('Registration saved successfully:', registrationId);
                
                // Also save to memory for backward compatibility
                userRegistrations.set(registrationId, registration);
                otpStore.delete(email); // Clear OTP
                
                // Log successful registration
                db.run('INSERT INTO email_checks (email, checkType, result) VALUES (?, ?, ?)', 
                    [email, 'registration_completed', 'success']);

                res.json({
                    success: true,
                    message: 'Registration submitted successfully. Please wait for admin approval.',
                    registrationId
                });
            }
        );
    } catch (error) {
        console.error('Registration error:', error);
        // Log failed registration
        if (req.body.email) {
            db.run('INSERT INTO email_checks (email, checkType, result) VALUES (?, ?, ?)', 
                [req.body.email, 'registration_completed', 'failed']);
        }
        res.status(500).json({
            success: false,
            message: 'Registration failed: ' + error.message
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

        const approvedAt = new Date().toISOString();
        
        // Update in database
        db.run('UPDATE user_registrations SET status = ?, approvedAt = ? WHERE id = ?',
            ['approved', approvedAt, id], function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to approve registration'
                    });
                }
                
                // Update registration status in memory
                registration.status = 'approved';
                registration.approvedAt = approvedAt;
                userRegistrations.set(id, registration);

                // Add to approved users table and memory
                const approvedUser = {
                    id: registration.id,
                    name: registration.aadharName,
                    email: registration.email,
                    phone: registration.phone,
                    constituency: `${registration.state}, ${registration.country}`,
                    approvedAt: approvedAt
                };
                
                db.run(`INSERT OR REPLACE INTO approved_users 
                    (id, email, name, phone, constituency, approvedAt) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [approvedUser.id, approvedUser.email, approvedUser.name, 
                     approvedUser.phone, approvedUser.constituency, approvedUser.approvedAt]);
                
                approvedUsers.set(registration.email, approvedUser);
                
                // Log approval
                db.run('INSERT INTO email_checks (email, checkType, result) VALUES (?, ?, ?)', 
                    [registration.email, 'admin_action', 'approved']);

                res.json({
                    success: true,
                    message: 'Registration approved successfully'
                });
            }
        );
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

        const rejectedAt = new Date().toISOString();
        
        // Update in database
        db.run('UPDATE user_registrations SET status = ?, rejectedAt = ? WHERE id = ?',
            ['rejected', rejectedAt, id], function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to reject registration'
                    });
                }
                
                // Update registration status in memory
                registration.status = 'rejected';
                registration.rejectedAt = rejectedAt;
                userRegistrations.set(id, registration);
                
                // Log rejection
                db.run('INSERT INTO email_checks (email, checkType, result) VALUES (?, ?, ?)', 
                    [registration.email, 'admin_action', 'rejected']);

                res.json({
                    success: true,
                    message: 'Registration rejected'
                });
            }
        );
    } catch (error) {
        console.error('Reject registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject registration'
        });
    }
});

// Check email registration status (Admin endpoint)
app.post('/api/admin/check-email', (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        
        // Check if user is approved
        const approvedUser = approvedUsers.get(email);
        if (approvedUser) {
            return res.json({
                success: true,
                isRegistered: true,
                status: 'approved',
                user: approvedUser,
                message: 'Email is registered and approved'
            });
        }

        // Check if user has pending registration
        const pendingRegistration = Array.from(userRegistrations.values())
            .find(reg => reg.email === email && reg.status === 'pending');
        
        if (pendingRegistration) {
            return res.json({
                success: true,
                isRegistered: true,
                status: 'pending',
                registration: pendingRegistration,
                message: 'Email has pending registration'
            });
        }

        // Check if user was rejected
        const rejectedRegistration = Array.from(userRegistrations.values())
            .find(reg => reg.email === email && reg.status === 'rejected');
        
        if (rejectedRegistration) {
            return res.json({
                success: true,
                isRegistered: true,
                status: 'rejected',
                registration: rejectedRegistration,
                message: 'Email registration was rejected'
            });
        }

        res.json({
            success: true,
            isRegistered: false,
            status: 'not_registered',
            message: 'Email is not registered'
        });
    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check email status'
        });
    }
});

// Get email check logs (Admin endpoint)
app.get('/api/admin/email-logs', (req, res) => {
    try {
        db.all(`SELECT * FROM email_checks 
                ORDER BY timestamp DESC 
                LIMIT 100`, (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to load email logs'
                });
            }
            
            res.json({
                success: true,
                logs: rows
            });
        });
    } catch (error) {
        console.error('Email logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load email logs'
        });
    }
});

// Get all registered emails (Admin endpoint)
app.get('/api/admin/registered-emails', (req, res) => {
    try {
        db.all(`SELECT email, aadharName, status, createdAt, approvedAt, rejectedAt 
                FROM user_registrations 
                ORDER BY createdAt DESC`, (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to load registered emails'
                });
            }
            
            res.json({
                success: true,
                emails: rows
            });
        });
    } catch (error) {
        console.error('Registered emails error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load registered emails'
        });
    }
});

// Face verification endpoint
app.post('/api/verify-face', (req, res) => {
    try {
        const { email, faceData } = req.body;
        
        if (!email || !faceData) {
            return res.status(400).json({
                success: false,
                message: 'Email and face data are required'
            });
        }
        
        // Get stored face photo for the user
        db.get('SELECT facePhoto FROM user_registrations WHERE email = ? AND status = "approved"', 
            [email], (err, row) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error during face verification'
                    });
                }
                
                if (!row || !row.facePhoto) {
                    return res.status(404).json({
                        success: false,
                        message: 'No registered face found for this user'
                    });
                }
                
                // Simple face comparison (in production, use proper face recognition)
                // For now, we'll simulate face verification
                const similarity = simulateFaceComparison(row.facePhoto, faceData);
                
                if (similarity > 0.8) { // 80% similarity threshold
                    res.json({
                        success: true,
                        message: 'Face verification successful',
                        similarity: similarity
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        message: 'Face verification failed - faces do not match',
                        similarity: similarity
                    });
                }
            }
        );
    } catch (error) {
        console.error('Face verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Face verification failed'
        });
    }
});

// Simple face comparison simulation (replace with actual face recognition in production)
function simulateFaceComparison(storedFace, currentFace) {
    // This is a placeholder - in production, use libraries like face-api.js or cloud services
    // For demo purposes, we'll return a random similarity score
    const baseScore = 0.85; // Base similarity
    const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
    return Math.max(0, Math.min(1, baseScore + variation));
}

// Get user face photo for verification (Admin endpoint)
app.get('/api/admin/user-photos/:email', (req, res) => {
    try {
        const { email } = req.params;
        
        db.get('SELECT facePhoto, aadhaarPhoto, aadharName FROM user_registrations WHERE email = ?', 
            [email], (err, row) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to load user photos'
                    });
                }
                
                if (!row) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }
                
                res.json({
                    success: true,
                    user: {
                        name: row.aadharName,
                        email: email,
                        facePhoto: row.facePhoto,
                        aadhaarPhoto: row.aadhaarPhoto
                    }
                });
            }
        );
    } catch (error) {
        console.error('User photos error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load user photos'
        });
    }
});

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
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