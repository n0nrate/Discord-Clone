import { useNavigate, useLocation } from "react-router-dom";

const SERVERS = [
  { id: "home", name: "Главная", icon: "🏠", type: "home" },
  { id: "1", name: "Геймдев", icon: "🎮", type: "server" },
  { id: "2", name: "Аниме", icon: "🌸", type: "server" },
  { id: "3", name: "Футбол", icon: "⚽", type: "server" },
];

export default function TopServersBar() {
  const nav = useNavigate();
  const loc = useLocation();

  const goTo = (s) => {
    if (s.type === "home") nav("/friends");
    else nav(`/server/${s.id}`);
  };

  return (
    <div className="h-16 bg-black border-b border-[#2a0000] flex items-center px-4 gap-4">
      {SERVERS.map((s) => {
        const active =
          (s.type === "home" && loc.pathname.startsWith("/friends")) ||
          (s.type === "server" && loc.pathname.startsWith(`/server/${s.id}`));
        return (
          <button
            key={s.id}
            onClick={() => goTo(s)}
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
