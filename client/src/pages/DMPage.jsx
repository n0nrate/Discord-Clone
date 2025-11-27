import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/http";
import { createSocket } from "../api/socket";
import DMList from "../components/DMList";

export default function DMPage() {
  const { userId } = useParams();
  const nav = useNavigate();
  const me = JSON.parse(localStorage.getItem("user") || "null");

  const socketRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userCard, setUserCard] = useState(null);

  async function load() {
    try {
      const res = await api.get(`/dm/${userId}`);
      setMessages(res.data);
      const friends = await api.get("/friends/list");
      const card = (friends.data.friends || []).find((f) => f.id === userId);
      setUserCard(card || null);
    } catch (e) {
      console.error("Не удалось загрузить ЛС:", e);
    }
  }

  async function send() {
    if (!text.trim()) return;
    const msg = {
      from: me.id,
      to: userId,
      text,
      time: new Date().toISOString(),
    };

    socketRef.current.emit("dm:send", msg);
    setMessages((prev) => [...prev, msg]);
    setText("");
  }

  useEffect(() => {
    if (!me) {
      nav("/login");
      return;
    }
    load();
  }, [userId]);

  useEffect(() => {
    if (!me) return;
    socketRef.current = createSocket({ autoConnect: true });
    socketRef.current.emit("join-dm", me.id);

    socketRef.current.on("dm:receive", (msg) => {
      if (
        (msg.from === me.id && msg.to === userId) ||
        (msg.to === me.id && msg.from === userId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("dm:receive");
        socketRef.current.disconnect();
      }
    };
  }, [userId, me.id]);

  return (
    <div className="flex h-full bg-[#0f0f0f] text-white">
      <DMList />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b border-[#1f1f1f] flex items-center px-4 gap-3">
          <div className="font-semibold text-lg">
            {userCard?.username || "Личные сообщения"}
          </div>
        </div>

        <div className="flex flex-1">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div key={m.time} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#222] rounded-full flex items-center justify-center text-xl">
                    {(m.from === me.id ? me.username : userCard?.username || "👤")[0]}
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">
                      {m.from === me.id ? me.username : userCard?.username || "Он"}
                    </div>
                    <div className="text-gray-200">{m.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#1f1f1f] flex gap-3">
              <input
                className="flex-1 p-3 bg-[#1a1a1a] border border-[#2b2b2b] rounded-md outline-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Написать сообщение..."
              />
              <button
                onClick={send}
                className="px-4 bg-red-600 rounded-md hover:bg-red-500"
              >
                Отправить
              </button>
            </div>
          </div>

          <div className="w-72 border-l border-[#1f1f1f] p-4 hidden lg:block">
            {userCard ? (
              <div className="bg-[#161616] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <img
                    src={userCard.avatar || "/default.png"}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold">{userCard.username}</div>
                    <div className="text-xs text-gray-400">{userCard.status || "online"}</div>
                  </div>
                </div>
                {userCard.statusText && (
                  <div className="text-sm text-gray-300">{userCard.statusText}</div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">Выбери собеседника.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
