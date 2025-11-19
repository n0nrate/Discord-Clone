import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

import VoiceChannel from "../components/VoiceChannel"; // <<< ОБЯЗАТЕЛЬНО

export default function ChatPage() {
  const { serverId, channelId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const token = localStorage.getItem("token");
  const me = JSON.parse(localStorage.getItem("user")); // <<< твой user

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // Загружаем историю сообщений
  async function loadMessages() {
    const res = await axios.get(
      `http://localhost:3001/messages/${channelId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMessages(res.data);
  }

  // Отправка сообщения
  function send() {
    if (!text.trim()) return;

    const msg = {
      channelId,
      content: text,
      author: me.username,
    };

    socketRef.current.emit("message:send", msg);
    setText("");
  }

  // Socket.io подключение
  useEffect(() => {
    socketRef.current = io("http://localhost:3001");

    socketRef.current.emit("join-channel", channelId);

    socketRef.current.on("message:new", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    loadMessages();

    return () => {
      socketRef.current.emit("leave-channel", channelId);
      socketRef.current.off("message:new");
    };
  }, [channelId]);

  // Автопрокрутка вниз
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white">

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className="mb-3">
            <b className="text-red-400">{m.author}</b>: {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Ввод */}
      <div className="flex p-4 border-t border-red-900">
        <input
          className="flex-1 p-2 bg-[#222] border border-red-700"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="ml-2 p-2 bg-red-600" onClick={send}>
          Отправить
        </button>
      </div>

      {/* ВОЙС-КАНАЛ ВНИЗУ */}
      <VoiceChannel channelId={channelId} me={me} />
    </div>
  );
}
