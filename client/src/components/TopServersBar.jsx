import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api/http";
import { createSocket } from "../api/socket";

import CreateServerModal from "./modals/CreateServerModal";

const HOME = {
  id: "home",
  name: "Главная",
  icon: "🏠",
  type: "home",
};

export default function TopServersBar() {
  const nav = useNavigate();
  const loc = useLocation();

  const [servers, setServers] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const me = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  async function loadServers() {
    try {
      const res = await api.get("/servers");
      setServers(res.data || []);
    } catch (e) {
      console.error("Ошибка загрузки серверов", e);
    }
  }

  useEffect(() => {
    loadServers();
    const refresh = () => loadServers();
    window.addEventListener("servers-refresh", refresh);
    return () => window.removeEventListener("servers-refresh", refresh);
  }, []);

  useEffect(() => {
    const socket = createSocket({ autoConnect: true });
    socket.on("message:new", () => {
      beep();
      setUnreadCount((c) => c + 1);
    });
    socket.on("dm:receive", () => {
      beep();
      setUnreadCount((c) => c + 1);
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (loc.pathname.startsWith("/friends") || loc.pathname.startsWith("/dm")) {
      setUnreadCount(0);
    }
  }, [loc.pathname]);

  function goTo(item) {
    if (item.type === "home") {
      nav("/friends");
    } else {
      nav(`/server/${item.id}`);
    }
  }

  function isActive(item) {
    if (item.type === "home") {
      return loc.pathname.startsWith("/friends");
    }
    return loc.pathname.startsWith(`/server/${item.id}`);
  }

  function handleCreated(server) {
    // добавляем новый сервер в список и сразу переходим на него
    setServers((prev) => [...prev, server]);
    nav(`/server/${server.id}`);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("token-changed"));
    nav("/login");
  }

  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.error("beep error", e);
    }
  }

  return (
    <>
      <div className="h-full w-full bg-black border-b border-[#2a0000] flex items-center gap-3 px-4">
        {/* Дом */}
        <button
          onClick={() => goTo(HOME)}
          className={`
            w-12 h-12 flex items-center justify-center rounded-full text-2xl
            border-2 transition-all duration-150
            ${
              isActive(HOME)
                ? "bg-[#b80000] border-[#ff0000] shadow-[0_0_12px_#ff0000]"
                : "bg-[#151515] border-[#3a0000] hover:bg-[#ff0000] hover:border-[#ff0000]"
            }
          `}
          title={HOME.name}
        >
          {HOME.icon}
        </button>

        {unreadCount > 0 && (
          <div className="relative">
            <button
              onClick={() => nav("/friends")}
              className={`
                w-12 h-12 flex items-center justify-center rounded-full text-lg
                ${unreadCount > 0 ? "bg-red-700 text-white" : "bg-[#1f1f1f] text-gray-200"}
              `}
              title="Новые сообщения"
            >
              <img
                src={me?.avatar || "/default.png"}
                className="w-10 h-10 rounded-full"
                alt="profile"
              />
            </button>
            <div className="absolute -top-1 -right-1 min-w-[18px] px-1 h-4 bg-red-500 text-[10px] rounded-full flex items-center justify-center text-white">
              {unreadCount}
            </div>
          </div>
        )}

        <div className="w-px h-8 bg-[#2a0000]" />

        {/* Сервера */}
        {[...servers].map((s) => (
          <button
            key={s.id}
            onClick={() => goTo(s)}
            className={`
              w-12 h-12 flex items-center justify-center rounded-full text-2xl
              border-2 transition-all duration-150
              ${
                isActive(s)
                  ? "bg-[#b80000] border-[#ff0000] shadow-[0_0_12px_#ff0000]"
                  : "bg-[#151515] border-[#3a0000] hover:bg-[#ff0000] hover:border-[#ff0000]"
              }
            `}
            title={s.name}
          >
            {s.icon || s.name[0]?.toUpperCase()}
          </button>
        ))}

        <button
          onClick={() => setCreateOpen(true)}
          className="
            w-12 h-12 flex items-center justify-center rounded-full
            border-2 border-dashed border-[#ff0000]
            text-xl text-[#ff0000]
            hover:bg-[#ff0000] hover:text-black transition
          "
          title="Создать сервер"
        >
          +
        </button>

        <button
          onClick={() => setShowLogout((v) => !v)}
          className="ml-auto px-3 py-2 text-sm rounded bg-[#1f1f1f] text-gray-200 hover:bg-red-700"
        >
          Аккаунт
        </button>
        {showLogout && (
          <button
            onClick={logout}
            className="px-3 py-2 text-sm rounded bg-red-700 text-white hover:bg-red-600"
          >
            Выйти
          </button>
        )}
        {me && (
          <div className="text-gray-400 text-sm ml-2">
            {me.username}
          </div>
        )}
      </div>

      <CreateServerModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
