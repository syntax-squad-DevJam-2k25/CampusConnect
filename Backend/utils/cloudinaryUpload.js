const path = require("path");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {

    const ext = path.extname(file.originalname).toLowerCase();

    const isImage = file.mimetype.startsWith("image");
    const isVideo = file.mimetype.startsWith("video");

    const resourceType = isImage
      ? "image"
      : isVideo
      ? "video"
      : "raw"; // ✅ ALWAYS raw for pdf/doc/xlsx

    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^\w\-]/g, "_");

    const publicId = `${safeName}_${Date.now()}${ext}`;

    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: publicId,
      },
      (error, result) => {
        if (error) return reject(error);

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    ).end(file.buffer);
  });
};

module.exports = uploadToCloudinary;