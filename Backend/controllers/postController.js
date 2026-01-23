const { getIO } = require("../config/socket");
const Post = require("../models/Post");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

exports.createPost = async (req, res) => {
  try {
    const { content, isAnonymous } = req.body;

    // ❌ Block empty post
    if (!content && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Post must contain text or file"
      });
    }

    let media = null;

    // ✅ Handle file upload (image / video / pdf / excel / word)
    if (req.file) {
      let folder = "community/files";
      let mediaType = "file";

      if (req.file.mimetype.startsWith("image")) {
        folder = "community/images";
        mediaType = "image";
      } else if (req.file.mimetype.startsWith("video")) {
        folder = "community/videos";
        mediaType = "video";
      }

      const result = await uploadToCloudinary(req.file, folder);

      media = {
        type: mediaType,          // 🔥 FIXED
        url: result.url,
        publicId: result.publicId
      };
    }

    const post = await Post.create({
      content: content?.trim() || "",
      media,
      postedBy: req.user._id,
      isAnonymous: isAnonymous === "true" || isAnonymous === true
    });

     getIO().emit("postCreated", post);

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create post"
    });
  }
};


exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("postedBy", "name profileImage") // adjust fields as per User model
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map((post) => ({
      _id: post._id,
      content: post.content,
      media: post.media,
      isAnonymous: post.isAnonymous,
      anonymousName: post.anonymousName,
      likesCount: post.likes.length,
      repliesCount: post.repliesCount,
      createdAt: post.createdAt,

      // 🔒 Hide identity if anonymous
      postedBy: post.isAnonymous
        ? { name: "Anonymous", profileImage: null }
        : post.postedBy
    }));

    res.status(200).json({
      success: true,
      count: formattedPosts.length,
      posts: formattedPosts
    });
  } catch (error) {
    console.error("Get All Posts Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch community posts"
    });
  }
};


exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user"
      });
    }

    const userId = req.user._id;
    const post = await Post.findById(postId);

     console.log("USER:", req.user);
     console.log("POST ID:", req.params.postId);


    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    // 🔐 OWNER CHECK
   if (post.postedBy.toString() !== userId.toString()) {
  return res.status(403).json({
    success: false,
    message: "You are not allowed to delete this post"
  });
}


    await post.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully"
    });

  } catch (error) {
    console.error("❌ Delete Post Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};




