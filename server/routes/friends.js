const express = require("express");
const jwt = require("jsonwebtoken");

const {
  sendFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  getFriends,
  acceptFriendRequest,
  declineFriendRequest,
} = require("../friendsStore");

const usersStore = require("../usersStore");

const router = express.Router();

const JWT_SECRET = "SUPER_SECRET_KEY_CHANGE_ME";

function resolveUserByEmailOrUsername(identifier) {
  const allUsers = usersStore.getAll ? usersStore.getAll() : [];
  return allUsers.find(
    (u) => u.email === identifier || u.username === identifier
  );
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: "Нет токена" });
  }

  const parts = header.split(" ");
  if (parts.length !== 2) {
    return res.status(401).json({ error: "Неверный формат токена" });
  }

  try {
    const token = parts[1];
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    console.error("JWT error in /friends:", err);
    return res.status(401).json({ error: "Неверный токен" });
  }
}

// GET /friends/list
// Возвращает:
// {
//   friends: [{ id, username, email?, avatar?, statusText? }],
//   requests: [{ id, userId, username, email?, createdAt }]
// }
function buildFriendsPayload(userId) {
  const allUsers = usersStore.getAll ? usersStore.getAll() : [];

  // Друзья
  const friendIds = getFriends(userId);
  const friends = friendIds
    .map((id) => allUsers.find((u) => u.id === id))
    .filter(Boolean)
    .map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      avatar: u.avatar,
      statusText: u.statusText,
      status: u.status || "online",
    }));

  // Входящие заявки (для вкладки "Ожидание")
  const incoming = getIncomingRequests(userId);
  const requests = incoming
    .map((r) => {
      const fromUser = allUsers.find((u) => u.id === r.fromId);
      if (!fromUser) return null;

      return {
        id: r.id,
        userId: fromUser.id,
        username: fromUser.username,
        email: fromUser.email,
        createdAt: r.createdAt,
      };
    })
    .filter(Boolean);

  return { friends, requests };
}

router.get("/list", auth, (req, res) => {
  res.json(buildFriendsPayload(req.user.id));
});

// Совместимость: GET /friends/
router.get("/", auth, (req, res) => {
  res.json(buildFriendsPayload(req.user.id));
});

// POST /friends/request
// Body: { email } (можно передавать и username)
router.post("/request", auth, (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Не передан email / username" });
  }

  const target = resolveUserByEmailOrUsername(email);

  if (!target) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }

  try {
    const request = sendFriendRequest(req.user.id, target.id);
    return res.status(201).json({
      ok: true,
      requestId: request.id,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Совместимость: POST /friends/add { email }
router.post("/add", auth, (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Не передан email / username" });
  }

  const target = resolveUserByEmailOrUsername(email);
  if (!target) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }

  try {
    const request = sendFriendRequest(req.user.id, target.id);
    return res.status(201).json({ ok: true, requestId: request.id });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /friends/accept
// Body: { requestId }
router.post("/accept", auth, (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    return res.status(400).json({ error: "Не передан requestId" });
  }

  try {
    const request = acceptFriendRequest(requestId, req.user.id);
    return res.json({ ok: true, requestId: request.id });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /friends/decline
// Body: { requestId }
router.post("/decline", auth, (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    return res.status(400).json({ error: "Не передан requestId" });
  }

  try {
    declineFriendRequest(requestId, req.user.id);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
