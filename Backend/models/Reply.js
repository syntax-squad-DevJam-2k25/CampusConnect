const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },

    text: {
      type: String,
      required: true,
      trim: true
    },

    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    isAnonymous: {
      type: Boolean,
      default: false
    },

    anonymousName: {
      type: String,
      default: "Anonymous"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reply", replySchema);
