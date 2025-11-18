const express = require("express");
const router = express.Router();

// ⛔ ВРЕМЕННЫЕ КАНАЛЫ (потом заменим на базу)
const channels = {
  "1": [
    { id: "11", name: "general", type: "text" },
    { id: "12", name: "dev-talk", type: "text" },
    { id: "13", name: "voice-chat", type: "voice" },
  ],
  "2": [
    { id: "21", name: "аниме-общение", type: "text" },
    { id: "22", name: "вайфу-клуб", type: "text" },
  ],
  "3": [
    { id: "31", name: "футбол-чаты", type: "text" },
    { id: "32", name: "голосовая-комната", type: "voice" },
  ],
};

// GET /channels/:serverId — вернуть каналы конкретного сервера
router.get("/:serverId", (req, res) => {
  const { serverId } = req.params;
  res.json(channels[serverId] || []);
});

module.exports = router;