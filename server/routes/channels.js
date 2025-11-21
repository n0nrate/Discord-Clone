const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const router = express.Router();

const CHANNELS_PATH = path.join(__dirname, "..", "data", "channels.json");

function loadChannels() {
  if (!fs.existsSync(CHANNELS_PATH)) return [];
  return JSON.parse(fs.readFileSync(CHANNELS_PATH, "utf8"));
}

function saveChannels(list) {
  fs.writeFileSync(CHANNELS_PATH, JSON.stringify(list, null, 2));
}

// ===== получить каналы сервера =====
router.get("/:serverId", (req, res) => {
  const { serverId } = req.params;
  const channels = loadChannels().filter((c) => c.serverId === serverId);
  res.json(channels);
});

// ===== создать канал =====
router.post("/", (req, res) => {
  const { serverId, name, type } = req.body;

  if (!serverId || !name || !type) {
    return res.status(400).json({ error: "Неполные данные" });
  }

  const channels = loadChannels();

  const channel = {
    id: uuid(),
    serverId,
    name,
    type,
  };

  channels.push(channel);
  saveChannels(channels);

  res.status(201).json(channel);
});

module.exports = router;
