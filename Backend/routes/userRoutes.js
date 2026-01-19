const router = require("express").Router();
const authMiddleware = require("./../middleware/authMiddleware");
const userController = require("./../controllers/userController");
const upload = require("../config/multer");

/* ===================== USER ROUTES ===================== */
router.get("/me", authMiddleware, userController.getMe);

router.get(
  "/get-logged-user",
  authMiddleware,
  userController.getLoggedUser
);

router.get(
  "/get-all-users",
  authMiddleware,
  (req, res, next) => {
    console.log("🟢 [ROUTE] GET /get-all-users hit");
    console.log("🟢 [ROUTE] User from token:", req.user);
    next();
  },
  userController.getAllUsers
);

router.put(
  "/update-profile",

  // 🔐 Auth middleware debug
  (req, res, next) => {
    console.log("➡️ [ROUTE] PUT /update-profile hit");
    next();
  },

  authMiddleware,

  (req, res, next) => {
    console.log("✅ [AUTH] User from token:", req.user);
    next();
  },

  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),

  (req, res, next) => {
    console.log("📦 [MULTER] req.body:", req.body);
    console.log("📁 [MULTER] req.files:", req.files);
    next();
  },
  userController.updateProfile
);



router.put(
  "/update-leetcode",
  authMiddleware,
  
 
  userController.updateLeetcode
);

router.post(
  "/leetcode",
  authMiddleware,
   
  userController.getLeetcodeProfile
);

router.post(
  "/leetcode2",
  authMiddleware,
   
  userController.getLeetcodeProfile2
);

module.exports = router;
