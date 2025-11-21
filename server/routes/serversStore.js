const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "data", "servers.json");
const CHANNELS_FILE = path.join(__dirname, "data", "channels.json");

function load(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let servers = load(FILE);
let channels = load(CHANNELS_FILE);

function createServer(ownerId, name) {
  const serverId = String(Date.now());

  const server = {
    id: serverId,
    name,
    ownerId,
  };

  servers.push(server);
  save(FILE, servers);

  // создаём дефолтные каналы
  const defaultText = {
    id: serverId + "-text-1",
    name: "основной",
    type: "text",
    serverId,
  };

  const defaultVoice = {
    id: serverId + "-voice-1",
    name: "Общий голосовой",
    type: "voice",
    serverId,
  };

  channels.push(defaultText, defaultVoice);
  save(CHANNELS_FILE, channels);

  return { server, channels: [defaultText, defaultVoice] };
}

function getServersByUser(userId) {
  return servers.filter((s) => s.ownerId === userId);
}

function getServer(id) {
  return servers.find((s) => s.id === id);
}

function getChannels(serverId) {
  return channels.filter((c) => c.serverId === serverId);
}

module.exports = {
  createServer,
  getServersByUser,
  getServer,
  getChannels,
};
