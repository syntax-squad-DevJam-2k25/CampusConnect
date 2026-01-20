const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");


const {

  sendMessage,
  editMessage,
  deleteMessage,

} = require("../controllers/chatController");

//router.post("/create-new-chat", authMiddleware, createNewChat);
//router.get("/get-all-chats", authMiddleware, getAllChats);

router.post("/send-message", authMiddleware, sendMessage);
router.put("/edit-message", authMiddleware, editMessage);
router.delete("/delete-message", authMiddleware, deleteMessage);


module.exports = router;
