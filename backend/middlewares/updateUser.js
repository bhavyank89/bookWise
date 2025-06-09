import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer storage to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary upload function
const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            (error, result) => {
                if (error) {
                    reject({ message: 'Error uploading to Cloudinary', error });
                } else {
                    resolve(result);
                }
            }
        );
        stream.end(file.buffer); // End the stream after file buffer is passed
    });
};

// Middleware for handling file uploads and Cloudinary upload
const uploadAndCloudinary = upload.fields([{ name: 'avatar' }, { name: 'uniIdFile' }]);

const uploadAndProcessFiles = async (req, res, next) => {
    const avatarFile = req.files.avatar ? req.files.avatar[0] : null;
    const uniIdFile = req.files.uniIdFile ? req.files.uniIdFile[0] : null;

    try {
        // Upload avatar file to Cloudinary if present
        if (avatarFile) {
            const result = await uploadToCloudinary(avatarFile);
            req.body.avatarUrl = result.secure_url; // Store URL for further use
        }

        // Upload university ID file to Cloudinary if present
        if (uniIdFile) {
            const result = await uploadToCloudinary(uniIdFile);
            req.body.uniIdUrl = result.secure_url; // Store URL for further use
        }

        // Move to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: 'Error uploading to Cloudinary' });
    }
};

export { uploadAndCloudinary, uploadAndProcessFiles };
