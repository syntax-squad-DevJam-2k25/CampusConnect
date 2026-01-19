const upload = require("../config/multer");

exports.profileUpload = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);
