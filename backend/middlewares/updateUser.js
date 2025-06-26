import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Memory storage for in-memory buffer uploads (Vercel-safe)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary upload function with dynamic resource type
const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const mimetype = file.mimetype || '';
        let resource_type = 'raw';

        if (mimetype.startsWith('image/')) resource_type = 'image';
        else if (mimetype.startsWith('video/')) resource_type = 'video';

        const stream = cloudinary.uploader.upload_stream(
            { resource_type },
            (error, result) => {
                if (error) {
                    reject({ message: 'Error uploading to Cloudinary', error });
                } else {
                    resolve(result);
                }
            }
        );

        stream.end(file.buffer);
    });
};

// Multer middleware for handling fields
const uploadAndCloudinary = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'uniIdFile', maxCount: 1 },
]);

// Processing uploaded files and pushing to Cloudinary
const uploadAndProcessFiles = async (req, res, next) => {
    const avatarFile = req.files.avatar?.[0] || null;
    const uniIdFile = req.files.uniIdFile?.[0] || null;

    try {
        if (avatarFile) {
            const result = await uploadToCloudinary(avatarFile);
            req.body.avatarUrl = result.secure_url;
        }

        if (uniIdFile) {
            const result = await uploadToCloudinary(uniIdFile);
            req.body.uniIdUrl = result.secure_url;
        }

        next();
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: 'Error uploading to Cloudinary' });
    }
};

export { uploadAndCloudinary, uploadAndProcessFiles };
