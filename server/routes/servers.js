const express = require("express");
const jwt = require("jsonwebtoken");

const {
  createServer,
  getServersByUser,
  getServer,
  getChannels,
} = require("../serversStore");

const router = express.Router();

const JWT_SECRET = "SUPER_SECRET_KEY_CHANGE_ME";

// middleware для проверки токена
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Нет токена" });

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch {
    return res.status(401).json({ error: "Неверный токен" });
  }
}

// Получить свои серверы
router.get("/", auth, (req, res) => {
  res.json(getServersByUser(req.user.id));
});

// Создать сервер
router.post("/", auth, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Введите имя сервера" });
  }

  const result = createServer(req.user.id, name);
  res.status(201).json(result);
});

// Получить данные сервера
router.get("/:id", auth, (req, res) => {
  const server = getServer(req.params.id);
  if (!server) return res.status(404).json({ error: "Сервер не найден" });

  res.json(server);
});

// Каналы сервера
router.get("/:id/channels", auth, (req, res) => {
  res.json(getChannels(req.params.id));
});

module.exports = router;
