const path = require("path");
const cloudinary = require("../config/cloudinary");
//const axios = require("axios");

/**
 * Upload a file to Cloudinary and verify its URL.
 * @param {Object} file - file object from multer
 * @param {string} folder - folder name in Cloudinary
 * @returns {Object} { url, publicId, resourceType, verified }
 */
const uploadToCloudinary = async (file, folder) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      console.error("❌ No file received!");
      return reject(new Error("No file received"));
    }

    console.log("📦 File info:", {
      name: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
    console.log("📂 Folder:", folder);

    const ext = path.extname(file.originalname).toLowerCase();

    const isImage = file.mimetype.startsWith("image");
    const isVideo = file.mimetype.startsWith("video");
    const isPDF = file.mimetype === "application/pdf";
    const isDoc = file.mimetype.includes("word") || 
                  file.mimetype.includes("document") ||
                  file.mimetype.includes("msword");
    const isExcel = file.mimetype.includes("excel") || 
                   file.mimetype.includes("spreadsheet");
    const isPPT = file.mimetype.includes("powerpoint") || 
                  file.mimetype.includes("presentation");

    // Determine resource type based on file
    const resourceType = isImage
      ? "image"
      : isVideo
      ? "video"
      : "raw"; // PDFs and other docs

    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^\w\-]/g, "_");

    const publicId = `${safeName}_${Date.now()}`;

    console.log("🔹 Uploading as resource type:", resourceType);
    console.log("🔹 Public ID:", publicId);

    // Build upload options based on file type
    const uploadOptions = {
      folder,
      public_id: publicId,
      type: "upload",
      access_mode: "public", // Make raw files publicly accessible
    };

    if (isImage) {
      uploadOptions.resource_type = "image";
    } else if (isVideo) {
      uploadOptions.resource_type = "video";
    } else {
      // For PDFs, docs, excel, ppt, etc.
      uploadOptions.resource_type = "raw";
      // Don't set format - let Cloudinary detect from original filename
      // This ensures the file extension is preserved in the URL
    }

    console.log("🔹 Upload options:", uploadOptions);

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary upload error:", error);
          return reject(error);
        }
        console.log("✅ Cloudinary URL:", result.secure_url);
        
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type
        });
      }
    ).end(file.buffer);
  });
};

module.exports = uploadToCloudinary;