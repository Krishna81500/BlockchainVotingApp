const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('.'));
app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 3004;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});