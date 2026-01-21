const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ["post", "reply"],
      required: true
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    reason: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
