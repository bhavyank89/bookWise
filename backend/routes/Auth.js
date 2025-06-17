import express from 'express';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import uploadUser from '../middlewares/uploadUser.js';
import fetchUser from '../middlewares/FetchUser.js';
import { uploadAndCloudinary, uploadAndProcessFiles } from '../middlewares/updateUser.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();
router.use(express.json());

const JWT_SECRET = 'bookWise@'; // Hardcoded secret (avoid in production)

// ---------------- Register Route ----------------
router.post('/createUser/', uploadUser, async (req, res) => {
    let success = false;
    const { name, email, password, uniId, role = "User" } = req.body;
    const avatar = req.files?.avatar;
    const uniIdDoc = req.files?.universityID;

    try {
        // Role-based validation
        if (role === "User" && (!avatar || !uniIdDoc)) {
            return res.status(400).json({ success, error: "Avatar and University ID are required for User role" });
        }

        const userExists = await User.findOne({ email, role });
        if (userExists) {
            if (avatar) await cloudinary.uploader.destroy(avatar.public_id);
            if (uniIdDoc) await cloudinary.uploader.destroy(uniIdDoc.public_id);
            return res.status(400).json({ success, error: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            uniId,
            avatar,
            uniIdDoc,
            role,
        });

        const payload = { user: { id: newUser._id } };
        const token = jwt.sign(payload, JWT_SECRET);

        success = true;
        res.status(201).json({ success, token });

    } catch (error) {
        console.error(error.message);

        if (avatar) await cloudinary.uploader.destroy(avatar.public_id);
        if (uniIdDoc) await cloudinary.uploader.destroy(uniIdDoc.public_id);

        res.status(500).json({ success, error: "Internal Server Error" });
    }
});

// ---------------- Login Route ----------------
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        const { email, password, role = "User" } = req.body;

        const user = await User.findOne({ email, role });
        if (!user) {
            return res.status(400).json({ success, error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success, error: "Invalid credentials" });
        }

        const payload = { user: { id: user._id } };
        const token = jwt.sign(payload, JWT_SECRET);

        const cookieName = role === "Admin" ? "adminToken" : "token";

        res.cookie(cookieName, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // true on Vercel
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        success = true;
        res.json({ success, token });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success, error: "Internal Server Error" });
    }
});

// ------------------ LOGOUT ------------------
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax"
    });
    res.clearCookie('adminToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax"
    });

    res.json({ success: true, message: "Logged out" });
});


// -------------- edit User -------------------------------
router.post('/updateuser', fetchUser, uploadAndCloudinary, uploadAndProcessFiles, async (req, res) => {
    const { name, email, uniId } = req.body;
    const avatarUrl = req.body.avatarUrl;
    const uniIdUrl = req.body.uniIdUrl;

    if (!name || !email || !uniId) {
        return res.status(400).json({ message: 'All fields (name, email, university ID) are required.' });
    }


    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (avatarUrl) {
            user.avatar = [{ path: avatarUrl }];
        }

        if (uniIdUrl) {
            user.uniIdDoc = [{ path: uniIdUrl }];
        }

        user.name = name;
        user.email = email;
        user.uniId = uniId;

        await user.save();

        res.json({ success: true, updatedUser: user });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// ---------------- Delete User ----------------
router.delete('/deleteuser', fetchUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('books.book');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        for (const borrowed of user.books) {
            const book = borrowed.book;
            if (book) {
                book.borrowers = book.borrowers.filter(borrowerId => borrowerId.toString() !== userId);
                book.available += 1;
                await book.save();
            }
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({ success: true, message: 'User deleted and books returned successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

export default router;
