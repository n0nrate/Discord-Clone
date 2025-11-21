import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

import VoiceChannel from "../components/VoiceChannel";

export default function ChatPage() {
  const { serverId, channelId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(null);

  const me = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const timeoutRef = useRef(null);

  // ====== Загрузка истории сообщений ======
  async function loadMessages() {
    const res = await axios.get(
      `http://localhost:3001/messages/${channelId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
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
    socketRef.current = io("http://localhost:3001");

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

    return () => {
      socketRef.current.emit("leave-channel", channelId);

      socketRef.current.off("message:new");
      socketRef.current.off("typing");
      socketRef.current.off("stopTyping");
    };
  }, [channelId]);

  // ====== Авто-прокрутка ======
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white p-4">

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto mb-3">
        {messages.map((m) => (
          <div key={m.id} className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center text-xl">
              👤
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

              <div className="text-gray-200">{m.content}</div>
            </div>
          </div>
        ))}

        {/* Вывод "печатает..." */}
        {typing && (
          <div className="text-gray-400 text-sm mb-2">{typing} печатает...</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Ввод */}
      <div className="flex p-3 border-t border-red-900">
        <input
          className="flex-1 p-2 bg-[#222] border border-red-700 outline-none"
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Написать сообщение..."
        />

        <button className="ml-2 p-2 bg-red-600" onClick={send}>
          Отправить
        </button>
      </div>

      {/* ВОЙС КАНАЛ */}
      <VoiceChannel channelId={channelId} me={me} />
    </div>
  );
}
