const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes.js");
const userRouter = require('./controllers/userController.js');
const codeforcesRouter = require('./routes/routeCodeforces.js');
const chatRouter = require('./controllers/chatController');
const messageRouter = require('./controllers/messageController');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

/* ✅ MIDDLEWARE (MUST BE FIRST) */
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json()); // body parser
app.use(bodyParser.json());

/* ✅ DEBUG LOGGER */
app.use((req, res, next) => {
  console.log("➡️ Incoming Request:", req.method, req.url);
  next();
});

/* ✅ ROUTES */
app.use("/api/auth", authRoutes);
app.use('/api/user', userRouter);
app.use('/api/codeforces', codeforcesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);

/* ✅ DB */
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

/* ✅ SERVER */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
