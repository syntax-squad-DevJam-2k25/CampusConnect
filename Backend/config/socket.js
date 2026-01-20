const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("send-message", (data) => {
      io.to(data.chatId).emit("receive-message", data);
    });
  // EDIT MESSAGE
  socket.on("edit-message", ({ chatId, messageId, newText }) => {
    io.to(chatId).emit("message-edited", {
      chatId,
      messageId,
      newText,
    });
  });

    // DELETE CHAT
  socket.on("delete-chat", ({ chatId }) => {
    io.to(chatId).emit("chat-deleted", { chatId });
  });
  
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { initSocket, getIO };
