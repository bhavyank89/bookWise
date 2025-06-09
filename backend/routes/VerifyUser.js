import express from 'express';
import User from '../models/User.js';

const router = express.Router();
router.use(express.json());

router.put('/verify', async (req, res) => {
    try {
        const { id } = req.body; 

        if (!id) {
            return res.status(400).json({ success: false, error: "User ID is required" });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        if (user.isverified) {
            return res.status(400).json({ success: false, error: "User is already verified" });
        }

        user.isverified = true;
        const updatedUser = await user.save();

        return res.status(200).json({
            success: true,
            message: "User verified successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isverified: updatedUser.isverified
            }
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

router.put('/deverify', async (req, res) => {
    try {
        const { id } = req.body; 

        if (!id) {
            return res.status(400).json({ success: false, error: "User ID is required" });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        user.isverified = false;
        const updatedUser = await user.save();

        return res.status(200).json({
            success: true,
            message: "User verification removed successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isverified: updatedUser.isverified
            }
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

export default router;
