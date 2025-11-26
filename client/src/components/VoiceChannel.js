import { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { createSocket } from "../api/socket";

const socket = createSocket();

export default function VoiceChannel({ channelId, me }) {
  const [users, setUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(false);
  const [deaf, setDeaf] = useState(false);

  const peersRef = useRef({});
  const streamsRef = useRef({});
  const localStreamRef = useRef(null);
  const audioContainerRef = useRef(null);

  const [volumeLevels, setVolumeLevels] = useState({});

  // ====== Volume Meter ======
  function attachVolumeMeter(stream, userId) {
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    const micSource = ctx.createMediaStreamSource(stream);
    micSource.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function update() {
      analyser.getByteFrequencyData(dataArray);
      let volume =
        dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

      setVolumeLevels((prev) => ({
        ...prev,
        [userId]: volume,
      }));

      requestAnimationFrame(update);
    }
    update();
  }

  // ====== WebRTC ======
  useEffect(() => {
    if (!channelId || !me) return;

    socket.connect();
    socket.emit("voice:join", { channelId, userId: me.id });

    socket.on("voice:users", ({ channelId: ch, users }) => {
      if (ch !== channelId) return;
      setUsers(users);
    });

    socket.on("voice:signal", ({ channelId: ch, fromUserId, data }) => {
      if (ch !== channelId) return;
      let peer = peersRef.current[fromUserId];
      if (!peer) {
        peer = createPeer(false, fromUserId);
        peersRef.current[fromUserId] = peer;
      }
      peer.signal(data);
    });

    return () => {
      socket.emit("voice:leave", { channelId, userId: me.id });

      Object.values(peersRef.current).forEach((p) => p.destroy());
      peersRef.current = {};
      streamsRef.current = {};

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      socket.off("voice:users");
      socket.off("voice:signal");
      socket.disconnect();

      setConnected(false);
      setUsers([]);
    };
  }, [channelId]);

  // ====== Подключение к микрофону ======
  async function startVoice() {
    if (connected) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    localStreamRef.current = stream;
    setConnected(true);

    attachVolumeMeter(stream, me.id);

    // создаём peer-коннекты
    users.forEach((u) => {
      if (u.id === me.id) return;
      const peer = createPeer(true, u.id, stream);
      peersRef.current[u.id] = peer;
    });
  }

  function createPeer(initiator, otherUserId, stream = localStreamRef.current) {
    const peer = new SimplePeer({
      initiator,
      trickle: true,
      stream,
    });

    peer.on("signal", (data) => {
      socket.emit("voice:signal", {
        channelId,
        toUserId: otherUserId,
        fromUserId: me.id,
        data,
      });
    });

    peer.on("stream", (remoteStream) => {
      const audio = document.createElement("audio");
      audio.srcObject = remoteStream;
      audio.autoplay = true;
      audioContainerRef.current?.appendChild(audio);

      streamsRef.current[otherUserId] = remoteStream;
      attachVolumeMeter(remoteStream, otherUserId);
    });

    return peer;
  }

  // ====== MUTE / DEAF ======
  function toggleMute() {
  setMuted((prev) => {
    const newMuted = !prev;

    if (localStreamRef.current) {
      localStreamRef.current
        .getAudioTracks()
        .forEach((t) => (t.enabled = !newMuted));
    }
    socket.emit("voice:state", {
      channelId,
      userId: me.id,
      muted: newMuted,
      deaf
    });
    return newMuted;
  });
}

  function toggleDeaf() {
    setDeaf((prev) => {
      const newDeaf = !prev;
      const enabled = !newDeaf;

      Object.values(streamsRef.current).forEach((remoteStream) => {
        remoteStream.getAudioTracks().forEach((t) => (t.enabled = enabled));
      });

      socket.emit("voice:state", {
        channelId,
        userId: me.id,
        muted,
        deaf: newDeaf,
      });

      return newDeaf;
    });
  }

  function leaveVoice() {
    socket.emit("voice:leave", { channelId, userId: me.id });
    Object.values(peersRef.current).forEach((p) => p.destroy());
    peersRef.current = {};
    streamsRef.current = {};
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    setUsers((prev) => prev.filter((u) => u.id !== me.id));
    setConnected(false);
  }

  // ====== UI ======
  return (
    <div className="p-3 bg-[#0e0e0e] border-t border-red-900">

      {/* Участники */}
      <div className="flex gap-3 mb-3 overflow-x-auto">
       {users.map((u) => {
         const speaking = (volumeLevels[u.id] || 0) > 30;

         return (
          <div
            key={u.id}
            className={`flex flex-col items-center p-2 rounded-xl border 
                ${speaking ? "border-red-500 shadow-[0_0_10px_#ff0000]" : "border-[#333]"}`}
             >
              <div className="relative">
                <div
                  className={`
                    w-12 h-12 rounded-full bg-[#222] overflow-hidden
                  flex items-center justify-center
                  ${speaking ? "ring-2 ring-red-600 voice-tile-speaking" : ""}
                `}
               >
                  {u.avatar ? (
                    <img src={u.avatar} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">🎤</span>
                  )}
                </div>

                {/* Значок MUTE */}
                {u.muted && (
                <div className="absolute -bottom-1 -right-1 bg-red-700 rounded-full p-1 text-xs">
                  🔇
                </div>
              )}

                {/* Значок DEAF */}
                {u.deaf && (
                <div className="absolute -bottom-1 -right-1 bg-red-700 rounded-full p-1 text-xs">
                  🎧
                </div>
                )}
              </div>


              <div className="text-xs text-gray-300 mt-1">
              {u.username}
              {u.id === me.id && muted && " (muted)"}
              {u.id === me.id && deaf && " (deaf)"}
              </div>
            </div>
         );
    })}

      </div>

      {/* Кнопки */}
      <div className="flex gap-3">

        {!connected ? (
          <button
            onClick={startVoice}
            className="bg-red-700 px-4 py-2 rounded hover:bg-red-600"
          >
            Подключиться
          </button>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={`px-3 py-2 rounded ${
                muted ? "bg-gray-700" : "bg-red-700"
              }`}
            >
              {muted ? "Unmute" : "Mute"}
            </button>

            <button
              onClick={toggleDeaf}
              className={`px-3 py-2 rounded ${
                deaf ? "bg-gray-700" : "bg-red-700"
              }`}
            >
              {deaf ? "Undeafen" : "Deafen"}
            </button>

            <button
              onClick={leaveVoice}
              className="bg-gray-600 px-3 py-2 rounded hover:bg-gray-500"
            >
              Выйти
            </button>
          </>
        )}
      </div>

      <div ref={audioContainerRef} />
    </div>
  );
}
