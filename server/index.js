const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const usersStore = require("./usersStore");

const app = express();
app.use(cors());
app.use(express.json());

// ====== ROUTES ======
app.use("/servers", require("./routes/servers"));
app.use("/channels", require("./routes/channels"));
app.use("/categories", require("./routes/categories"));

const { router: messagesRoute, createMessage } = require("./routes/messages");
app.use("/messages", messagesRoute);

app.use("/dm", require("./routes/dm"));
app.use("/auth", require("./routes/auth"));
app.use("/friends", require("./routes/friends"));
app.use("/invites", require("./routes/invite"));

app.get("/", (req, res) => {
  res.send("Discord backend работает!");
});

// ====== SERVER ======
const server = http.createServer(app);

// ====== SOCKET.IO ======
const io = new Server(server, {
  cors: { origin: "*" },
});

const { addMessage: addDMMessage } = require("./dmStore");
// Хранилище участников голосовых каналов
const voiceUsersByChannel = {};

io.on("connection", (socket) => {
  console.log("Пользователь подключён:", socket.id);

  // ====== ТЕКСТОВЫЕ КАНАЛЫ ======
  socket.on("join-channel", (channelId) => {
    socket.join(channelId);
  });

  socket.on("leave-channel", (channelId) => {
    socket.leave(channelId);
  });

  socket.on("message:send", ({ channelId, content, author }) => {
    if (!content.trim()) return;

    const msg = createMessage(channelId, { author, content });
    io.to(channelId).emit("message:new", msg);
  });

  socket.on("typing", ({ channelId, author }) => {
  socket.to(channelId).emit("typing", { author });
});

socket.on("stopTyping", ({ channelId }) => {
  socket.to(channelId).emit("stopTyping");
});

  // ====== DM ======
  socket.on("join-dm", (userId) => {
    socket.join(`dm-${userId}`);
  });

  socket.on("dm:send", (msg) => {
    addDMMessage({
      from: msg.from,
      to: msg.to,
      text: msg.text,
      time: msg.time,
    });
    io.to(`dm-${msg.to}`).emit("dm:receive", msg);
    io.to(`dm-${msg.from}`).emit("dm:receive", msg);
  });

  // ====== ВОЙС ======
  socket.on("voice:join", ({ channelId, userId }) => {
    if (!voiceUsersByChannel[channelId]) {
      voiceUsersByChannel[channelId] = {};
    }

    const allUsers = usersStore.getAll ? usersStore.getAll() : [];
    const user =
      allUsers.find((u) => String(u.id) === String(userId)) || {
        id: userId,
        username: "User",
        avatar: null,
      };

    voiceUsersByChannel[channelId][userId] = {
      socketId: socket.id,
      id: user.id,
      username: user.username,
      avatar: user.avatar,
    };

    socket.join(`voice-${channelId}`);

    io.to(`voice-${channelId}`).emit("voice:users", {
      channelId,
      users: Object.values(voiceUsersByChannel[channelId]),
    });
  });

  socket.on("voice:leave", ({ channelId, userId }) => {
    if (voiceUsersByChannel[channelId]) {
      delete voiceUsersByChannel[channelId][userId];

      if (Object.keys(voiceUsersByChannel[channelId]).length === 0) {
        delete voiceUsersByChannel[channelId];
      }
    }

    socket.leave(`voice-${channelId}`);
    io.to(`voice-${channelId}`).emit("voice:users", {
      channelId,
      users: voiceUsersByChannel[channelId]
        ? Object.values(voiceUsersByChannel[channelId])
        : [],
    });
  });

  socket.on("voice:signal", ({ channelId, toUserId, fromUserId, data }) => {
    const channel = voiceUsersByChannel[channelId];
    if (!channel) return;

    const peer = channel[toUserId];
    if (!peer) return;

    io.to(peer.socketId).emit("voice:signal", {
      channelId,
      fromUserId,
      data,
    });
  });

  // ====== LOGOUT ======
  socket.on("disconnect", () => {
    console.log("Пользователь отключён:", socket.id);
  });

  socket.on("voice:state", ({ channelId, userId, muted, deaf }) => {
  if (!voiceUsersByChannel[channelId]) return;
  if (!voiceUsersByChannel[channelId][userId]) return;

  voiceUsersByChannel[channelId][userId].muted = muted;
  voiceUsersByChannel[channelId][userId].deaf = deaf;

  io.to(`voice-${channelId}`).emit("voice:users", {
    channelId,
    users: Object.values(voiceUsersByChannel[channelId])
  });
});

});

// ====== START ======
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🔥 Backend запущен на http://localhost:${PORT}`);
});
