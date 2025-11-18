const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const serversRoute = require("./routes/servers");
app.use("/servers", serversRoute);

const channelsRoute = require("./routes/channels");
app.use("/channels", channelsRoute);

const { router: messagesRoute, createMessage } = require("./routes/messages");
app.use("/messages", messagesRoute);

app.use("/dm", require("./routes/dm"));

const authRoute = require("./routes/auth");
app.use(express.json());
app.use("/auth", authRoute);

const friendsRoute = require("./routes/friends");
app.use("/friends", friendsRoute);

app.get("/", (req, res) => {
  res.send("Discord backend работает!");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Пользователь подключён:", socket.id);

  // ===== КАНАЛЫ =====
  socket.on("join-channel", (channelId) => {
    socket.join(channelId);
    console.log(`socket ${socket.id} joined channel ${channelId}`);
  });

  socket.on("leave-channel", (channelId) => {
    socket.leave(channelId);
    console.log(`socket ${socket.id} left channel ${channelId}`);
  });

  socket.on("message:send", ({ channelId, content, author }) => {
    if (!content || !content.trim()) return;

    const msg = createMessage(channelId, { author, content });
    io.to(channelId).emit("message:new", msg);
  });

  // ===== DM (ЛИЧНЫЕ СООБЩЕНИЯ) =====

  socket.on("join-dm", (userId) => {
    socket.join(`dm-${userId}`);
    console.log(`socket ${socket.id} joined DM room dm-${userId}`);
  });

  socket.on("dm:send", (msg) => {
    // msg = { from, to, text, time }
    io.to(`dm-${msg.to}`).emit("dm:receive", msg);
    io.to(`dm-${msg.from}`).emit("dm:receive", msg);
  });

  socket.on("disconnect", () => {
    console.log("Пользователь отключён:", socket.id);
  });
});

  socket.on("disconnect", () => {
    console.log("Пользователь отключён:", socket.id);
  });


const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🔥 Backend запущен на http://localhost:${PORT}`);
});
