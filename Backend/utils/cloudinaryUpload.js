const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const resourceType =
      file.mimetype.startsWith("video") ? "video" : "auto";

    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          type: result.resource_type
        });
      }
    ).end(file.buffer);
  });
};

module.exports = uploadToCloudinary;
