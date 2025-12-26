// controllers/googleAuthController.js
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//console.log("BACKEND GOOGLE CLIENT ID =>", process.env.GOOGLE_CLIENT_ID);

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
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Google authentication successful",
      token: jwtToken,
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
