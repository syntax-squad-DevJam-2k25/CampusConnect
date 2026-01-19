const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  sendMessage,
  getAllMessages,
} = require("../controllers/messageController");

router.post("/new-message", authMiddleware, sendMessage);
router.get("/get-all-messages/:chatId", authMiddleware, getAllMessages);

module.exports = router;
