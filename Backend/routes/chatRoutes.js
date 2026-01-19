const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createNewChat,
  getAllChats,
} = require("../controllers/chatController");

router.post("/create-new-chat", authMiddleware, createNewChat);
router.get("/get-all-chats", authMiddleware, getAllChats);

module.exports = router;
