const { getIO } = require("../config/socket");
const Post = require("../models/Post");
const { checkPostSafety } = require("../util/aiModeration");
const uploadToCloudinary = require("../utils/cloudinaryUpload");


exports.createPost = async (req, res) => {
  console.log("\n================= CREATE POST API CALLED =================");
  try {
    const { content, isAnonymous } = req.body;


    // ❌ Block empty post FIRST
    if (!content && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Post must contain text or file"
      });
    }

    // 🔥 AI CHECK ONLY IF CONTENT EXISTS
    if (content) {
      const verdict = await checkPostSafety(content);
     if (verdict !== "SAFE") {
  return res.status(400).json({
    success: false,
    code: "AI_BLOCK",
    message: "This post contains offensive content. We cannot post it."
  });
}

    }

    let media = null;

    // ✅ Handle file upload
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
      console.log("☁️ Cloudinary result:", result);

      media = {
        type: mediaType,
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

          let totalLikes = 0;

    const formattedPosts = posts.map((post) => {
      const likesCount = post.likes.length;
      totalLikes += likesCount;
      return {
      _id: post._id,
      content: post.content,
      media: post.media,
      isAnonymous: post.isAnonymous,
      anonymousName: post.anonymousName,
      likes: post.likes,
      likesCount: post.likes.length,
      repliesCount: post.repliesCount,
      createdAt: post.createdAt,

      // 🔒 Hide identity if anonymous
      postedBy: post.isAnonymous
        ? { name: "Anonymous", profileImage: null }
        : post.postedBy
      };
    });

    res.status(200).json({
      success: true,
      count: formattedPosts.length,
      totalLikes,
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

exports.toggleLikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // 👎 DISLIKE (REMOVE LIKE)
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // 👍 LIKE
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: post.likes.length,
      postId
    });

  } catch (error) {
    console.error("❌ Toggle Like Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};




