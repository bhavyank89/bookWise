import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const folderName = 'user';

        let resource_type = 'raw';
        if (file.mimetype.startsWith('image/')) resource_type = 'image';
        else if (file.mimetype.startsWith('video/')) resource_type = 'video';

        const extension = file.mimetype.split('/')[1] || 'bin';

        return {
            folder: folderName,
            resource_type,
            format: extension,
            public_id: `${file.fieldname}-${Date.now()}`,
        };
    },
});

// Initialize multer
const upload = multer({ storage });

// Middleware to upload avatar and university ID
const uploadUser = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'universityID', maxCount: 1 },
]);

export default uploadUser;
export { upload };
