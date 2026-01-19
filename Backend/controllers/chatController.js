const Chat = require("../models/Chat");
const { getIO } = require("../config/socket");

/* =========================
   SEND MESSAGE (TEXT / EMOJI)
   ========================= */

   exports.createNewChat = async (req, res) => {
  res.json({ success: true, message: "createNewChat working" });
};

exports.getAllChats = async (req, res) => {
  res.json({ success: true, message: "getAllChats working" });
};

exports.sendFile = async (req, res) => {
  res.json({ success: true, message: "sendFile working" });
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, text, emoji } = req.body;

    const messageType = emoji ? "emoji" : "text";

    const messageData = {
      sender: req.user._id,
      text,
      emoji,
      messageType,
    };

    // ✅ Save message in DB
    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: messageData },
      lastMessage: text || emoji,
    });

    // 🔥 Emit socket event
    getIO().to(chatId).emit("receive-message", {
      chatId,
      ...messageData,
    });

    res.json({
      success: true,
      message: "Message sent",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
