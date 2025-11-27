const express = require("express");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const FILE = path.join(__dirname, "..", "data", "channelMessages.json");

function load() {
  if (!fs.existsSync(FILE)) return {};
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

let messagesByChannel = load();

// общая функция создания сообщения (используем и в сокетах, и в REST)
function createMessage(channelId, { author = "Миша", content }) {
  const msg = {
    id: uuid(),
    channelId,
    author,
    content,
    createdAt: new Date().toISOString(),
  };

  if (!messagesByChannel[channelId]) {
    messagesByChannel[channelId] = [];
  }
  messagesByChannel[channelId].push(msg);
  save(messagesByChannel);
  return msg;
}

// GET /messages/:channelId — история сообщений канала
router.get("/:channelId", (req, res) => {
  const { channelId } = req.params;
  res.json(messagesByChannel[channelId] || []);
});

// (опц.) POST /messages/:channelId — на будущее
router.post("/:channelId", (req, res) => {
  const { channelId } = req.params;
  const { content, author } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Пустое сообщение" });
  }

  const msg = createMessage(channelId, { author, content });
  res.status(201).json(msg);
});

module.exports = { router, createMessage };
