const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// Simple Auth API endpoints
app.post('/api/signup', async (req, res) => {
    try {
        const { username, password, name, age, email, phone, role, emoji } = req.body;
        const [result] = await db.query(
            'INSERT INTO Users (username, password, name, age, email, phone, role, emoji) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [username, password, name, age, email, phone, role, emoji]
        );
        res.json({ success: true, message: 'User registered successfully!' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: 'Username already taken.' });
        } else {
            console.error(err);
            res.status(500).json({ success: false, message: 'Database error.' });
        }
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await db.query('SELECT * FROM Users WHERE username = ? AND password = ?', [username, password]);
        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// Fallback for HTML routing (since we moved to MPA, if they hit the server it serves index.html by default)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
