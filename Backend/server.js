import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import connectDB from "./src/db/db.js";

const port = 3000;
connectDB();

// socket.io ke liye http server chahiye
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Socket Connected", socket.id);

  // purane todo events (agar chahiye to rehne den)
  socket.on("add-todo", (data) => {
    io.emit("send-todo", data);
  });
  socket.on("delete-todo", ({ id }) => {
    io.emit("todo-deleted", { id });
  });

  socket.on("join-conversation", ({ conversationId } = {}) => {
    if (
      typeof conversationId !== "string" ||
      conversationId.length === 0 ||
      conversationId.length > 128
    ) {
      socket.emit("chat-error", { message: "Invalid conversation ID." });
      return;
    }

    socket.join(conversationId);
  });

  socket.on("send-message", (data = {}) => {
    const { message, recipientId, conversationId } = data;
    if (
      typeof message !== "string" ||
      !message.trim() ||
      typeof conversationId !== "string" ||
      conversationId.length === 0 ||
      conversationId.length > 128 ||
      typeof recipientId !== "string" ||
      !recipientId.trim()
    ) {
      socket.emit("chat-error", { message: "Invalid chat message or recipient." });
      return;
    }

    console.log("User:", data.message);
    socket.join(conversationId);
    io.to(conversationId).emit("receive-message", {
      message: message.trim(),
      recipientId,
      conversationId,
    });
  });
});

// app.listen ki jagah server.listen
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});