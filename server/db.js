const Database = require("better-sqlite3");

const db = new Database("./database.sqlite", {
  verbose: console.log
});

// включаем foreign keys
db.exec("PRAGMA foreign_keys = ON;");

module.exports = db;
