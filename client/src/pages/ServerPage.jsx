import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/http";
import ServerSidebar from "../components/ServerSidebar";

export default function ServerPage() {
  const { serverId } = useParams();
  const nav = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function goToFirstChannel() {
      try {
        const res = await api.get(`/channels/${serverId}`);
        const channels = res.data || [];
        if (channels.length > 0) {
          const firstText = channels.find((c) => c.type === "text");
          const target = firstText || channels[0];
          nav(`/server/${serverId}/${target.type === "voice" ? "voice" : "channel"}/${target.id}`, { replace: true });
        }
      } catch (e) {
        console.error("Не удалось загрузить каналы для редиректа:", e);
      }
    }
    goToFirstChannel();
  }, [serverId, nav, token]);

  return (
    <div className="flex h-full bg-[#0f0f0f] text-white">
      <ServerSidebar />
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Выберите канал слева
      </div>
    </div>
  );
}
