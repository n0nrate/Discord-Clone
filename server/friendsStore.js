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

// В памяти держим последнюю загруженную версию
let data = load();

/**
 * Создать заявку в друзья.
 * fromId — кто отправляет
 * toId   — кому
 */
function sendFriendRequest(fromId, toId) {
  if (!fromId || !toId) {
    throw new Error("Не переданы id пользователей");
  }

  if (fromId === toId) {
    throw new Error("Нельзя добавить себя в друзья");
  }

  // Уже друзья?
  const alreadyFriends = data.friends.some(
    (f) =>
      (f.user1Id === fromId && f.user2Id === toId) ||
      (f.user1Id === toId && f.user2Id === fromId)
  );
  if (alreadyFriends) {
    throw new Error("Вы уже друзья");
  }

  // Уже есть активная заявка в одну из сторон?
  const existing = data.requests.find(
    (r) =>
      r.status === "pending" &&
      ((r.fromId === fromId && r.toId === toId) ||
        (r.fromId === toId && r.toId === fromId))
  );
  if (existing) {
    throw new Error("Заявка уже отправлена");
  }

  const request = {
    id: uuid(),
    fromId,
    toId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  data.requests.push(request);
  save(data);

  return request;
}

/**
 * Входящие заявки для пользователя
 */
function getIncomingRequests(userId) {
  return data.requests.filter(
    (r) => r.toId === userId && r.status === "pending"
  );
}

/**
 * Исходящие заявки пользователя
 */
function getOutgoingRequests(userId) {
  return data.requests.filter(
    (r) => r.fromId === userId && r.status === "pending"
  );
}

/**
 * Возвращает массив id друзей пользователя
 */
function getFriends(userId) {
  const ids = new Set();

  for (const f of data.friends) {
    if (f.user1Id === userId) ids.add(f.user2Id);
    else if (f.user2Id === userId) ids.add(f.user1Id);
  }

  return Array.from(ids);
}

/**
 * Принять заявку
 */
function acceptFriendRequest(requestId, currentUserId) {
  const request = data.requests.find((r) => r.id === requestId);
  if (!request) {
    throw new Error("Заявка не найдена");
  }

  if (request.toId !== currentUserId && request.fromId !== currentUserId) {
    throw new Error("Нет прав на обработку этой заявки");
  }

  if (request.status !== "pending") {
    throw new Error("Заявка уже обработана");
  }

  request.status = "accepted";

  const alreadyFriends = data.friends.some(
    (f) =>
      (f.user1Id === request.fromId && f.user2Id === request.toId) ||
      (f.user1Id === request.toId && f.user2Id === request.fromId)
  );

  if (!alreadyFriends) {
    data.friends.push({
      id: uuid(),
      user1Id: request.fromId,
      user2Id: request.toId,
      createdAt: new Date().toISOString(),
    });
  }

  save(data);

  return request;
}

/**
 * Отклонить заявку
 */
function declineFriendRequest(requestId, currentUserId) {
  const request = data.requests.find((r) => r.id === requestId);
  if (!request) {
    return; // тихо выходим
  }

  if (request.toId !== currentUserId && request.fromId !== currentUserId) {
    throw new Error("Нет прав на обработку этой заявки");
  }

  request.status = "declined";
  save(data);
}

module.exports = {
  sendFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  getFriends,
  acceptFriendRequest,
  declineFriendRequest,
};
