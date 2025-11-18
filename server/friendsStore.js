const friends = [];
const friendRequests = [];

// отправка заявки
function sendFriendRequest(fromUserId, toUserId) {
  // проверка: уже друзья?
  if (friends.find(f =>
    (f.user1 === fromUserId && f.user2 === toUserId) ||
    (f.user2 === fromUserId && f.user1 === toUserId)
  )) {
    throw new Error("Вы уже друзья");
  }

  // проверка: заявка уже существует?
  if (friendRequests.find(r =>
    r.from === fromUserId && r.to === toUserId
  )) {
    throw new Error("Заявка уже отправлена");
  }

  // создание заявки
  const request = {
    id: String(friendRequests.length + 1),
    from: fromUserId,
    to: toUserId,
    createdAt: Date.now()
  };

  friendRequests.push(request);
  return request;
}

// входящие заявки
function getIncomingRequests(userId) {
  return friendRequests.filter(r => r.to === userId);
}

// исходящие заявки
function getOutgoingRequests(userId) {
  return friendRequests.filter(r => r.from === userId);
}

// друзья
function getFriends(userId) {
  return friends.filter(f => f.user1 === userId || f.user2 === userId);
}

// принятие заявки
function acceptFriendRequest(requestId) {
  const reqIndex = friendRequests.findIndex(r => r.id === requestId);
  if (reqIndex === -1) throw new Error("Запрос не найден");

  const req = friendRequests[reqIndex];

  friends.push({
    user1: req.from,
    user2: req.to,
    since: Date.now()
  });

  friendRequests.splice(reqIndex, 1);
}

// отклонение
function declineFriendRequest(requestId) {
  const reqIndex = friendRequests.findIndex(r => r.id === requestId);
  if (reqIndex === -1) throw new Error("Запрос не найден");

  friendRequests.splice(reqIndex, 1);
}

module.exports = {
  sendFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  getFriends,
  acceptFriendRequest,
  declineFriendRequest
};
