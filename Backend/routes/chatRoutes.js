const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");


const {

  sendMessage,
  editMessage,
  deleteMessage,
  createNewChat,
  getAllChats,

} = require("../controllers/chatController");

router.post("/create-new-chat", authMiddleware, createNewChat);
router.get("/get-all-chats", authMiddleware, getAllChats);

router.post(
  "/send-message",
  authMiddleware,
  (req, res, next) => {
    console.log("✅ /send-message route hit");
    next();
  },
  sendMessage
);
router.put("/edit-message", authMiddleware, editMessage);
router.delete("/delete-message", authMiddleware, deleteMessage);


module.exports = router;
