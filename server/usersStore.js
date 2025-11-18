const bcrypt = require("bcrypt");

const users = [];

// создать пользователя (без верификации, с кодом)
async function createUser({ email, username, password, verificationCode }) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    id: String(users.length + 1),
    email,
    username,
    passwordHash,
    verified: false,
    verificationCode,
    verificationExpires: Date.now() + 15 * 60 * 1000, // 15 минут
  };

  users.push(user);
  return user;
}

function findUserByEmail(email) {
  return users.find((u) => u.email === email);
}

function markUserVerified(email) {
  const u = findUserByEmail(email);
  if (!u) return null;
  u.verified = true;
  u.verificationCode = null;
  u.verificationExpires = null;
  return u;
}

module.exports = {
  users,
  createUser,
  findUserByEmail,
  markUserVerified,
};
