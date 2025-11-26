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

module.exports = router;
