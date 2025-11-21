// client/src/components/ServerSidebar.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import CreateChannelModal from "./modals/CreateChannelModal";
import CreateInviteModal from "./modals/CreateInviteModal";


export default function ServerSidebar() {
  const { serverId } = useParams();
  const nav = useNavigate();
  const loc = useLocation();

  const [channels, setChannels] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);


  const token = localStorage.getItem("token");

  // Загружаем каналы
  async function load() {
    const res = await axios.get(`http://localhost:3001/channels/${serverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setChannels(res.data);
  }

  useEffect(() => {
    load();
  }, [serverId]);

if (c.type === "voice") {
  nav(`/server/${serverId}/voice/${c.id}`)
} else {
  nav(`/server/${serverId}/channel/${c.id}`)
}

  function isActive(channelId) {
    return loc.pathname.includes(`/channel/${channelId}`);
  }

  return (
    <>
      <div className="w-64 bg-[#111] border-r border-red-900 flex flex-col select-none">

        {/* Заголовок сервера */}
        <div className="p-3 text-red-400 font-bold border-b border-red-900 text-lg">
          Сервер {serverId}
        </div>

        {/* Список каналов */}
        <div className="flex-1 overflow-y-auto p-2">

          {channels.map((c) => (
            <div
              key={c.id}
              className={`
                flex items-center gap-2 p-2 rounded cursor-pointer 
                text-gray-300 mb-1
                ${isActive(c.id) ? "bg-red-800 text-white" : "hover:bg-[#1b1b1b]"}
              `}
              onClick={() => nav(`/server/${serverId}/channel/${c.id}`)}
            >
              <span className="text-xl">
                {c.type === "voice" ? "🔊" : "#"}
              </span>
              <span className="text-sm">{c.name}</span>
            </div>
          ))}
        </div>

        {/* Создать канал */}
        <div className="p-2">
          <button
            onClick={() => setShowCreate(true)}
            className="w-full bg-red-700 hover:bg-red-600 p-2 rounded text-white"
          >
            + Создать канал
          </button>
          <button
            onClick={() => setInviteModalOpen(true)}
            className="w-full p-2 bg-red-700 rounded mb-2"
          >
             Пригласить людей
            </button>

            <CreateInviteModal
            isOpen={inviteModalOpen}
             onClose={() => setInviteModalOpen(false)}
           />
          </div>
            </div>

      <CreateChannelModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => load()}
      />
    </>
  );
}
