const express = require("express");
const router = express.Router();


const authMiddleware = require("../middleware/authMiddleware");
const { communityUpload } = require("../middleware/upload.middleware");
const { createPost,getAllPosts } = require("../controllers/postcontroller");

console.log("communityUpload:", communityUpload);
console.log("authMiddleware:", authMiddleware);

router.post(
  "/create",
  authMiddleware,
  communityUpload,
  createPost
);

router.get(
  "/",
  authMiddleware,
  getAllPosts
);

module.exports = router;
