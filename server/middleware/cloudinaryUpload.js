import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { v4 as uuidv4 } from "uuid";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const uniqueName = `${uuidv4()}-${Date.now()}`;
    return {
      folder: "events", // Cloudinary folder for event images
      public_id: uniqueName,
      format: "jpg", // Set directly as a string
      transformation: [
        { width: 800, height: 800, crop: "limit" }, // Optional: resize images
        { quality: "auto" },
      ],
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed (JPEG, JPG, PNG, GIF)"), false);
  }
};

export const cloudinaryUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 5, // Max 5 files
  },
  fileFilter: fileFilter,
});
