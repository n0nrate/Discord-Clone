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

const jwt = require("jsonwebtoken");
const JWT_SECRET = "SUPER_SECRET_KEY_CHANGE_ME";

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Нет токена" });
  const parts = header.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "Неверный токен" });
  try {
    req.user = jwt.verify(parts[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Неверный токен" });
  }
}

// GET /servers — список серверов пользователя
router.get("/", auth, (req, res) => {
  const servers = readJSON(serversPath);
  const my = servers.filter(
    (s) =>
      String(s.ownerId) === String(req.user.id) ||
      (Array.isArray(s.members) && s.members.includes(req.user.id))
  );
  res.json(my);
});

// GET /servers/:id — детали сервера для своих
router.get("/:id", auth, (req, res) => {
  const servers = readJSON(serversPath);
  const server = servers.find((s) => String(s.id) === String(req.params.id));
  if (!server) return res.status(404).json({ error: "Сервер не найден" });
  const allowed =
    String(server.ownerId) === String(req.user.id) ||
    (Array.isArray(server.members) && server.members.includes(req.user.id));
  if (!allowed) return res.status(403).json({ error: "Нет доступа" });
  res.json(server);
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
    ownerId: ownerId || req.user?.id || null,
    icon: null, // потом добавим
    mainTextChannelId: textChannelId,
    mainVoiceChannelId: voiceChannelId,
    members: ownerId || req.user?.id ? [ownerId || req.user.id] : [],
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

// DELETE /servers/:id — только владелец
router.delete("/:id", auth, (req, res) => {
  const servers = readJSON(serversPath);
  const server = servers.find((s) => String(s.id) === String(req.params.id));
  if (!server) return res.status(404).json({ error: "Сервер не найден" });
  if (String(server.ownerId) !== String(req.user.id)) {
    return res.status(403).json({ error: "Только владелец может удалить" });
  }

  const filteredServers = servers.filter((s) => String(s.id) !== String(req.params.id));
  const channels = readJSON(channelsPath).filter(
    (c) => String(c.serverId) !== String(req.params.id)
  );

  writeJSON(serversPath, filteredServers);
  writeJSON(channelsPath, channels);

  res.json({ ok: true });
});

module.exports = router;
