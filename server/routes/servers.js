const express = require("express");
const router = express.Router();

// ВРЕМЕННАЯ БАЗА (позже подключим MongoDB)
const servers = [
  { id: "1", name: "Геймдев", icon: "🎮" },
  { id: "2", name: "Аниме", icon: "🌸" },
  { id: "3", name: "Футбол", icon: "⚽" }
];

// GET /servers — список серверов
router.get("/", (req, res) => {
  res.json(servers);
});

module.exports = router;
