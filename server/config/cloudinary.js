import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multerUpload = multer({
  storage: multer.memoryStorage(),
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

const uploadBufferToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'SportsBuddy-2',
        public_id: `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
};

const normalizeFiles = (req) => {
  if (req.file) return [req.file];
  if (Array.isArray(req.files)) return req.files;
  if (req.files && typeof req.files === 'object') {
    return Object.values(req.files).flat();
  }
  return [];
};

const attachCloudinaryUploads = async (req, _res, next) => {
  try {
    const files = normalizeFiles(req);
    if (files.length === 0) {
      next();
      return;
    }

    const results = await Promise.all(files.map(uploadBufferToCloudinary));
    files.forEach((file, index) => {
      const result = results[index];
      file.path = result.secure_url;
      file.filename = result.public_id;
      file.width = result.width;
      file.height = result.height;
      file.format = result.format;
    });

    next();
  } catch (error) {
    next(error);
  }
};

const upload = {
  single: (fieldName) => [multerUpload.single(fieldName), attachCloudinaryUploads],
  array: (fieldName, maxCount) => [multerUpload.array(fieldName, maxCount), attachCloudinaryUploads],
  fields: (fields) => [multerUpload.fields(fields), attachCloudinaryUploads],
};

const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

const uploadImage = async (file, options = {}) => {
  try {

   const uploadOptions = {
      folder: 'SportsBuddy-2',
      ...options,
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
        ...(options.transformation || [])
      ]
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

// Helper function to extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  try {
    // Example URL: https://res.cloudinary.com/dpsi7ncet/image/upload/v1764098691/venues/ytf7ocojikbdyjuseqxu.jpg
    // Extract: venues/ytf7ocojikbdyjuseqxu
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    // Get everything after 'upload' and the version (v1234...)
    const pathParts = parts.slice(uploadIndex + 2); // Skip 'upload' and version
    const fullPath = pathParts.join('/');

    // Remove file extension
    const publicId = fullPath.substring(0, fullPath.lastIndexOf('.'));
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
};

export { upload, deleteImage, uploadImage, cloudinary, extractPublicIdFromUrl };
