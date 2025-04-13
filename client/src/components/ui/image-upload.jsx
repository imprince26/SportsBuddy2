import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import UploadProgress from "./upload-progress";
import { uploadWithProgress, validateFiles } from "@/utils/uploadUtils";

const ImageUpload = ({ 
  onChange,
  onUploadComplete,
  maxFiles = 5, 
  maxSize = 5, // in MB
  existingImages = [],
  onRemove,
  className 
}) => {
  const [previews, setPreviews] = useState(existingImages);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setError("");
    setUploadProgress(0);

    // Validate files
    const validationErrors = validateFiles(files, maxFiles - previews.length, maxSize);
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    try {
      setIsUploading(true);

      // Upload files with progress tracking
      const uploadedUrls = await uploadWithProgress(
        files,
        (progress) => setUploadProgress(progress)
      );

      // Create preview URLs
      const newPreviews = files.map((file, index) => ({
        url: URL.createObjectURL(file),
        uploadedUrl: Array.isArray(uploadedUrls) ? uploadedUrls[index] : uploadedUrls
      }));

      setPreviews(prev => [...prev, ...newPreviews]);
      onUploadComplete?.(uploadedUrls);
      onChange(files);
    } catch (err) {
      setError("Failed to upload files. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (index) => {
    setPreviews(prev => {
      const newPreviews = [...prev];
      if (newPreviews[index].url.startsWith('blob:')) {
        URL.revokeObjectURL(newPreviews[index].url);
      }
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    onRemove?.(index);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4 flex-wrap">
        {previews.map((preview, index) => (
          <div key={index} className="relative group">
            <img
              src={preview.url || preview}
              alt={`Preview ${index + 1}`}
              className="w-24 h-24 object-cover rounded-lg border border-[#2E7D32]/30"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {previews.length < maxFiles && !isUploading && (
          <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-[#2E7D32]/30 rounded-lg cursor-pointer hover:border-[#4CAF50]/50 transition-colors">
            <ImagePlus className="w-8 h-8 text-[#4CAF50]" />
            <span className="text-xs text-[#81C784] mt-2">Add Image</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {isUploading && (
        <UploadProgress 
          progress={uploadProgress} 
          error={error}
          className="mt-2"
        />
      )}

      {error && !isUploading && (
        <p className="text-sm text-[#FF5252] mt-2">{error}</p>
      )}

      {previews.length === maxFiles && (
        <p className="text-sm text-[#81C784] mt-2">
          Maximum number of images reached
        </p>
      )}
    </div>
  );
};

export default ImageUpload;