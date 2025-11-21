const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { createUser, findUserByUsername } = require("../usersStore");

const router = express.Router();

// Секрет JWT (позже в .env)
const JWT_SECRET = "SUPER_SECRET_KEY_CHANGE_ME";

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Введите username и password" });
    }

    const existing = findUserByUsername(username);
    if (existing) {
      return res
        .status(400)
        .json({ error: "Пользователь с таким именем уже существует" });
    }

    const user = await createUser({ username, password });

    return res.status(201).json({
      message: "Пользователь создан",
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = findUserByUsername(username);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Неверный пароль" });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("Ошибка логина:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;
