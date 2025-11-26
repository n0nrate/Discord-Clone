const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const router = express.Router();

const CHANNELS_PATH = path.join(__dirname, "..", "data", "channels.json");

function loadChannels() {
  if (!fs.existsSync(CHANNELS_PATH)) return [];
  return JSON.parse(fs.readFileSync(CHANNELS_PATH, "utf8"));
}

function saveChannels(list) {
  fs.writeFileSync(CHANNELS_PATH, JSON.stringify(list, null, 2));
}

function sortChannels(list) {
  return [...list].sort((a, b) => {
    const catA = a.categoryId || "";
    const catB = b.categoryId || "";
    if (catA !== catB) return catA.localeCompare(catB);

    const typeWeightA = a.type === "text" ? 0 : 1;
    const typeWeightB = b.type === "text" ? 0 : 1;
    if (typeWeightA !== typeWeightB) return typeWeightA - typeWeightB;

    const posA = typeof a.position === "number" ? a.position : 0;
    const posB = typeof b.position === "number" ? b.position : 0;
    return posA - posB;
  });
}

// GET /channels/:serverId
// Вернёт только каналы данного сервера
router.get("/:serverId", (req, res) => {
  const serverId = String(req.params.serverId);
  const channels = sortChannels(
    loadChannels().filter((c) => String(c.serverId) === serverId)
  );

  res.json(channels);
});

// POST /channels
// Body: { serverId, name, type, categoryId?, position? }
router.post("/", (req, res) => {
  const { serverId, name, type, categoryId, position } = req.body;

  if (!serverId || !name || !type) {
    return res
      .status(400)
      .json({ error: "Нужны serverId, name и type (text/voice)" });
  }

  const channels = loadChannels();

  const channel = {
    id: uuid(),
    serverId: String(serverId),
    name,
    type, // "text" | "voice"
    categoryId: categoryId ? String(categoryId) : null,
    position:
      typeof position === "number"
        ? position
        : channels.filter((c) => String(c.serverId) === String(serverId))
            .length,
  };

  channels.push(channel);
  saveChannels(channels);

  res.status(201).json(channel);
});

// PATCH /channels/:id — изменить имя / тип / категорию / позицию
router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { name, type, categoryId, position } = req.body;

  const channels = loadChannels();
  const idx = channels.findIndex((c) => String(c.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: "Канал не найден" });

  const channel = channels[idx];

  if (name) channel.name = name;
  if (type === "text" || type === "voice") channel.type = type;
  if (typeof position === "number") channel.position = position;
  if (categoryId !== undefined) {
    channel.categoryId = categoryId ? String(categoryId) : null;
  }

  channels[idx] = channel;
  saveChannels(channels);

  res.json(channel);
});

module.exports = router;
