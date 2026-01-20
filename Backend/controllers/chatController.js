const Chat = require("../models/Chat");
const { getIO } = require("../config/socket");
const mongoose = require("mongoose");

/* =========================
   SEND MESSAGE (TEXT / EMOJI)
   ========================= */



exports.getAllChats = async (req, res) => {
  res.json({ success: true, message: "getAllChats working" });
};


/* =========================
   CREATE OR GET CHAT
   ========================= */
exports.createNewChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userId: otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ message: "UserId required" });
    }

    // 🔍 check if chat already exists
    let chat = await Chat.findOne({
      members: { $all: [userId, otherUserId] },
    });

    if (!chat) {
      chat = await Chat.create({
        members: [userId, otherUserId],
        messages: [],
      });
    }

    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* =========================
   SEND MESSAGE
   ========================= */
exports.sendMessage = async (req, res) => {
  console.log("➡️ [CONTROLLER] sendMessage called");

  try {
    const { chatId, text, emoji } = req.body;

    console.log("📦 Incoming:", { chatId, text, emoji });
    console.log("👤 Sender:", req.user?._id);

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      console.log("❌ Invalid chatId");
      return res.status(400).json({ message: "Invalid chatId" });
    }

    const messageType = emoji ? "emoji" : "text";

    const messageData = {
      sender: req.user._id,
      messageType,
    };

    if (text) messageData.text = text;
    if (emoji) messageData.emoji = emoji;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { messages: messageData },
        lastMessage: text || emoji || "",
      },
      { new: true, runValidators: true }
    );

    if (!updatedChat) {
      console.log("❌ Chat NOT FOUND:", chatId);
      return res.status(404).json({ message: "Chat not found" });
    }

    console.log("✅ Chat found:", updatedChat._id);
    console.log("✅ Messages length:", updatedChat.messages.length);
    console.log("✅ Last message:", updatedChat.messages.at(-1));

    getIO().to(chatId).emit("receive-message", {
      chatId,
      ...messageData,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("🔥 sendMessage ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};




/* =========================
   EDIT MESSAGE
   ========================= */
exports.editMessage = async (req, res) => {
  try {
    const { chatId, messageId, newText } = req.body;

    await Chat.updateOne(
      { _id: chatId, "messages._id": messageId },
      {
        $set: {
          "messages.$.text": newText,
          "messages.$.edited": true,
        },
      }
    );

    // 🔥 Emit socket event
    getIO().to(chatId).emit("message-edited", {
      chatId,
      messageId,
      newText,
    });

    res.json({
      success: true,
      message: "Message edited",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================
   DELETE MESSAGE
   ========================= */
exports.deleteMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.body;

    await Chat.findByIdAndUpdate(chatId, {
      $pull: { messages: { _id: messageId } },
    });

    // 🔥 Emit socket event
    getIO().to(chatId).emit("message-deleted", {
      chatId,
      messageId,
    });

    res.json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
