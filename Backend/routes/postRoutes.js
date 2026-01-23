const express = require("express");
const router = express.Router();


const authMiddleware = require("../middleware/authMiddleware");
const { communityUpload } = require("../middleware/upload.middleware");
const { createPost,getAllPosts, deletePost, toggleLikePost } = require("../controllers/postcontroller");

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
router.delete(
  "/delete/:postId",
  authMiddleware,
  deletePost
);


router.post(
  "/like/:postId",
  authMiddleware,
  toggleLikePost
);

module.exports = router;
