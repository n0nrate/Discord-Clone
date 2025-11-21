const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const FILE = path.join(__dirname, "data", "friends.json");

function load() {
  if (!fs.existsSync(FILE)) return { requests: [], friends: [] };
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

let data = load();

function sendFriendRequest(from, to) {
  if (from === to) throw new Error("Нельзя добавить самого себя");

  // Проверка на существующую заявку
  if (data.requests.find(r => r.from === from && r.to === to))
    throw new Error("Заявка уже отправлена");

  const request = {
    id: uuid(),
    from,
    to,
    createdAt: new Date().toISOString(),
  };

  data.requests.push(request);
  save(data);
  return request;
}

function getIncomingRequests(userId) {
  return data.requests.filter(r => r.to === userId);
}

function getOutgoingRequests(userId) {
  return data.requests.filter(r => r.from === userId);
}

function getFriends(userId) {
  return data.friends.filter(f => f.user1 === userId || f.user2 === userId);
}

function acceptFriendRequest(requestId) {
  const req = data.requests.find(r => r.id === requestId);
  if (!req) throw new Error("Заявка не найдена");

  data.requests = data.requests.filter(r => r.id !== requestId);

  data.friends.push({
    user1: req.from,
    user2: req.to,
    since: new Date().toISOString(),
  });

  save(data);
}

function declineFriendRequest(requestId) {
  data.requests = data.requests.filter(r => r.id !== requestId);
  save(data);
}

module.exports = {
  sendFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  getFriends,
  acceptFriendRequest,
  declineFriendRequest
};
