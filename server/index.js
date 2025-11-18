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

const authRoute = require("./routes/auth");
app.use(express.json());
app.use("/auth", authRoute);


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

  // заход в комнату канала
  socket.on("join-channel", (channelId) => {
    socket.join(channelId);
    console.log(`socket ${socket.id} joined channel ${channelId}`);
  });

  // выход из канала
  socket.on("leave-channel", (channelId) => {
    socket.leave(channelId);
    console.log(`socket ${socket.id} left channel ${channelId}`);
  });

  // отправка сообщения
  socket.on("message:send", ({ channelId, content, author }) => {
    if (!content || !content.trim()) return;

    const msg = createMessage(channelId, { author, content });

    // рассылаем всем в этом канале
    io.to(channelId).emit("message:new", msg);
  });

  socket.on("disconnect", () => {
    console.log("Пользователь отключён:", socket.id);
  });
});


const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🔥 Backend запущен на http://localhost:${PORT}`);
});
