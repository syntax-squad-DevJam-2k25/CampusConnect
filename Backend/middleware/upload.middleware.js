const multer = require("multer");

// Memory storage (required for Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Existing profile uploads (KEEP THIS)
const profileUpload = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "resume", maxCount: 1 }
]);

// Community uploads (NEW – single file)
const communityUpload = upload.single("file");

module.exports = {
  upload,
  profileUpload,
  communityUpload
};
