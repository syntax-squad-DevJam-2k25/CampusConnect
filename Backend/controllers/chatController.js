const Chat = require("../models/chat");

exports.createNewChat = async (req, res) => {
  try {
    const chat = new Chat(req.body);
    const savedChat = await chat.save();

    res.status(201).json({
      success: true,
      message: "Chat created successfully",
      data: savedChat,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      members: { $in: req.user.userId },
    })
      .populate("members")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Chats fetched",
      data: chats,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
