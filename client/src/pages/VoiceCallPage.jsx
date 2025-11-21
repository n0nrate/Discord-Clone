import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import SimplePeer from "simple-peer";

export default function VoiceCallPage() {
  const { serverId, channelId } = useParams();
  const me = JSON.parse(localStorage.getItem("user"));

  const socket = useRef(null);
  const [users, setUsers] = useState([]);
  const peersRef = useRef({});
  const streamsRef = useRef({});
  const audioContainerRef = useRef(null);

  const [volume, setVolume] = useState({});

  // ======== подключение ========
  useEffect(() => {
    socket.current = io("http://localhost:3001");

    socket.current.emit("voice:join", { channelId, userId: me.id });

    socket.current.on("voice:users", ({ users }) => {
      setUsers(users);
    });

    socket.current.on("voice:signal", ({ fromUserId, data }) => {
      let peer = peersRef.current[fromUserId];
      if (!peer) {
        peer = createPeer(false, fromUserId);
        peersRef.current[fromUserId] = peer;
      }
      peer.signal(data);
    });

    return () => {
      socket.current.emit("voice:leave", { channelId, userId: me.id });
      socket.current.disconnect();
    };
  }, [channelId]);


  // ======== создание WebRTC ========
  function createPeer(initiator, otherUserId, stream = streamsRef.current.local) {
    const peer = new SimplePeer({
      initiator,
      trickle: true,
      stream,
    });

    peer.on("signal", (data) => {
      socket.current.emit("voice:signal", {
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

      streamsRef.current[otherUserId] = remoteStream;
      audioContainerRef.current.appendChild(audio);

      startVolumeMeter(remoteStream, otherUserId);
    });

    return peer;
  }

  // ======== анализ громкости ========
  function startVolumeMeter(stream, id) {
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;

    const src = ctx.createMediaStreamSource(stream);
    src.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);

    function tick() {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;

      setVolume((prev) => ({ ...prev, [id]: avg }));
      requestAnimationFrame(tick);
    }
    tick();
  }


  return (
    <div className="h-full bg-[#0e0e0e] text-white p-6 flex flex-col">

      <h1 className="text-2xl font-bold mb-4 text-red-400">
        Голосовой канал #{channelId}
      </h1>

      {/* Сетка участников */}
      <div className="grid grid-cols-3 gap-4 flex-1">
        {users.map((u) => {
          const speaking = (volume[u.id] || 0) > 25;

          return (
            <div
              key={u.id}
              className={`
                flex flex-col items-center justify-center p-4 rounded-xl
                bg-[#181818] border
                ${speaking ? "border-red-500 shadow-[0_0_15px_#ff0000]" : "border-[#333]"}
              `}
            >
              <div className="w-20 h-20 rounded-full bg-[#222] overflow-hidden mb-2 flex items-center justify-center">
                {u.avatar ? (
                  <img src={u.avatar} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🎤</span>
                )}
              </div>

              <div className="text-sm">{u.username}</div>
            </div>
          );
        })}
      </div>

      <div ref={audioContainerRef}></div>
    </div>
  );
}
