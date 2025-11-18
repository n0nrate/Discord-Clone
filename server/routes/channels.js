const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// путь к json хранения каналов
const channelsPath = path.join(__dirname, "../data/channels.json");

// загружаем
function loadChannels() {
  if (!fs.existsSync(channelsPath)) return [];
  return JSON.parse(fs.readFileSync(channelsPath));
}

// сохраняем
function saveChannels(channels) {
  fs.writeFileSync(channelsPath, JSON.stringify(channels, null, 2));
}

// ============ АПИ ============

// получить каналы сервера
router.get("/:serverId", (req, res) => {
  const channels = loadChannels().filter(c => c.serverId === req.params.serverId);
  res.json(channels);
});

// создать канал
router.post("/create", (req, res) => {
  const { serverId, name, type } = req.body;

  const channels = loadChannels();

  const newChannel = {
    id: Date.now().toString(),
    serverId,
    name,
    type, // "text" или "voice"
  };

  channels.push(newChannel);
  saveChannels(channels);

  res.json(newChannel);
});

module.exports = router;
