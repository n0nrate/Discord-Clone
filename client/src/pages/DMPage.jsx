import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/http";
import { createSocket } from "../api/socket";

export default function DMPage() {
  const { userId } = useParams();
  const token = localStorage.getItem("token");

  const socketRef = useRef(null);

  const me = JSON.parse(localStorage.getItem("user")).id;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  async function load() {
    const res = await api.get(`/dm/${userId}`);
    setMessages(res.data);
  }

  async function send() {
    const msg = {
      from: me,
      to: userId,
      text,
      time: new Date().toISOString()
    };

    socketRef.current.emit("dm:send", msg);

    setMessages(prev => [...prev, msg]);

    setText("");
  }

  useEffect(() => {
    load();
  }, [userId]);

  useEffect(() => {
    socketRef.current = createSocket({ autoConnect: true });
    socketRef.current.emit("join-dm", me);

    socketRef.current.on("dm:receive", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("dm:receive");
        socketRef.current.disconnect();
      }
    };
  }, [userId, me]);

  return (
    <div className="flex flex-col h-full p-4 bg-[#1a1a1a] text-white">

      <div className="flex-1 overflow-y-auto">
        {messages.map(m => (
          <div key={m.time} className="mb-3">
            <b>{m.from == userId ? "Он" : "Ты"}:</b> {m.text}
          </div>
        ))}
      </div>

      <div className="flex">
        <input
          className="flex-1 p-2 bg-[#222] border border-red-700"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button
          onClick={send}
          className="ml-2 p-2 bg-red-600"
        >
          Отправить
        </button>
      </div>
    </div>
  );
}
