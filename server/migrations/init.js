const db = require("../db");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  avatar TEXT,
  statusText TEXT DEFAULT '',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS servers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  ownerId INTEGER NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS server_members (
  serverId INTEGER,
  userId INTEGER,
  role TEXT DEFAULT 'member',
  inVoiceChannel INTEGER DEFAULT NULL,
  screen BOOLEAN DEFAULT 0,
  PRIMARY KEY (serverId, userId),
  FOREIGN KEY (serverId) REFERENCES servers(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  serverId INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  FOREIGN KEY (serverId) REFERENCES servers(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channelId INTEGER NOT NULL,
  authorId INTEGER NOT NULL,
  content TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (channelId) REFERENCES channels(id),
  FOREIGN KEY (authorId) REFERENCES users(id)
);
`);

console.log("База данных успешно создана!");
