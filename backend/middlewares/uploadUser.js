import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const resource_type = file.mimetype.startsWith("image/")
            ? "image"
            : file.mimetype.startsWith("video/")
                ? "video"
                : "raw";

        const extension = file.mimetype.split("/")[1] || "bin";
        const userName = req.body.name || "unknown-user";
        const safeName = userName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/gi, "");

        return {
            folder: `users/${safeName}`,
            resource_type,
            format: extension,
            public_id: `${file.fieldname}-${Date.now()}`,
        };
    },
});

const upload = multer({ storage });

const uploadUser = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'universityID', maxCount: 1 },
]);

export default uploadUser;
export { upload };
