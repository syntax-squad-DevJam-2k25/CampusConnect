const express = require("express");
const { getUserDetails, getUserDetails2 } = require("../controllers/authCodeforces");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/getCodeforcesData",
  authMiddleware, // ✅ Add auth middleware here
  (req, res, next) => {
    next();
  },
  getUserDetails
);



router.post(
  "/getCodeforcesData2",
  authMiddleware, // ✅ Add auth middleware here
  (req, res, next) => {
    next();
  },
  getUserDetails2
);


module.exports = router;
