import express from 'express';
import User from '../models/User.js';
import FetchUser from '../middlewares/FetchUser.js';

const router = express.Router();
router.use(express.json());

// ---------------- FetchAllUser Route ----------------
router.get('/', async (req, res) => {
    let success = false;
    try {
        const users = await User.find().sort({ createdAt: -1 });
        if (!users) {
            return res.status(404).json({ success, error: "No users found" });
        }
        success = true;
        res.status(201).json({ success, users });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success, error: "Internal Server Error" });
    }
});


export default router;
