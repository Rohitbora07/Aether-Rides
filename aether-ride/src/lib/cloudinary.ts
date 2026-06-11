import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Before sending to Cloudinary:

// Blob/File → ArrayBuffer
// ArrayBuffer → Buffer
// Buffer → Cloudinary stream


const uploadOnCloudinary = async (file: Blob): Promise<string | null> => {
    if (!file) return null;
    try {

        // File/Blob data cannot be directly uploaded to Cloudinary stream so first convert it into ArrayBuffer (raw binary data)
        const arrayBuffer = await file.arrayBuffer();

         // Cloudinary upload_stream works with Node.js Buffer therefore convert ArrayBuffer -> Buffer
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                // auto automatically detects image/video/pdf/etc
                { resource_type: "auto" },

                // Runs after upload completes
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        // secure_url is the uploaded file URL from Cloudinary
                        resolve(result?.secure_url ?? null);
                    }
                })
            uploadStream.end(buffer);
        })
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return null;
    }
}

export default uploadOnCloudinary;