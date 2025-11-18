import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api/http";

const HOME_SERVER = {
  id: "home",
  name: "Главная",
  icon: "🏠",
  type: "home"
};

export default function TopServersBar() {
  const nav = useNavigate();
  const loc = useLocation();

  const [servers, setServers] = useState([HOME_SERVER]);

  useEffect(() => {
    api
      .get("/servers")
      .then((res) => {
        const fromBackend = res.data.map((s) => ({
          id: s.id,
          name: s.name,
          icon: s.icon || "💬",
          type: "server",
        }));
        setServers([HOME_SERVER, ...fromBackend]);
      })
      .catch((err) => {
        console.error("Ошибка загрузки серверов", err);
      });
  }, []);

  const goTo = (s) => {
    if (s.type === "home") nav("/friends");
    else nav(`/server/${s.id}`);
  };

  return (
    <div className="h-16 bg-black border-b border-[#2a0000] flex items-center px-4 gap-4">
      {servers.map((s) => {
        const active =
          (s.type === "home" && loc.pathname.startsWith("/friends")) ||
          (s.type === "server" && loc.pathname.startsWith(`/server/${s.id}`));
        return (
          <button
            key={s.id}
            onClick={() => goTo(s)}
            title={s.name}
            className={`
              w-12 h-12 flex items-center justify-center
              rounded-full text-2xl
              border-2 
              transition-all duration-150
              ${
                active
                  ? "bg-[#b80000] border-[#ff0000] shadow-[0_0_12px_#ff0000]"
                  : "bg-[#151515] border-[#3a0000] hover:bg-[#ff0000] hover:border-[#ff0000]"
              }
            `}
          >
            {s.icon}
          </button>
        );
      })}
    </div>
  );
}
