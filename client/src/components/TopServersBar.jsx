import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import CreateServerModal from "./modals/CreateServerModal";


const HOME = { id: "home", name: "Главная", icon: "🏠", type: "home" };

export default function TopServersBar() {
  const nav = useNavigate();
  const loc = useLocation();

  const [servers, setServers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  // грузим сервера с бэка
  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get("http://localhost:3001/servers");
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
    setServers((prev) => [...prev, server]);
    nav(`/server/${server.id}`);
  }

  return (
    <>
      <div className="h-16 bg-black border-b border-[#2a0000] flex items-center px-4 gap-4">
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

        {/* кнопка создать сервер */}
        <button
          onClick={() => setShowCreate(true)}
          className="
            w-10 h-10 flex items-center justify-center rounded-full
            border-2 border-dashed border-[#ff0000]
            text-xl text-[#ff0000]
            hover:bg-[#ff0000] hover:text-black transition
          "
          title="Создать сервер"
        >
          +
        </button>
        <button
          onClick={() => setCreateOpen(true)}
          className="w-12 h-12 flex items-center justify-center rounded-full
                   bg-[#151515] border-2 border-[#3a0000] hover:bg-[#ff0000]"
          >
             +
        </button>
      </div>

      <CreateServerModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(server) => {
          // если хочешь, можешь тут обновлять локальный список серверов
          console.log("Создан сервер:", server);
  }}
/>

    </>
  );
}
