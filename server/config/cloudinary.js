import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
    files: 5, // Maximum number of files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WebP are allowed.'), false);
    }
  },
})

const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

const uploadImage = async (file, folder = "SportsBuddy-2") => {
  try {

    const uploadOptions = {
      folder: folder,
      width: 500,
      height: 500,
      quality: 'auto',
      crop: "scale"
    };

    // If file is from Multer (has buffer)
    if (file.buffer) {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, uploadOptions);
      return result;
    }
    // If file has path (from other upload methods)
    else if (file.path) {
      const result = await cloudinary.uploader.upload(file.path, uploadOptions);
      return result;
    }
    // If file is a temp file path string
    else if (typeof file === 'string') {
      const result = await cloudinary.uploader.upload(file, uploadOptions);
      return result;
    } else {
      throw new Error('Invalid file format for upload');
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error.message);
    throw error;
  }
}



export { upload, deleteImage, uploadImage, cloudinary };