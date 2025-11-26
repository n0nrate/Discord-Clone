const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const FILE = path.join(__dirname, "data", "users.json");

function load() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

let users = load();

// Найти по username
function findUserByUsername(username) {
  return users.find((u) => u.username === username);
}

// Создать пользователя
async function createUser({ username, password }) {
  const id = String(Date.now());
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    id,
    username,
    passwordHash,
    status: "online",
  };

  users.push(user);
  save(users);
  return user;
}

module.exports = {
  findUserByUsername,
  createUser,
  getAll: () => users,
};
