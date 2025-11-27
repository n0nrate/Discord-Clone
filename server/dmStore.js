const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "data", "messages.json");

function load() {
  if (!fs.existsSync(FILE)) return [];
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("dmStore load error:", e);
    return [];
  }
}

function save(list) {
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2));
}

function getConversation(userA, userB) {
  const data = load();
  return data.filter(
    (m) =>
      (m.from === userA && m.to === userB) ||
      (m.from === userB && m.to === userA)
  );
}

function addMessage({ from, to, text, time }) {
  const data = load();
  const msg = {
    id: Date.now().toString(),
    from,
    to,
    text,
    time: time || new Date().toISOString(),
  };
  data.push(msg);
  save(data);
  return msg;
}

module.exports = {
  getConversation,
  addMessage,
};
