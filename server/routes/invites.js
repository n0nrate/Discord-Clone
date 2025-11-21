const express = require("express");
const router = express.Router();
const { v4: uuid } = require("uuid");
const jwt = require("jsonwebtoken");
const servers = require("../data/servers.json");
const fs = require("fs");

const invites = {}; // хранение invite-кодов в памяти

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Нет токена" });

  try {
    req.user = jwt.verify(header.split(" ")[1], "SUPER_SECRET_KEY_CHANGE_ME");
    next();
  } catch {
    res.status(401).json({ error: "Неверный токен" });
  }
}

router.post("/create", auth, (req, res) => {
  const { serverId, expiresIn, maxUses } = req.body;

  const code = uuid().slice(0, 8);

  invites[code] = {
    serverId,
    expires: expiresIn ? Date.now() + expiresIn * 86400000 : null,
    maxUses,
    uses: 0,
  };

  res.json({ link: `http://localhost:3000/invite/${code}` });
});

// вход по invite-коду
router.post("/join", auth, (req, res) => {
  const { code } = req.body;
  const invite = invites[code];

  if (!invite) return res.status(404).json({ error: "Код недействителен" });

  if (invite.expires && invite.expires < Date.now())
    return res.status(400).json({ error: "Приглашение истекло" });

  if (invite.maxUses && invite.uses >= invite.maxUses)
    return res.status(400).json({ error: "Лимит использования исчерпан" });

  invite.uses++;

  const server = servers.find((s) => s.id === invite.serverId);
  if (!server) return res.status(404).json({ error: "Сервер не найден" });

  if (!server.members.includes(req.user.id)) {
    server.members.push(req.user.id);
    fs.writeFileSync("./data/servers.json", JSON.stringify(servers, null, 2));
  }

  res.json({ join: true, serverId: server.id });
});

module.exports = router;
