import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "mock-cloud-name",
  api_key: process.env.CLOUDINARY_API_KEY || "mock-api-key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "mock-api-secret",
});

export const uploadOnCloudinary = async (
  file: Blob
): Promise<string | null> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            // In development fallback: if credentials are placeholders, return a mock URL
            if (process.env.CLOUDINARY_CLOUD_NAME === "mock-cloud-name" || !process.env.CLOUDINARY_API_KEY) {
              console.log("Mock Mode: Returning placeholder image URL instead");
              resolve("https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600");
              return;
            }
            resolve(null);
          } else {
            resolve(result?.secure_url || null);
          }
        }
      );
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Error in uploadOnCloudinary:", error);
    // In development fallback
    if (process.env.CLOUDINARY_CLOUD_NAME === "mock-cloud-name" || !process.env.CLOUDINARY_API_KEY) {
      return "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600";
    }
    return null;
  }
};
