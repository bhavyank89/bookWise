import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,      
});

// Define multer-storage-cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folderName = 'bookwise_user_files';

        return {
            folder: folderName,
            resource_type: file.mimetype.startsWith('image/') ? 'image' : 'raw',
            format: file.mimetype.split('/')[1] || 'pdf',
            public_id: `${file.fieldname}-${Date.now()}`,
        };
    },
});

// Initialize multer
const upload = multer({ storage });

// Middleware function to upload avatar and universityID
const uploadUser = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'universityID', maxCount: 1 },
]);

export default uploadUser;
