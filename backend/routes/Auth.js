import express from 'express';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import uploadUser from '../middlewares/uploadUser.js';
import fetchUser from '../middlewares/FetchUser.js';
import { uploadAndCloudinary, uploadAndProcessFiles } from '../middlewares/updateUser.js'; // Correct path to the middleware
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();
router.use(express.json());

const JWT_SECRET = 'bookWise@'; // Hardcoded secret (avoid in production)

// ---------------- Register Route ----------------
router.post('/createUser/', uploadUser, async (req, res) => {
    let success = false;
    const { name, email, password, uniId } = req.body;
    const avatar = req.files?.avatar; // assuming your multer middleware adds this
    const uniIdDoc = req.files?.universityID;

    try {
        // Validation
        if (!avatar || !uniIdDoc) {
            return res.status(400).json({ success, error: "Avatar and University ID are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            // Delete uploaded files if user already exists
            await cloudinary.uploader.destroy(avatar.public_id);
            await cloudinary.uploader.destroy(uniIdDoc.public_id);
            return res.status(400).json({ success, error: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            uniId,
            avatar,
            uniIdDoc,
        });

        const payload = { user: { id: newUser._id } };
        const token = jwt.sign(payload, JWT_SECRET);

        success = true;
        res.status(201).json({ success, token });

    } catch (error) {
        console.error(error.message);

        // If avatar or uniIdDoc uploaded, delete them
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
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success, error: "Invalid credentials" });
        }

        const payload = { user: { id: user._id } };
        const token = jwt.sign(payload, JWT_SECRET);

        success = true;
        res.json({ success, token });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success, error: "Internal Server Error" });
    }
});

// -------------- edit User -------------------------------
router.post('/updateuser', fetchUser, uploadAndCloudinary, uploadAndProcessFiles, async (req, res) => {
    const { name, email, uniId } = req.body;
    const avatarUrl = req.body.avatarUrl;  // Cloudinary URL for avatar
    const uniIdUrl = req.body.uniIdUrl;    // Cloudinary URL for university ID

    // Ensure that the necessary fields are provided
    if (!name || !email || !uniId) {
        return res.status(400).json({ message: 'All fields (name, email, university ID) are required.' });
    }

    console.log(req);

    try {
        // Make sure the user is authenticated
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If avatar URL exists, update the user's avatar
        if (avatarUrl) {
            user.avatar = [{ path: avatarUrl }];
        }

        // If university ID URL exists, update the user's university ID document
        if (uniIdUrl) {
            user.uniIdDoc = [{ path: uniIdUrl }];
        }

        // Update other user details
        user.name = name;
        user.email = email;
        user.uniId = uniId;

        // Save the updated user document
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

        // Iterate over borrowed books to return them
        for (const borrowed of user.books) {
            const book = borrowed.book;
            if (book) {
                // Remove user from borrowers list
                book.borrowers = book.borrowers.filter(borrowerId => borrowerId.toString() !== userId);
                // Increment availability
                book.available += 1;
                await book.save();
            }
        }

        // Delete user document
        await User.findByIdAndDelete(userId);

        res.status(200).json({ success: true, message: 'User deleted and books returned successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


export default router;
