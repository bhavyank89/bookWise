import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.status(200).send("Backend in working fine");
    } catch (err) {
        console.error("❌ Error fetching users:", err.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;
