import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/http";
import { createSocket } from "../api/socket";
import ServerSidebar from "../components/ServerSidebar";
import ServerMembers from "../components/ServerMembers";

export default function ChatPage() {
  const { serverId, channelId } = useParams();
  const nav = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(null);
  const [channelMeta, setChannelMeta] = useState(null);
  const [inviteInfo, setInviteInfo] = useState({});

  const me = JSON.parse(localStorage.getItem("user"));

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const timeoutRef = useRef(null);

  // ====== Загрузка истории сообщений ======
  async function loadMessages() {
    const res = await api.get(`/messages/${channelId}`);
    setMessages(res.data);
  }

  // ====== Отправка сообщения ======
  function send() {
    if (!text.trim()) return;

    socketRef.current.emit("message:send", {
      channelId,
      content: text,
      author: me.username,
    });

    setText("");

    socketRef.current.emit("stopTyping", { channelId });
  }

  // ====== typing ======
  function handleTyping(e) {
    setText(e.target.value);

    socketRef.current.emit("typing", {
      channelId,
      author: me.username,
    });

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stopTyping", { channelId });
    }, 800);
  }

  // ====== Socket.io ======
  useEffect(() => {
    async function loadChannelMeta() {
      try {
        const res = await api.get(`/channels/${serverId}`);
        const found = (res.data || []).find((c) => c.id === channelId);
        setChannelMeta(found || null);
      } catch (e) {
        console.error("Не удалось загрузить канал:", e);
      }
    }

    socketRef.current = createSocket({ autoConnect: true });

    socketRef.current.emit("join-channel", channelId);

    const onNew = (msg) => setMessages((prev) => [...prev, msg]);
    socketRef.current.on("message:new", onNew);
    socketRef.current.on("messageCreated", onNew);

    const onTypingStart = ({ author }) => setTyping(author);
    const onTypingStop = () => setTyping(null);
    socketRef.current.on("typing", onTypingStart);
    socketRef.current.on("stopTyping", onTypingStop);
    socketRef.current.on("typingStart", onTypingStart);
    socketRef.current.on("typingStop", onTypingStop);

    loadMessages();
    loadChannelMeta();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-channel", channelId);
        socketRef.current.off("message:new", onNew);
        socketRef.current.off("messageCreated", onNew);
        socketRef.current.off("typing", onTypingStart);
        socketRef.current.off("stopTyping", onTypingStop);
        socketRef.current.off("typingStart", onTypingStart);
        socketRef.current.off("typingStop", onTypingStop);
        socketRef.current.disconnect();
      }
    };
  }, [channelId]);

  // подтянуть превью инвайтов в полученных сообщениях
  useEffect(() => {
    messages.forEach((m) => {
      const code = extractInviteCode(m.content);
      if (code && !inviteInfo[code]) {
        api
          .get(`/invites/${code}`)
          .then((res) => {
            setInviteInfo((prev) => ({ ...prev, [code]: res.data }));
          })
          .catch(() => {});
      }
    });
  }, [messages]);

  // ====== Авто-прокрутка ======
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function extractInviteCode(text = "") {
    const match =
      text.match(/discord\.gg\/([A-Za-z0-9]+)/i) ||
      text.match(/invite\/([A-Za-z0-9]+)/i);
    return match ? match[1] : null;
  }

  function openExternal(url) {
    try {
      const inviteCode = extractInviteCode(url);
      if (inviteCode) {
        api.post(`/invites/${inviteCode}/join`).then((res) => {
          window.dispatchEvent(new Event("servers-refresh"));
          nav(`/server/${res.data.serverId}`);
        });
        return;
      }
      window.open(url, "_blank");
    } catch (e) {
      console.error("cannot open link", e);
    }
  }

  function renderContent(content = "") {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.split(urlRegex).map((part, idx) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={idx}
            href={part}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              e.preventDefault();
              openExternal(part);
            }}
            className="text-blue-400 underline"
          >
            {part}
          </a>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  }

  function renderInvitePreview(content = "") {
    const code = extractInviteCode(content);
    if (!code || !inviteInfo[code]) return null;
    const info = inviteInfo[code];
    return (
      <div className="mt-2 bg-[#161616] border border-red-800 rounded-lg p-3 w-64">
        <div className="font-semibold text-white">{info.serverName}</div>
        <div className="text-sm text-gray-400">
          Участники: {info.membersCount || 0}
        </div>
        <button
          className="mt-2 w-full bg-green-600 hover:bg-green-500 rounded px-3 py-1 text-white text-sm"
          onClick={() => {
            api.post(`/invites/${code}/join`).then((res) => {
              window.dispatchEvent(new Event("servers-refresh"));
              nav(`/server/${res.data.serverId}`);
            });
          }}
        >
          Перейти на сервер
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-[#0f0f0f] text-white min-h-0">
      <ServerSidebar />

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Заголовок канала */}
        <div className="h-14 border-b border-[#1f1f1f] flex items-center px-4 gap-3">
          <span className="text-xl text-red-400">
            {channelMeta?.type === "voice" ? "🔊" : "#"}
          </span>
          <div>
            <div className="font-semibold text-lg">
              {channelMeta?.name || "Канал"}
            </div>
            <div className="text-xs text-gray-500">
              Общение в реальном времени
            </div>
          </div>
        </div>

        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.map((m) => (
            <div key={m.id} className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#222] rounded-full flex items-center justify-center text-xl">
                {m.author?.[0]?.toUpperCase() || "👤"}
              </div>

              <div>
                <div className="text-sm">
                  <span className="font-bold text-red-400">{m.author}</span>
                  <span className="text-gray-500 text-xs ml-2">
                    {new Date(m.createdAt).toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="text-gray-200 whitespace-pre-wrap">
                  {renderContent(m.content)}
                </div>
                {renderInvitePreview(m.content)}
              </div>
            </div>
          ))}

          {/* Вывод "печатает..." */}
          {typing && (
            <div className="text-gray-400 text-sm">{typing} печатает...</div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Ввод */}
        <div className="p-4 border-t border-[#1f1f1f] flex gap-3">
          <input
            className="flex-1 p-3 bg-[#1a1a1a] border border-[#2b2b2b] rounded-md outline-none"
            value={text}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Написать сообщение..."
          />

          <button
            className="px-4 bg-red-600 rounded-md hover:bg-red-500"
            onClick={send}
          >
            Отправить
          </button>
        </div>
      </div>
      <ServerMembers />
    </div>
  );
}
