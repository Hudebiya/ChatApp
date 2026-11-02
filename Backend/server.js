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

  // naya chatbox event
  socket.on("send-message", (data) => {
    console.log("User:", data.message);
    // abhi sirf test reply, baad mein yahan AI/asli jawab lagayen
    socket.emit("receive-message", { message: `Aap ne kaha: ${data.message}` });
  });
});

// app.listen ki jagah server.listen
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});