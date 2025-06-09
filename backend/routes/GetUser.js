import express from 'express';
import User from '../models/User.js';
import FetchUser from '../middlewares/FetchUser.js';

const router = express.Router();

router.use(express.json());

router.post('/', FetchUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
