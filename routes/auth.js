import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_12345';

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

        const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) return res.status(400).json({ error: 'Username already exists' });

        const hash = await bcrypt.hash(password, 10);
        const [result] = await db.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash]);

        const token = jwt.sign({ id: result.insertId, username }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ message: 'User registered', token, user: { id: result.insertId, username } });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed', details: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const user = users[0];

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ message: 'Logged in successfully', token, user: { id: user.id, username: user.username, preferences: user.preferences } });
    } catch (err) {
        res.status(500).json({ error: 'Login failed', details: err.message });
    }
});

export default router;
