const router = require("express").Router();
const { register, login } = require("../controllers/authController");
const { googleRegister } = require("../controllers/googleAuthController");

router.post("/register", register);
router.post("/login", login);
router.post("/google-register", googleRegister);

module.exports = router;
