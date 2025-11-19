// server/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const {
  createUser,
  findUserByEmail,
  markUserVerified,
} = require("../usersStore");

const { sendVerificationEmail } = require("../mail");

const router = express.Router();

// СЕКРЕТ ДЛЯ JWT (потом вынесем в .env)
const JWT_SECRET = "SUPER_SECRET_KEY_CHANGE_ME";

// генерация 6-значного кода
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ error: "Нужны email, username и password" });
    }

    const existing = findUserByEmail(email);
    if (existing) {
      return res
        .status(400)
        .json({ error: "Пользователь с таким email уже существует" });
    }

    const code = generateCode();

    const user = await createUser({
      email,
      username,
      password,
      verificationCode: code,
    });

    try {
      await sendVerificationEmail(email, code);
    } catch (err) {
      console.error("Ошибка отправки письма:", err);
      // для отладки можно вернуть код
      return res.status(500).json({
        error: "Не удалось отправить письмо",
        debugCode: code,
      });
    }

    res.status(201).json({
      message: "Пользователь создан, код отправлен на email",
      userId: user.id,
    });
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /auth/verify
router.post("/verify", (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Нужны email и code" });
  }

  const user = findUserByEmail(email);
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });

  if (user.verified) {
    return res.status(400).json({ error: "Пользователь уже подтверждён" });
  }

  if (user.verificationCode !== code) {
    return res.status(400).json({ error: "Неверный код" });
  }

  if (user.verificationExpires && user.verificationExpires < Date.now()) {
    return res.status(400).json({ error: "Код истёк" });
  }

  markUserVerified(email);

  res.json({ message: "Email успешно подтверждён" });
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = findUserByEmail(email);
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });

  if (!user.verified) {
    return res.status(400).json({ error: "Email не подтверждён" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: "Неверный пароль" });

  const token = jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
  });
});

module.exports = router;
