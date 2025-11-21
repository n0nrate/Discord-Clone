import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function TopServersBar() {
  const [servers, setServers] = useState([]);
  const nav = useNavigate();
  const loc = useLocation();

  const token = localStorage.getItem("token");

  async function loadServers() {
    const res = await axios.get("http://localhost:3001/servers/list", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setServers(res.data);
  }

  useEffect(() => {
    loadServers();
  }, []);

  function goTo(serverId) {
    nav(`/server/${serverId}`);
  }

  const isActive = (id) => loc.pathname.startsWith(`/server/${id}`);

  return (
    <div className="h-16 bg-black border-b border-[#2a0000] flex items-center px-4 gap-4">

      {/* Главная */}
      <button
        onClick={() => nav("/friends")}
        className={`
          w-12 h-12 flex items-center justify-center rounded-full text-2xl
          border-2 transition-all duration-150
          ${loc.pathname.startsWith("/friends")
            ? "bg-[#b80000] border-[#ff0000] shadow-[0_0_12px_#ff0000]"
            : "bg-[#151515] border-[#3a0000] hover:bg-[#ff0000]"
          }
        `}
      >
        🏠
      </button>

      {/* СЕРВЕРЫ */}
      {servers.map((s) => (
        <button
          key={s.id}
          onClick={() => goTo(s.id)}
          className={`
            w-12 h-12 flex items-center justify-center rounded-full
            border-2 transition-all duration-150
            ${isActive(s.id)
              ? "bg-[#b80000] border-[#ff0000] shadow-[0_0_12px_#ff0000]"
              : "bg-[#151515] border-[#3a0000] hover:bg-[#ff0000]"
            }
          `}
        >
          {s.emoji || "🎮"}
        </button>
      ))}

      <button
  onClick={() => nav("/create-server")}
  className="w-12 h-12 flex items-center justify-center rounded-full 
             text-3xl bg-[#151515] border-2 border-[#3a0000]
             hover:bg-[#ff0000] hover:border-[#ff0000]"
>
  +
</button>

    </div>
  );
}
