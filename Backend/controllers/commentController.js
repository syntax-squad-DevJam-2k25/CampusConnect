import Comment from "../models/Comment.js";
import { getIO } from "../config/socket.js";

export const createComment = async (req, res) => {
  try {
    const { text, parentId } = req.body;
    const { postId } = req.params;

    if (!text) {
      return res.status(400).json({ message: "Comment text required" });
    }

    if (parentId) {
      // Reply to a comment
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }

      const reply = {
        userId: req.user._id,
        text,
      };

      parentComment.replies.push(reply);
      await parentComment.save();

      await parentComment.populate("replies.userId", "name profileImage");

      const formattedReply = parentComment.replies[parentComment.replies.length - 1];

      // SOCKET EMIT
      const io = getIO();
      io.to(postId.toString()).emit("reply_added", { parentId, reply: formattedReply });

      return res.status(201).json(formattedReply);
    } else {
      // New comment
      const comment = await Comment.create({
        postId,
        userId: req.user._id,
        text,
      });

      await comment.populate("userId", "name profileImage");

      const formattedComment = {
        _id: comment._id,
        text: comment.text,
        username: comment.userId.name,
        userId: comment.userId._id,
        profileImage: comment.userId.profileImage,
        createdAt: comment.createdAt,
        replies: [],
        reactions: [],
      };

      // SOCKET EMIT
      const io = getIO();
      io.to(postId.toString()).emit("comment_added", formattedComment);

      return res.status(201).json(formattedComment);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
/* ================= GET COMMENTS BY POST ================= */
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId })
      .populate("userId", "name profileImage")
      .populate("replies.userId", "name profileImage")
      .sort({ createdAt: -1 });

    const formatted = comments.map((c) => ({
      _id: c._id,
      text: c.text,
      username: c.userId.name,
      userId: c.userId._id,
      profileImage: c.userId.profileImage,
      createdAt: c.createdAt,
      replies: c.replies.map((r) => ({
        _id: r._id,
        text: r.text,
        userId: r.userId._id,
        username: r.userId.name,
        profileImage: r.userId.profileImage,
        createdAt: r.createdAt,
      })),
      reactions: c.reactions,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE COMMENT ================= */
export const updateComment = async (req, res) => {
  console.log("Update comment function reached");
  try {
    const { commentId } = req.params;
    const { text } = req.body;
  console.log("Update comment called");
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    comment.text = text;
    await comment.save();
    await comment.populate("userId", "name profileImage");

    const formattedComment = {
      _id: comment._id,
      text: comment.text,
      username: comment.userId.name,
      userId: comment.userId._id,
      createdAt: comment.createdAt,
      replies: comment.replies,
      reactions: comment.reactions,
    };
   
 const io = getIO();
    io.to(comment.postId.toString()).emit(
      "comment_updated",
      formattedComment
    );

    return res.json(formattedComment);
  
  } catch (err) {
    console.error("Edit error:", err);
  }
};

/* ================= DELETE COMMENT ================= */
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await comment.deleteOne();
     console.log(`Comment ${comment.postId} deleted successfully`);
    
const io = getIO();
 console.log("io exists:", !!io);
    io.to(comment.postId.toString()).emit("comment_deleted", commentId);


return res.status(200).json({
  success: true,
  message: "Comment deleted",
  commentId
});

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADD REPLY ================= */
export const addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Reply text missing" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const reply = {
      userId: req.user._id,
      username: req.user.name,
      text,
      createdAt: new Date(),
    };

    comment.replies.push(reply);
    await comment.save();

    const savedReply = comment.replies.at(-1);

    res.status(200).json({ reply: savedReply });

    io.to(comment.postId.toString()).emit("reply_added", {
      commentId,
      reply: savedReply,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= EDIT REPLY ================= */
export const editReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const { text } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (reply.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    reply.text = text;
    await comment.save();

    res.json({ commentId, reply });

    io.to(comment.postId.toString()).emit("reply_updated", {
      commentId,
      reply,
    });
  } catch (err) {
    res.status(500).json({ message: "Edit reply failed" });
  }
};

/* ================= DELETE REPLY ================= */
export const deleteReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (reply.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    reply.deleteOne();
    await comment.save();

    res.json({ commentId, replyId });

    io.to(comment.postId.toString()).emit("reply_deleted", {
      commentId,
      replyId,
    });
  } catch (err) {
    res.status(500).json({ message: "Delete reply failed" });
  }
};

/* ================= REACT TO COMMENT ================= */
export const reactToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { emoji } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const existing = comment.reactions.find(
      (r) =>
        r.userId.toString() === req.user._id.toString() &&
        r.emoji === emoji
    );

    if (existing) {
      comment.reactions = comment.reactions.filter((r) => r !== existing);
    } else {
      comment.reactions.push({
        userId: req.user._id,
        emoji,
      });
    }

    await comment.save();

    res.json({
      commentId,
      reactions: comment.reactions,
    });

    io.to(comment.postId.toString()).emit("reaction_updated", {
      commentId,
      reactions: comment.reactions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
