const express = require("express");
const { v4: uuid } = require("uuid");

const router = express.Router();

// Память вместо базы (пока)
const messagesByChannel = {
  // пример для канала 11
  "11": [
    {
      id: uuid(),
      channelId: "11",
      author: "Миша",
      content: "Йоу, как дела?",
      createdAt: new Date().toISOString(),
    },
    {
      id: uuid(),
      channelId: "11",
      author: "Бот",
      content: "Всё огонь, братик 😎",
      createdAt: new Date().toISOString(),
    },
  ],
};

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
