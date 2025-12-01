const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const router = express.Router();
const CATEGORIES_PATH = path.join(__dirname, "..", "data", "categories.json");

function loadCategories() {
  if (!fs.existsSync(CATEGORIES_PATH)) return [];
  try {
    const raw = fs.readFileSync(CATEGORIES_PATH, "utf8");
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Ошибка чтения categories.json:", err);
    return [];
  }
}

function saveCategories(list) {
  fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(list, null, 2));
}

// GET /categories/:serverId — категории сервера
router.get("/:serverId", (req, res) => {
  const serverId = String(req.params.serverId);
  const categories = loadCategories().filter(
    (c) => String(c.serverId) === serverId
  );
  res.json(categories);
});

// POST /categories — создать категорию
// Body: { serverId, name, position? }
router.post("/", (req, res) => {
  const { serverId, name, position } = req.body;

  if (!serverId || !name) {
    return res
      .status(400)
      .json({ error: "Нужны serverId и name категории" });
  }

  const categories = loadCategories();
  const category = {
    id: uuid(),
    serverId: String(serverId),
    name,
    position:
      typeof position === "number"
        ? position
        : categories.filter((c) => String(c.serverId) === String(serverId))
            .length,
    createdAt: new Date().toISOString(),
  };

  categories.push(category);
  saveCategories(categories);

  res.status(201).json(category);
});

// PATCH /categories/:id — обновить имя/позицию
router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { name, position } = req.body;

  const categories = loadCategories();
  const idx = categories.findIndex((c) => String(c.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: "Категория не найдена" });

  if (name) categories[idx].name = name;
  if (typeof position === "number") categories[idx].position = position;

  saveCategories(categories);
  res.json(categories[idx]);
});

// DELETE /categories/:id — удалить категорию
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const categories = loadCategories();
  const exists = categories.some((c) => String(c.id) === String(id));
  if (!exists) return res.status(404).json({ error: "Категория не найдена" });

  const filtered = categories.filter((c) => String(c.id) !== String(id));
  saveCategories(filtered);
  res.json({ ok: true });
});

module.exports = router;
