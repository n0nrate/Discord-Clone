import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SimplePeer from "simple-peer";
import { createSocket } from "../api/socket";

export default function VoiceCallPage() {
  const { serverId, channelId } = useParams();
  const nav = useNavigate();
  const me = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const socket = useRef(null);
  const peersRef = useRef({});
  const streamsRef = useRef({});
  const audioContainerRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [volume, setVolume] = useState({});
  const [error, setError] = useState(null);
  const [muted, setMuted] = useState(false);
  const [deaf, setDeaf] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!me) {
      setError("Нужно войти, чтобы подключиться к голосовому каналу.");
      nav("/login");
      return;
    }

    if (!channelId) {
      setError("Не передан channelId.");
      return;
    }

    let mounted = true;

    (async () => {
      try {
        await startLocalAudio();
      } catch {
        return;
      }

      if (!mounted) return;

      socket.current = createSocket({ autoConnect: true });
      socket.current.emit("voice:join", { channelId, userId: me.id });

      socket.current.on("voice:users", ({ users }) => {
        setUsers(users);

        users
          .filter((u) => u.id !== me.id)
          .forEach((u) => {
            if (!peersRef.current[u.id]) {
              const initiator = me.id > u.id;
              peersRef.current[u.id] = createPeer(
                initiator,
                u.id,
                streamsRef.current.local
              );
            }
          });
      });

      socket.current.on("voice:signal", ({ fromUserId, data }) => {
        let peer = peersRef.current[fromUserId];
        if (!peer) {
          peer = createPeer(false, fromUserId, streamsRef.current.local);
          peersRef.current[fromUserId] = peer;
        }
        peer.signal(data);
      });
    })();

    return () => {
      mounted = false;
      if (socket.current) {
        socket.current.emit("voice:leave", { channelId, userId: me.id });
        socket.current.disconnect();
      }
      Object.values(peersRef.current).forEach((p) => p.destroy());
      peersRef.current = {};

      if (streamsRef.current.local) {
        streamsRef.current.local.getTracks().forEach((t) => t.stop());
        streamsRef.current.local = null;
      }
      if (streamsRef.current.share) {
        streamsRef.current.share.getTracks().forEach((t) => t.stop());
        streamsRef.current.share = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, me?.id]);

  async function startLocalAudio() {
    if (streamsRef.current.local) return streamsRef.current.local;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamsRef.current.local = stream;
      startVolumeMeter(stream, me.id);
      return stream;
    } catch (e) {
      setError("Нет доступа к микрофону. Разреши доступ и попробуй снова.");
      throw e;
    }
  }

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
      audio.muted = deaf;

      streamsRef.current[otherUserId] = remoteStream;
      audioContainerRef.current.appendChild(audio);

      startVolumeMeter(remoteStream, otherUserId);
    });

    return peer;
  }

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

  function toggleMute() {
    setMuted((prev) => {
      const next = !prev;
      if (streamsRef.current.local) {
        streamsRef.current.local
          .getAudioTracks()
          .forEach((t) => (t.enabled = !next));
      }
      socket.current?.emit("voice:state", {
        channelId,
        userId: me.id,
        muted: next,
        deaf,
      });
      return next;
    });
  }

  function toggleDeaf() {
    setDeaf((prev) => {
      const next = !prev;
      audioContainerRef.current
        ?.querySelectorAll("audio")
        .forEach((el) => (el.muted = next));
      socket.current?.emit("voice:state", {
        channelId,
        userId: me.id,
        muted,
        deaf: next,
      });
      return next;
    });
  }

  async function toggleScreenShare() {
    if (sharing) {
      if (streamsRef.current.share) {
        streamsRef.current.share.getTracks().forEach((t) => t.stop());
        streamsRef.current.share = null;
      }
      setSharing(false);
      return;
    }

    try {
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      streamsRef.current.share = display;
      setSharing(true);

      Object.values(peersRef.current).forEach((peer) => {
        display.getTracks().forEach((track) => {
          peer.addTrack(track, display);
        });
      });

      display.getVideoTracks()[0].addEventListener("ended", () => {
        setSharing(false);
        streamsRef.current.share = null;
      });
    } catch (e) {
      console.error("Screen share error:", e);
    }
  }

  function leave() {
    socket.current?.emit("voice:leave", { channelId, userId: me.id });
    socket.current?.disconnect();
    Object.values(peersRef.current).forEach((p) => p.destroy());
    peersRef.current = {};
    if (streamsRef.current.local) {
      streamsRef.current.local.getTracks().forEach((t) => t.stop());
      streamsRef.current.local = null;
    }
    if (streamsRef.current.share) {
      streamsRef.current.share.getTracks().forEach((t) => t.stop());
      streamsRef.current.share = null;
    }
    nav(`/server/${serverId}`);
  }

  return (
    <div className="h-full bg-[#0e0e0e] text-white p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-4 text-red-400">
        Голосовой канал #{channelId}
      </h1>

      {error && <div className="text-red-400 mb-3">{error}</div>}

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
              {u.muted && <div className="text-xs text-red-400">Muted</div>}
              {u.deaf && <div className="text-xs text-red-400">Deafened</div>}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={toggleMute}
          className={`px-4 py-2 rounded ${muted ? "bg-gray-700" : "bg-red-700"}`}
        >
          {muted ? "Unmute" : "Mute"}
        </button>
        <button
          onClick={toggleDeaf}
          className={`px-4 py-2 rounded ${deaf ? "bg-gray-700" : "bg-red-700"}`}
        >
          {deaf ? "Undeafen" : "Deafen"}
        </button>
        <button
          onClick={toggleScreenShare}
          className={`px-4 py-2 rounded ${sharing ? "bg-gray-700" : "bg-red-700"}`}
        >
          {sharing ? "Stop Share" : "Share Screen"}
        </button>
        <button
          onClick={leave}
          className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
        >
          Leave
        </button>
      </div>

      <div ref={audioContainerRef}></div>
    </div>
  );
}
