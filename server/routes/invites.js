const express = require("express");
const crypto = require("crypto");

const router = express.Router();

let invites = {}; 
// пример: invites[code] = { serverId, expires }

router.post("/create", (req, res) => {
  const { serverId } = req.body;

  const code = crypto.randomBytes(4).toString("hex");

  invites[code] = {
    serverId,
    expires: Date.now() + 1000 * 60 * 60 * 24, // 24 часа
  };

  res.json({
    invite: `http://localhost:3001/invite/${code}`,
    code,
  });
});

router.get("/:code", (req, res) => {
  const code = req.params.code;
  const invite = invites[code];

  if (!invite) return res.status(404).json({ error: "Ссылка недействительна" });

  if (invite.expires < Date.now()) {
    delete invites[code];
    return res.status(400).json({ error: "Ссылка истекла" });
  }

  res.json({ serverId: invite.serverId });
});

module.exports = router;
