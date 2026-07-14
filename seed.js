const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function seed() {
    console.log("🌱 Starting Database Seeding...");
    try {
        const rootConn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });
        const schema = fs.readFileSync('schema.sql', 'utf8');
        await rootConn.query(schema);
        await rootConn.end();
        console.log("✅ Database 'sapadu' and tables ensured.");
        
        const db = require('./db');
        // Disable FK checks to truncate tables
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.query('TRUNCATE TABLE Requests');
        await db.query('TRUNCATE TABLE Volunteers');
        await db.query('TRUNCATE TABLE Donations');
        await db.query('TRUNCATE TABLE Ratings');
        await db.query('TRUNCATE TABLE Users');
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log("🧹 Tables cleared.");

        // Users
        const users = [
            ['admin1', 'pass123', 'Super Admin', 35, 'admin@sapadu.com', '1234567890', 'admin', '⚙️'],
            ['john_donor', 'pass123', 'John Doe', 28, 'john@example.com', '9876543210', 'user', '👤'],
            ['jane_req', 'pass123', 'Jane Smith', 45, 'jane@example.com', '5551234567', 'user', '👤'],
            ['mike_vol', 'pass123', 'Mike Ross', 22, 'mike@example.com', '1112223333', 'user', '👤']
        ];
        
        for (const u of users) {
            await db.query('INSERT INTO Users (username, password, name, age, email, phone, role, emoji) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', u);
        }
        
        // Donations
        // donor_username, donor_name, donor_age, food_name, food_type, quantity, mfg_date, expiry_date, location_label, lat, lng, freshness_score, expiry_days, pay_type, pay_info, status
        const d_date1 = new Date(); d_date1.setDate(d_date1.getDate() - 1);
        const e_date1 = new Date(); e_date1.setDate(e_date1.getDate() + 19);
        const d_date2 = new Date(); 
        const e_date2 = new Date(); e_date2.setDate(e_date2.getDate() + 1);
        const mfg1 = d_date1.toISOString().split('T')[0]; const exp1 = e_date1.toISOString().split('T')[0];
        const mfg2 = d_date2.toISOString().split('T')[0]; const exp2 = e_date2.toISOString().split('T')[0];

        const donations = [
            ['john_donor', 'John Doe', 28, 'Fresh Apples', 'raw', 50, mfg1, exp1, 'Downtown Market', 9.9252 + 0.01, 78.1198 + 0.01, 8.5, 19, 'physical', 'Cash no notes', 'available'],
            ['john_donor', 'John Doe', 28, 'Cooked Rice & Sambar', 'cooked', 20, mfg2, exp2, 'Community Center', 9.9252 - 0.02, 78.1198 + 0.015, 9.5, 1, 'online', 'Online ₹0', 'available']
        ];
        
        for (const d of donations) {
            await db.query('INSERT INTO Donations (donor_username, donor_name, donor_age, food_name, food_type, quantity, mfg_date, expiry_date, location_label, lat, lng, freshness_score, expiry_days, pay_type, pay_info, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', d);
        }

        // Ratings
        const ratings = [
            ['john_donor', 'donor', 5, 'Great quality food, always fresh!'],
            ['john_donor', 'donor', 4, 'Good communication and timely drop-off.']
        ];
        
        for (const r of ratings) {
            await db.query('INSERT INTO Ratings (target_username, category, score, review) VALUES (?, ?, ?, ?)', r);
        }
        
        // Write users.txt
        const txtContent = `Sapadu Demo Users
=================

Admin Account:
Username: admin1
Password: pass123
Role: System Administrator (Has access to charts and full system data)

Donor Account:
Username: john_donor
Password: pass123
Role: Community Member (Has dummy donations and trust scores ready)

Receiver Account:
Username: jane_req
Password: pass123
Role: Community Member

Volunteer Account:
Username: mike_vol
Password: pass123
Role: Community Member
`;
        fs.writeFileSync('users.txt', txtContent);

        console.log("✅ Database seeded successfully!");
        console.log("✅ users.txt generated.");
        process.exit(0);

    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

seed();
