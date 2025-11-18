import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/http";
import { socket } from "../api/socket";

export default function ChatPage() {
  const { serverId, channelId } = useParams();
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // загрузка истории сообщений
  useEffect(() => {
    if (!channelId) return;
    setLoading(true);
    api
      .get(`/messages/${channelId}`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Ошибка загрузки сообщений", err))
      .finally(() => setLoading(false));
  }, [channelId]);

  // подключение к socket.io и подписка на новые сообщения
  useEffect(() => {
    if (!channelId) return;

    socket.connect();
    socket.emit("join-channel", channelId);

    const handleNewMessage = (msg) => {
      if (msg.channelId === channelId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.emit("leave-channel", channelId);
      socket.disconnect();
    };
  }, [channelId]);

  // автоскролл вниз
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    const text = value.trim();
    if (!text || !channelId) return;

    // временно хардкодим имя
    const user = JSON.parse(localStorage.getItem("user"));
    const author = user?.username || "Unknown";
    
    socket.emit("message:send", {
      channelId,
      content: text,
      author,
    });

    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#181818]">
      {/* заголовок канала */}
      <div className="h-12 bg-[#121212] border-b border-[#2a0000] flex items-center px-4 text-sm">
        <span className="font-semibold text-white">Канал {channelId}</span>
        <span className="text-[#777] ml-2 text-xs">сервер {serverId}</span>
      </div>

      {/* сообщения */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="text-xs text-[#888]">Загрузка сообщений…</div>
        )}

        {messages.map((m) => (
          <div key={m.id} className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-[#444]" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">
                  {m.author}
                </span>
                <span className="text-[11px] text-[#777]">
                  {m.createdAt &&
                    new Date(m.createdAt).toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </span>
              </div>
              <div className="text-sm text-[#ddd]">{m.content}</div>
            </div>
          </div>
        ))}

        {!loading && messages.length === 0 && (
          <div className="text-xs text-[#888]">
            Пока нет сообщений. Напиши что-нибудь первым.
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* инпут */}
      <div className="h-16 bg-[#101010] border-t border-[#2a0000] flex items-center px-4">
        <input
          className="w-full bg-[#181818] border border-[#2a0000] rounded-md px-3 py-2 text-sm outline-none focus:border-[#ff0000] text-white"
          placeholder="Написать сообщение..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
