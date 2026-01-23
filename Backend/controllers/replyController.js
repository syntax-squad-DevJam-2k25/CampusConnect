const Reply = require("../models/Reply");
const Post = require("../models/Post");

exports.addReply = async (req, res) => {
  try {
    const { text, isAnonymous } = req.body;
    const { postId } = req.params;

    if (!text) {
      return res.status(400).json({ message: "Reply text required" });
    }

    const reply = await Reply.create({
      postId,
      text,
      repliedBy: req.user._id,
      isAnonymous
    });

    // increment reply count
    await Post.findByIdAndUpdate(postId, {
      $inc: { repliesCount: 1 }
    });

    res.status(201).json({
      success: true,
      reply
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to add reply" });
  }
};
