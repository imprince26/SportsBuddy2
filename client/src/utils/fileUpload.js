export const handleFileUpload = async (files, type = "event") => {
  if (!files || files.length === 0) return [];

  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append(type === "event" ? "eventImages" : "avatar", file);
  });

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/${type}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.fileUrls;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
};