import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http";

export default function DMList({ friends: friendsProp }) {
  const nav = useNavigate();
  const token = localStorage.getItem("token");
  const [friends, setFriends] = useState(friendsProp || []);

  useEffect(() => {
    if (friendsProp) return;
    async function load() {
      try {
        const res = await api.get("/friends/list");
        setFriends(res.data.friends || []);
      } catch (e) {
        console.error("Не удалось загрузить друзей:", e);
      }
    }
    load();
  }, [friendsProp, token]);

  const statusBadge = (status) => {
    if (status === "online") return "bg-green-500";
    if (status === "dnd") return "bg-red-500";
    return "bg-gray-500";
  };

  return (
    <div className="w-64 bg-[#111] border-r border-red-900 p-3 overflow-y-auto">
      <h2 className="text-red-500 font-bold mb-3">Сообщения</h2>

      {friends.map((u) => (
        <button
          key={u.id}
          onClick={() => nav(`/dm/${u.id}`)}
          className="w-full flex items-center p-2 hover:bg-[#1d1d1d] rounded-lg cursor-pointer text-left"
        >
          <div className="relative">
            <img
              src={u.avatar || "/default.png"}
              className="w-10 h-10 rounded-full"
            />
            <div
              className={`
              absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111]
              ${statusBadge(u.status)}
            `}
            />
          </div>
          <span className="ml-3 text-white">{u.username || u.name}</span>
        </button>
      ))}

      {friends.length === 0 && (
        <div className="text-gray-500 text-sm">Нет друзей — добавь их в списке друзей.</div>
      )}
    </div>
  );
}
