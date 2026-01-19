const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

/* ===================== ROUTE IMPORTS ===================== */
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const codeforcesRoutes = require("./routes/routeCodeforces");

/* ===================== MIDDLEWARE ===================== */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

/* ===================== REQUEST LOGGER (DEV ONLY) ===================== */
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

/* ===================== ROUTES ===================== */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/codeforces", codeforcesRoutes);

/* ===================== DATABASE ===================== */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

/* ===================== SERVER ===================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
