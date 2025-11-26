const express = require("express");
const router = express.Router();
const { v4: uuid } = require("uuid");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const JWT_SECRET = "SUPER_SECRET_KEY_CHANGE_ME";
const SERVERS_FILE = path.join(__dirname, "..", "data", "servers.json");
const INVITES_FILE = path.join(__dirname, "..", "data", "invites.json");

// простое хранилище инвайтов в JSON, чтобы не слетали после рестарта
function loadInvites() {
  if (!fs.existsSync(INVITES_FILE)) return {};
  try {
    const raw = fs.readFileSync(INVITES_FILE, "utf8");
    return raw.trim() ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Не удалось прочитать invites.json:", err);
    return {};
  }
}

function saveInvites(obj) {
  fs.writeFileSync(INVITES_FILE, JSON.stringify(obj, null, 2));
}

let invites = loadInvites();

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Нет токена" });

  const parts = header.split(" ");
  if (parts.length !== 2) {
    return res.status(401).json({ error: "Неверный формат токена" });
  }

  try {
    req.user = jwt.verify(parts[1], JWT_SECRET);
    next();
  } catch (err) {
    console.error("JWT error in /invites:", err);
    return res.status(401).json({ error: "Неверный токен" });
  }
}

function loadServers() {
  if (!fs.existsSync(SERVERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(SERVERS_FILE, "utf8"));
}

function saveServers(list) {
  fs.writeFileSync(SERVERS_FILE, JSON.stringify(list, null, 2));
}

// POST /invites/create
// Body: { serverId, expiresIn, maxUses }
// expiresIn — дни (0 = бессрочно)
// maxUses   — максимум использований (0 = бесконечно)
router.post("/create", auth, (req, res) => {
  const { serverId, expiresIn, maxUses } = req.body;

  if (!serverId) {
    return res.status(400).json({ error: "Не передан serverId" });
  }

  const servers = loadServers();
  const server = servers.find((s) => String(s.id) === String(serverId));

  if (!server) {
    return res.status(404).json({ error: "Сервер не найден" });
  }

  const code = uuid().slice(0, 8);

  let expires = null;
  if (typeof expiresIn === "number" && expiresIn > 0) {
    expires = Date.now() + expiresIn * 24 * 60 * 60 * 1000;
  }

  const invite = {
    code,
    serverId: String(serverId),
    creatorId: req.user.id,
    createdAt: Date.now(),
    expires,
    maxUses: typeof maxUses === "number" ? maxUses : 0, // 0 = бесконечно
    uses: 0,
  };

  invites[code] = invite;
  saveInvites(invites);

  res.json({
    link: `http://localhost:3000/invite/${code}`,
    code,
  });
});

// POST /invites/:code/join
// Подключить пользователя к серверу по инвайт‑коду
router.post("/:code/join", auth, (req, res) => {
  const { code } = req.params;
  const invite = invites[code];

  if (!invite) {
    return res.status(404).json({ error: "Код недействителен" });
  }

  if (invite.expires && invite.expires < Date.now()) {
    delete invites[code];
    saveInvites(invites);
    return res.status(410).json({ error: "Срок действия инвайта истёк" });
  }

  if (invite.maxUses && invite.uses >= invite.maxUses) {
    delete invites[code];
    saveInvites(invites);
    return res.status(410).json({ error: "Лимит использований исчерпан" });
  }

  const servers = loadServers();
  const server = servers.find((s) => String(s.id) === String(invite.serverId));

  if (!server) {
    return res.status(404).json({ error: "Сервер не найден" });
  }

  if (!Array.isArray(server.members)) {
    server.members = [];
  }

  if (!server.members.includes(req.user.id)) {
    server.members.push(req.user.id);
  }

  invite.uses += 1;
  saveInvites(invites);

  saveServers(servers);

  res.json({ join: true, serverId: server.id });
});

module.exports = router;
