import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        console.error("❌ Error fetching users:", err.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;
