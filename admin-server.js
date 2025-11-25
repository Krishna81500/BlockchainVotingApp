const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Serve admin panel
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Proxy API calls to main server
app.use('/api', (req, res) => {
    const mainServerUrl = `http://localhost:3000${req.originalUrl}`;
    
    // Simple proxy - in production, use a proper proxy middleware
    res.json({
        message: 'Admin server running. API calls should go to main server at port 3001',
        mainServerUrl: mainServerUrl
    });
});

// Start admin server
app.listen(PORT, () => {
    console.log(`🔧 Admin Panel server running on http://localhost:${PORT}`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`🔗 Main API Server should be running on http://localhost:3000`);
});