const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const usersStore = require("./usersStore");
const gateway = require("./socket/gateway");

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

gateway(io, { usersStore, createMessage, addDMMessage });

// ====== START ======
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🔥 Backend запущен на http://localhost:${PORT}`);
});
