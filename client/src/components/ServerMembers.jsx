import { useEffect, useState } from "react";
import { api } from "../api/http";
import { useParams } from "react-router-dom";

export default function ServerMembers() {
  const { serverId } = useParams();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const server = await api.get(`/servers/${serverId}`);
        const ids = [
          server.data.ownerId,
          ...(server.data.members || []),
        ].filter(Boolean);
        const users = await api.get("/friends/list"); // используем getAll пользователей через friends? пока нет отдельного
        const all = users.data?.friends || [];
        const resolved = ids
          .map((id) => all.find((u) => u.id === id))
          .filter(Boolean);
        setMembers(resolved);
      } catch (e) {
        console.error("Не удалось загрузить участников", e);
      }
    }
    load();
  }, [serverId]);

  return (
    <div className="w-[260px] flex-shrink-0 border-l border-[#1f1f1f] bg-[#101010] text-white p-3 hidden lg:block">
      <div className="text-sm text-gray-400 mb-2 uppercase">Участники</div>
      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3">
            <img
              src={m.avatar || "/default.png"}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-semibold">{m.username}</div>
              {m.status && (
                <div className="text-xs text-gray-400">{m.status}</div>
              )}
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <div className="text-gray-500 text-sm">Участников пока нет.</div>
        )}
      </div>
    </div>
  );
}
