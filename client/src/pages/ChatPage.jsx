import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/http";
import { createSocket } from "../api/socket";
import ServerSidebar from "../components/ServerSidebar";

export default function ChatPage() {
  const { serverId, channelId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(null);
  const [channelMeta, setChannelMeta] = useState(null);

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

    socketRef.current.on("message:new", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("typing", ({ author }) => {
      setTyping(author);
    });

    socketRef.current.on("stopTyping", () => {
      setTyping(null);
    });

    loadMessages();
    loadChannelMeta();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-channel", channelId);
        socketRef.current.off("message:new");
        socketRef.current.off("typing");
        socketRef.current.off("stopTyping");
        socketRef.current.disconnect();
      }
    };
  }, [channelId]);

  // ====== Авто-прокрутка ======
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full bg-[#0f0f0f] text-white">
      <ServerSidebar />

      <div className="flex-1 flex flex-col">
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                  {m.content}
                </div>
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
    </div>
  );
}
