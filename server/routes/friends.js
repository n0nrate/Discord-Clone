const express = require("express");
const jwt = require("jsonwebtoken");

const {
  sendFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  getFriends,
  acceptFriendRequest,
  declineFriendRequest
} = require("../friendsStore");

const { users } = require("../usersStore");

const router = express.Router();

// middleware: достаём userId из токена
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Нет токена" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "SUPER_SECRET_KEY_CHANGE_ME");
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Неверный токен" });
  }
}

// отправка заявки
router.post("/add", auth, (req, res) => {
  const from = req.user.id;
  const { toUserId } = req.body;

  if (!users.find(u => u.id === toUserId))
    return res.status(404).json({ error: "Пользователь не найден" });

  try {
    const request = sendFriendRequest(from, toUserId);
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// входящие заявки
router.get("/requests/incoming", auth, (req, res) => {
  res.json(getIncomingRequests(req.user.id));
});

// исходящие заявки
router.get("/requests/outgoing", auth, (req, res) => {
  res.json(getOutgoingRequests(req.user.id));
});

// список друзей
router.get("/", auth, (req, res) => {
  const fr = getFriends(req.user.id).map(pair => {
    const friendId = 
      pair.user1 === req.user.id ? pair.user2 : pair.user1;

    const user = users.find(u => u.id === friendId);

    return {
      id: friendId,
      username: user.username,
      email: user.email,
      since: pair.since
    };
  });

  res.json(fr);
});

// принять заявку
router.post("/accept", auth, (req, res) => {
  const { requestId } = req.body;

  try {
    acceptFriendRequest(requestId);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// отклонить
router.post("/decline", auth, (req, res) => {
  const { requestId } = req.body;
  try {
    declineFriendRequest(requestId);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
