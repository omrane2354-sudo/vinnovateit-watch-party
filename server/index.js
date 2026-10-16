const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"], 
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`🟢 User connected: ${socket.id}`);

  socket.on("create_room", (data) => {
    socket.join(data.room);
    console.log(`🏠 User ${data.user} created/joined room: ${data.room}`);
  });

  socket.on("join_room", (data) => {
    socket.join(data.room);
    console.log(`🏠 User ${data.user} joined room: ${data.room}`);
  });

  socket.on("play_video", ({ room, time }) => {
    console.log(`▶️ PLAY signal received in room ${room} at ${time}s`);
    socket.to(room).emit("play_video", time);
  });

  socket.on("pause_video", ({ room, time }) => {
    console.log(`⏸️ PAUSE signal received in room ${room} at ${time}s`);
    socket.to(room).emit("pause_video", time);
  });

  socket.on("seek_video", ({ room, time }) => {
    console.log(`⏩ SEEK signal received in room ${room} to ${time}s`);
    socket.to(room).emit("seek_video", time);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});