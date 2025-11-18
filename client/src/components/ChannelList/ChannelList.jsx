import { useEffect, useState } from "react";
import { api } from "../../api/http";
import { useParams, useNavigate, useLocation } from "react-router-dom";

export default function ChannelList() {
  const { serverId } = useParams();
  const nav = useNavigate();
  const loc = useLocation();

  const [channels, setChannels] = useState([]);

  useEffect(() => {
    if (!serverId) return;

    api
      .get(`/channels/${serverId}`)
      .then((res) => {
        setChannels(res.data);
      })
      .catch((err) => {
        console.error("Ошибка загрузки каналов", err);
      });
  }, [serverId]);

  const goToChannel = (ch) => {
    nav(`/server/${serverId}/channel/${ch.id}`);
  };

  return (
    <div className="w-64 bg-[#0d0d0d] border-r border-[#2a0000] p-4">
      <h2 className="text-[#ff0000] text-lg font-bold mb-4">CHANNELS</h2>

      <div className="flex flex-col gap-2">
        {channels.map((ch) => {
          const active = loc.pathname.includes(`/channel/${ch.id}`);
          return (
            <button
              key={ch.id}
              onClick={() => goToChannel(ch)}
              className={`
                text-left px-3 py-2 rounded-md transition-all
                ${active ? "bg-[#b80000] text-white" : "text-gray-300 hover:bg-[#330000]"}
              `}
            >
              {ch.type === "voice" ? "🔊 " : "# "}
              {ch.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
