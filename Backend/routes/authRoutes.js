const express = require("express");
const { register, login } = require("../controllers/authCotroller.js");
const { googleRegister } = require("../controllers/googleAuthController.js");
const router = express.Router();
router.post("/register",register);
router.post("/login", login);
router.post("/google-register", googleRegister);
module.exports = router;

