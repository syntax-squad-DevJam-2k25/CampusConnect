const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, gemail, email, password, confirmPassword, branch } = req.body;

    if (!gemail || !password || !confirmPassword) {
      return res.status(400).json({ message: "Gemail and password are required" });
    }

    if (!gemail.endsWith("@mnnit.ac.in")) {
      return res.status(400).json({ message: "Invalid MNNIT email" });
    }

    if (!email.endsWith("@gmail.com") && !email.endsWith("@hotmail.com")) {
      return res.status(400).json({ message: "Invalid personal email" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      gemail,
      email,
      password,
      branch,
      authProvider: "local",
    });


    //  const accessToken = generateAccessToken(newUser);
    //   const refreshToken = generateRefreshToken(newUser);
    //   newUser.refreshToken = refreshToken;
    await newUser.save();

    res.status(200).json({
      message: "Register successful",
      // token: accessToken,      
      // refreshToken: refreshToken  
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Register first" });
    if (user.authProvider === "google") {
      return res.status(400).json({
        message:
          "This account uses Google login. Please sign in with Google."
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();


    res.status(200).json({
      message: "Login successful",
      token: accessToken,          // old code still works
      refreshToken: refreshToken   // new addition
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.refresh = async (req, res) => {

  try {

    const { refreshToken } = req.body;

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);

    if (
      !user ||
      user.refreshToken !== refreshToken
    ) {
      return res.status(401).json({
        message: "Invalid refresh token"
      });
    }

    const newAccessToken =
      generateAccessToken(user);

    res.status(200).json({
      token: newAccessToken
    });

  } catch (error) {

    res.status(401).json({
      message: "Invalid refresh token"
    });

  }
}


exports.logout = async (req, res) => {

  try {

    const user = await User.findById(
      req.user._id
    );

    if (user) {

      user.refreshToken = null;

      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  }
  catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

}