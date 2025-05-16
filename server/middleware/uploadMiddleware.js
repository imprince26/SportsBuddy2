import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import {v2 as cloudinary} from 'cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'SportsBuddy-2',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      return `${file.fieldname}-${uniqueSuffix}`;
    },
  },
});
// Use memory storage instead of CloudinaryStorage
// const storage = multer.memoryStorage();

export const handleImageUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed!'), false);
      return;
    }
    // Accept file
    cb(null, true);
  }
});