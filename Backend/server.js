const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

/* ROUTES */
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const codeforcesRoutes = require("./routes/routeCodeforces");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");

/* SOCKET */
const { initSocket } = require("./config/socket");

/* MIDDLEWARE */
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/codeforces", codeforcesRoutes);
app.use("/api/community", postRoutes);
app.use("/api/comments", commentRoutes);

/* DB */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });

/* SERVER */
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
