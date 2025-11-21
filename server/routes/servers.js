// server/routes/servers.js
const express = require("express");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const serversPath = path.join(__dirname, "../data/servers.json");
const channelsPath = path.join(__dirname, "../data/channels.json");

// безопасное чтение json
function readJSON(p) {
  try {
    const raw = fs.readFileSync(p, "utf8");
    return raw.trim() ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeJSON(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
}

// GET /servers — список серверов (пока без фильтра по пользователю)
router.get("/", (req, res) => {
  const servers = readJSON(serversPath);
  res.json(servers);
});

// POST /servers — создать новый сервер
router.post("/", (req, res) => {
  const { name, template, ownerId } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Нужно имя сервера" });
  }

  const servers = readJSON(serversPath);
  const channels = readJSON(channelsPath);

  const serverId = uuid();

  // создаём дефолтные каналы
  const textChannelId = uuid();
  const voiceChannelId = uuid();

  const newServer = {
    id: serverId,
    name: name.trim(),
    template: template || "friends",
    ownerId: ownerId || null,
    icon: null, // потом добавим
    mainTextChannelId: textChannelId,
    mainVoiceChannelId: voiceChannelId,
    createdAt: new Date().toISOString(),
  };

  const textChannel = {
    id: textChannelId,
    serverId,
    name: "основной",
    type: "text",
    createdAt: new Date().toISOString(),
  };

  const voiceChannel = {
    id: voiceChannelId,
    serverId,
    name: "Основной",
    type: "voice",
    createdAt: new Date().toISOString(),
  };

  servers.push(newServer);
  channels.push(textChannel, voiceChannel);

  writeJSON(serversPath, servers);
  writeJSON(channelsPath, channels);

  res.status(201).json(newServer);
});

module.exports = router;
