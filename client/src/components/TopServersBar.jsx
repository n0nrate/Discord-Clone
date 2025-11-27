import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api/http";

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

  // подгружаем список серверов
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/servers");
        setServers(res.data || []);
      } catch (e) {
        console.error("Ошибка загрузки серверов", e);
      }
    }

    load();
  }, []);

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

  return (
    <>
      <div className="h-full w-full bg-black border-b border-[#2a0000] flex items-center gap-3 px-4">
        {[HOME, ...servers].map((s) => (
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
      </div>

      <CreateServerModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
