module.exports = function gateway(io, { usersStore, createMessage, addDMMessage }) {
  // in-memory voice presence
  const voiceUsersByChannel = {};

  io.on("connection", (socket) => {
    console.log("Пользователь подключён:", socket.id);

    // ====== TEXT ======
    socket.on("join-channel", (channelId) => {
      socket.join(channelId);
    });

    socket.on("leave-channel", (channelId) => {
      socket.leave(channelId);
    });

    socket.on("message:send", ({ channelId, content, author }) => {
      if (!content?.trim()) return;
      const msg = createMessage(channelId, { author, content });
      io.to(channelId).emit("message:new", msg); // legacy
      io.to(channelId).emit("messageCreated", msg);
    });

    socket.on("typing", ({ channelId, author }) => {
      socket.to(channelId).emit("typing", { author });
      socket.to(channelId).emit("typingStart", { channelId, author });
    });

    socket.on("stopTyping", ({ channelId }) => {
      socket.to(channelId).emit("stopTyping");
      socket.to(channelId).emit("typingStop", { channelId });
    });

    // ====== DM ======
    socket.on("join-dm", (userId) => {
      socket.join(`dm-${userId}`);
    });

    socket.on("dm:send", (msg) => {
      addDMMessage({
        from: msg.from,
        to: msg.to,
        text: msg.text,
        time: msg.time,
      });
      io.to(`dm-${msg.to}`).emit("dm:receive", msg);
      io.to(`dm-${msg.from}`).emit("dm:receive", msg);
    });

    // ====== VOICE ======
    socket.on("voice:join", ({ channelId, userId }) => {
      if (!voiceUsersByChannel[channelId]) {
        voiceUsersByChannel[channelId] = {};
      }
      const allUsers = usersStore.getAll ? usersStore.getAll() : [];
      const user =
        allUsers.find((u) => String(u.id) === String(userId)) || {
          id: userId,
          username: "User",
          avatar: null,
        };

      voiceUsersByChannel[channelId][userId] = {
        socketId: socket.id,
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      };

      socket.join(`voice-${channelId}`);
      io.to(`voice-${channelId}`).emit("voice:users", {
        channelId,
        users: Object.values(voiceUsersByChannel[channelId]),
      });
      io.to(`voice-${channelId}`).emit("voiceUserJoined", {
        channelId,
        user: voiceUsersByChannel[channelId][userId],
      });
    });

    socket.on("voice:leave", ({ channelId, userId }) => {
      if (voiceUsersByChannel[channelId]) {
        delete voiceUsersByChannel[channelId][userId];
        if (Object.keys(voiceUsersByChannel[channelId]).length === 0) {
          delete voiceUsersByChannel[channelId];
        }
      }
      socket.leave(`voice-${channelId}`);
      io.to(`voice-${channelId}`).emit("voice:users", {
        channelId,
        users: voiceUsersByChannel[channelId]
          ? Object.values(voiceUsersByChannel[channelId])
          : [],
      });
      io.to(`voice-${channelId}`).emit("voiceUserLeft", {
        channelId,
        userId,
      });
    });

    socket.on("voice:signal", ({ channelId, toUserId, fromUserId, data }) => {
      const channel = voiceUsersByChannel[channelId];
      if (!channel) return;
      const peer = channel[toUserId];
      if (!peer) return;

      io.to(peer.socketId).emit("voice:signal", {
        channelId,
        fromUserId,
        data,
      });
      io.to(peer.socketId).emit("voiceSignal", {
        channelId,
        fromUserId,
        data,
      });
    });

    socket.on("voice:state", ({ channelId, userId, muted, deaf }) => {
      if (!voiceUsersByChannel[channelId]) return;
      if (!voiceUsersByChannel[channelId][userId]) return;
      voiceUsersByChannel[channelId][userId].muted = muted;
      voiceUsersByChannel[channelId][userId].deaf = deaf;
      io.to(`voice-${channelId}`).emit("voice:users", {
        channelId,
        users: Object.values(voiceUsersByChannel[channelId]),
      });
    });

    socket.on("disconnect", () => {
      console.log("Пользователь отключён:", socket.id);
    });
  });
};
