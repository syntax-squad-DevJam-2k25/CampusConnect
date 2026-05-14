// controllers/googleAuthController.js
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


export const googleRegister = async (req, res) => {
  try {
    const { token } = req.body;

    // 🔐 Safety check
    if (!token) {
      return res.status(400).json({ message: "Google token missing" });
    }

    // ✅ Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: "Email not found in Google account" });
    }

    // 🔍 Check if user exists
    let user = await User.findOne({ email });
    if (user && user.authProvider === "local") {
      return res.status(400).json({
        message:
          "This account uses email/password login. Please login normally."
      });
    }
    // 🆕 Create user if new
    if (!user) {
      user = await User.create({
        name,
        email,
        profileImage: picture,
        authProvider: "google",
        isVerified: true,
      });
    }

    // 🔑 Create JWT
    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      message: "Google authentication successful",
      token: accessToken,
      refreshToken: refreshToken,
      user,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(401).json({
      message: "Google authentication failed",
      error: error.message,
    });
  }
};
