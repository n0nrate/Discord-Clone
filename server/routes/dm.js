const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getConversation, addMessage } = require("../dmStore");

const JWT_SECRET = "SUPER_SECRET_KEY_CHANGE_ME";

// middleware для проверки токена
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.json({ error: "No token" });

  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// получить сообщения с человеком
router.get("/:id", auth, (req, res) => {
  const me = req.user.id;
  const other = req.params.id;

  const history = getConversation(me, other);
  res.json(history);
});

// отправить сообщение
router.post("/send", auth, (req, res) => {
  const me = req.user.id;
  const { to, text } = req.body;

  const msg = addMessage({
    from: me,
    to,
    text,
    time: new Date().toISOString(),
  });

  res.json({ success: true, msg });
});

module.exports = router;
