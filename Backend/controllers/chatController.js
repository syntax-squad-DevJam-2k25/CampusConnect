const Chat = require("../models/Chat");
const { getIO } = require("../config/socket");
const mongoose = require("mongoose");

/* =========================
   SEND MESSAGE (TEXT / EMOJI)
   ========================= */


exports.getAllChats = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("👤 userId:", userId);

    const chats = await Chat.find({ members: userId })
      .populate("members", "name profileImage")
      .sort({ updatedAt: -1 });

    console.log("💬 chats found:", chats.length);

    const formattedChats = chats.map((chat) => {
      console.log("🔍 chat.lastMessage:", chat.lastMessage);
      console.log("🔍 chat.members:", chat.members);

      const otherUser = chat.members.find(
        (m) => m._id.toString() !== userId.toString()
      );

      console.log("👥 otherUser:", otherUser);

      return {
        _id: chat._id,
        otherUser,
        lastMessage: chat.lastMessage?.trim() || null,
        lastMessageTime: chat.updatedAt,
        unreadCount: 0,
      };
    });

    res.json({ success: true, chats: formattedChats });
  } catch (err) {
    console.error("🔥 getAllChats ERROR:", err); // full error, not just message
    res.status(500).json({ success: false, error: err.message });
  }
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
    console.log("✏️ editMessage called");
    console.log("📦 body:", req.body);

    const { chatId, messageId, newText } = req.body;

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, "messages._id": messageId },
      {
        $set: {
          "messages.$.text": newText,
          "messages.$.edited": true,
        },
      },
      { new: true }
    );

    if (!updatedChat) {
      return res.status(404).json({ message: "Chat or message not found" });
    }

    // ✅ check if edited message is the last one
    const messages = updatedChat.messages;
    const lastMsg = messages[messages.length - 1];
    const isLast = lastMsg._id.toString() === messageId.toString();

    if (isLast) {
      // ✅ update lastMessage field in DB
      await Chat.findByIdAndUpdate(chatId, {
        $set: { lastMessage: newText },
      });
    }

    getIO().to(chatId).emit("message-edited", {
      chatId,
      messageId,
      newText,
      newLastMessage: isLast ? newText : null,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("editMessage ERROR:", error);
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

    const updatedChat = await Chat.findById(chatId);
    const lastMsg = updatedChat.messages[updatedChat.messages.length - 1];

    const newLastMessage = lastMsg
      ? lastMsg.text || lastMsg.emoji || ""
      : null; // ✅ null when no messages left, not ""

    await Chat.findByIdAndUpdate(chatId, {
      $set: { lastMessage: newLastMessage },
    });

    getIO().to(chatId).emit("message-deleted", {
      chatId,
      messageId,
      newLastMessage, // ✅ will be null when no messages
    });

    res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
