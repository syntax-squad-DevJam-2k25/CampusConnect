const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Authorization token missing or invalid");
      return res.status(401).json({
        success: false,
        message: "Authorization token missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];

    // 🔥 FIX: variable name consistent rakho
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded JWT:", decodedToken); // ✅ NOW WORKS
   
    // 🔥 IMPORTANT: req.user structure
    req.user = {
      _id: decodedToken.id || decodedToken._id || decodedToken.userId,
    };
   console.log("req.user gggggggggset to:", req.user); // ✅ DEBUG LOG
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
