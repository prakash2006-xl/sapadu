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

// Sync GET endpoints
app.get('/api/sync', async (req, res) => {
    try {
        const [donations] = await db.query('SELECT * FROM Donations');
        const [requests] = await db.query('SELECT * FROM Requests');
        const [volunteers] = await db.query('SELECT * FROM Volunteers');
        const [ratings] = await db.query('SELECT * FROM Ratings');
        res.json({ success: true, data: { donations, requests, volunteers, ratings } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Database error.' });
    }
});

// POST endpoints
app.post('/api/donations', async (req, res) => {
    try {
        const d = req.body;
        await db.query(
            'INSERT INTO Donations (donor_username, donor_name, donor_age, food_name, food_type, quantity, mfg_date, expiry_date, location_label, lat, lng, freshness_score, expiry_days, pay_type, pay_info, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [d.donor_username, d.donor_name, d.donor_age, d.food_name, d.food_type, d.quantity, d.mfg_date, d.expiry_date, d.location_label, d.lat, d.lng, d.freshness_score, d.expiry_days, d.pay_type, d.pay_info, d.status]
        );
        res.json({ success: true });
    } catch (err) { console.error(err); res.status(500).json({ success: false }); }
});

app.post('/api/requests', async (req, res) => {
    try {
        const r = req.body;
        await db.query(
            'INSERT INTO Requests (req_username, req_name, req_age, donation_id, food_name, quantity, urgency, location_label, priority_score, distance_km, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [r.req_username, r.req_name, r.req_age, r.donation_id, r.food_name, r.quantity, r.urgency, r.location_label, r.priority_score, r.distance_km, r.status]
        );
        await db.query('UPDATE Donations SET status = "requested" WHERE id = ?', [r.donation_id]);
        res.json({ success: true });
    } catch (err) { console.error(err); res.status(500).json({ success: false }); }
});

app.post('/api/volunteers', async (req, res) => {
    try {
        const v = req.body;
        await db.query(
            'INSERT INTO Volunteers (vol_username, vol_name, vol_age, vehicle_type, pickup_location, shift, time_slot, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [v.vol_username, v.vol_name, v.vol_age, v.vehicle_type, v.pickup_location, v.shift, v.time_slot, v.status]
        );
        if (v.assigned_req_id) {
            await db.query('UPDATE Requests SET status = "assigned" WHERE id = ?', [v.assigned_req_id]);
        }
        res.json({ success: true });
    } catch (err) { console.error(err); res.status(500).json({ success: false }); }
});

app.post('/api/ratings', async (req, res) => {
    try {
        const r = req.body;
        await db.query(
            'INSERT INTO Ratings (target_username, category, score, review) VALUES (?, ?, ?, ?)',
            [r.target_username, r.category, r.score, r.review]
        );
        res.json({ success: true });
    } catch (err) { console.error(err); res.status(500).json({ success: false }); }
});

// Fallback for HTML routing (since we moved to MPA, if they hit the server it serves index.html by default)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
