import axios from "axios";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const uploadWithProgress = async (
  files,
  onProgress,
  type = "event",
  retryCount = 0
) => {
  const formData = new FormData();
  const fieldName = type === "event" ? "eventImages" : "avatar";

  Array.from(files).forEach((file) => {
    formData.append(fieldName, file);
  });

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/upload/${type}`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress?.(progress);
        },
      }
    );

    return response.data.fileUrls || response.data.fileUrl;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return uploadWithProgress(files, onProgress, type, retryCount + 1);
    }
    throw error;
  }
};

export const validateFile = (file, maxSize = 5) => {
  const errors = [];

  // Check file type
  if (!file.type.startsWith("image/")) {
    errors.push("File must be an image");
  }

  // Check file size (maxSize in MB)
  if (file.size > maxSize * 1024 * 1024) {
    errors.push(`File size must be less than ${maxSize}MB`);
  }

  return errors;
};

export const validateFiles = (files, maxFiles = 5, maxSize = 5) => {
  const errors = [];

  // Check number of files
  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
    return errors;
  }

  // Check each file
  files.forEach((file) => {
    const fileErrors = validateFile(file, maxSize);
    if (fileErrors.length > 0) {
      errors.push(`${file.name}: ${fileErrors.join(", ")}`);
    }
  });

  return errors;
};