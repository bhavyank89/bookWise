import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
// import fs from "fs"; // ❌ Not suitable for Vercel
// import path from "path"; // ❌ Not suitable for Vercel

dotenv.config();

// const uploadDir = path.join(process.cwd(), "uploads"); // ❌
// if (!fs.existsSync(uploadDir)) { // ❌
//   fs.mkdirSync(uploadDir, { recursive: true }); // ❌
// }

let isCloudinaryConfigured = false;

// ------------------ Cloudinary Config ------------------
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  (async () => {
    try {
      await cloudinary.api.ping();
      console.log("✅ Cloudinary configured successfully");
      isCloudinaryConfigured = true;
    } catch (err) {
      console.warn("⚠️ Cloudinary ping test failed:", err.message || "Unknown error");
    }
  })();
} else {
  console.warn("⚠️ Missing Cloudinary credentials in .env file");
}

// ------------------ Multer Setup ------------------
const fileFilter = (_, file, cb) => {
  const allowedTypes = ["image/", "application/pdf", "video/"];
  if (allowedTypes.some((type) => file.mimetype.startsWith(type))) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format. Only images, PDFs, and videos are allowed."), false);
  }
};

// ✅ Replacing disk storage with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const fileType = file.mimetype;
    let resource_type = "image";
    if (fileType.startsWith("video/")) resource_type = "video";
    if (fileType === "application/pdf") resource_type = "raw";

    return {
      folder: "books",
      resource_type,
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`,
      format: undefined,
    };
  },
});

export const upload = multer({ storage, fileFilter });

export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: `Multer error: ${err.message}` });
  } else if (err) {
    return res.status(500).json({ success: false, message: `File upload error: ${err.message}` });
  }
  next();
};

// ------------------ Cloudinary Helpers ------------------
const getResourceType = (filePathOrId) => {
  const ext = filePathOrId.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "raw";
  if (["mp4", "mov", "avi", "wmv"].includes(ext)) return "video";
  return "image";
};

export const uploadToCloudinary = async (localFilePath, folder = "books") => {
  // if (!localFilePath || !fs.existsSync(localFilePath)) return null; // ❌

  try {
    if (!isCloudinaryConfigured) {
      console.log("ℹ️ Cloudinary not configured, using local file path");
      // const fileName = path.basename(localFilePath); // ❌
      return {
        // public_id: path.relative(process.cwd(), localFilePath), // ❌
        // secure_url: `/uploads/${fileName}`, // ❌
        local_file: true,
      };
    }

    const resourceType = getResourceType(localFilePath);
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: resourceType,
    });

    // fs.unlinkSync(localFilePath); // ❌ Remove local file
    return { public_id: result.public_id, secure_url: result.secure_url, local_file: false };
  } catch (err) {
    console.error("Upload error:", err);
    // if (fs.existsSync(localFilePath)) { // ❌
    //   const fileName = path.basename(localFilePath); // ❌
    return {
      // public_id: path.relative(process.cwd(), localFilePath), // ❌
      // secure_url: `/uploads/${fileName}`, // ❌
      local_file: true,
      error: err.message,
    };
    // }
    // return null;
  }
};

export const updateCloudinary = async (localFilePath, oldPublicId) => {
  // if (!localFilePath || !fs.existsSync(localFilePath)) return null; // ❌

  try {
    if (!isCloudinaryConfigured) {
      // const fileName = path.basename(localFilePath); // ❌
      return {
        // public_id: path.relative(process.cwd(), localFilePath), // ❌
        // secure_url: `/uploads/${fileName}`, // ❌
        local_file: true,
      };
    }

    if (oldPublicId && !oldPublicId.includes("uploads")) {
      const resourceType = getResourceType(oldPublicId);
      try {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: resourceType });
      } catch (err) {
        console.warn("Warning deleting old file from Cloudinary:", err.message);
      }
    }

    const folder = oldPublicId?.includes("/") ? oldPublicId.split("/").slice(0, -1).join("/") : "books";
    return await uploadToCloudinary(localFilePath, folder);
  } catch (err) {
    console.error("Update error:", err);
    // const fileName = path.basename(localFilePath); // ❌
    return {
      // public_id: path.relative(process.cwd(), localFilePath), // ❌
      // secure_url: `/uploads/${fileName}`, // ❌
      local_file: true,
      error: err.message,
    };
  }
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return { success: true };

  try {
    if (publicId.includes("uploads")) {
      // const filePath = path.join(process.cwd(), publicId); // ❌
      // if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // ❌
      return { success: true };
    }

    if (isCloudinaryConfigured) {
      const resourceType = getResourceType(publicId);
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }

    return { success: true };
  } catch (err) {
    console.error("Delete error:", err);
    return { success: false, error: err.message };
  }
};
