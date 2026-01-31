const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected route to find matches
router.get("/find-matches", authMiddleware, matchController.findMatches);

module.exports = router;
