const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true
    },

    media: {
      type: {
        type: String, // image | video | file
        enum: ["image", "video", "file"],
      },
      url: {
        type: String // Cloudinary URL
      },
      publicId: {
        type: String // Cloudinary public_id (for delete)
      }
    },

    postedBy: {
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
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    repliesCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
