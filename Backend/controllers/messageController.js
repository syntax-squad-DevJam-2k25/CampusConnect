const Chat = require("../models/chat");
const Message = require("../models/message");

exports.sendMessage = async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();

    await Chat.findByIdAndUpdate(req.body.chatId, {
      lastMessage: savedMessage._id,
      $inc: { unreadMessageCount: 1 },
    });

    res.status(201).json({
      success: true,
      message: "Message sent",
      data: savedMessage,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chatId: req.params.chatId,
    }).sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
