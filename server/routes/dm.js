const express = require("express");
const router = express.Router();
const usersStore = require("../usersStore");
const messagesStore = require("../data/messages.json");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

// middleware для проверки токена
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.json({ error: "No token" });

  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, "secret123");
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// получить сообщения с человеком
router.get("/:id", auth, (req, res) => {
  const me = req.user.id;
  const other = req.params.id;

  const dmMessages = messagesStore.filter(
    m =>
      (m.from === me && m.to === other) ||
      (m.from === other && m.to === me)
  );

  res.json(dmMessages);
});

// отправить сообщение
router.post("/send", auth, (req, res) => {
  const me = req.user.id;
  const { to, text } = req.body;

  const msg = {
    id: Date.now(),
    from: me,
    to,
    text,
    time: new Date().toISOString()
  };

  messagesStore.push(msg);

  fs.writeFileSync(
    path.join(__dirname, "../data/messages.json"),
    JSON.stringify(messagesStore, null, 2)
  );

  res.json({ success: true, msg });
});

module.exports = router;
