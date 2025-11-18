import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function ServerPage() {
  const { serverId } = useParams();
  const nav = useNavigate();
  const [channels, setChannels] = useState([]);

  const token = localStorage.getItem("token");

  async function load() {
    const res = await axios.get(`http://localhost:3001/channels/${serverId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setChannels(res.data);
  }

  useEffect(() => {
    load();
  }, [serverId]);

  return (
    <div className="flex h-full">
      
      {/* Левое меню каналов */}
      <div className="w-64 bg-[#111] border-r border-red-900 p-3">
        <h2 className="text-red-500 font-bold mb-3">КАНАЛЫ</h2>

        {channels.map(c => (
          <div
            key={c.id}
            onClick={() => nav(`/server/${serverId}/channel/${c.id}`)}
            className="p-2 rounded hover:bg-[#1d1d1d] cursor-pointer text-white"
          >
            {c.type === "voice" ? "🔊" : "#"} {c.name}
          </div>
        ))}

        <button
          onClick={() => nav(`/server/${serverId}/create-channel`)}
          className="mt-4 w-full bg-red-700 p-2 rounded"
        >
          + Создать канал
        </button>
      </div>

      {/* Контент */}
      <div className="flex-1 p-4 text-white">
        <h1>Выберите канал</h1>
      </div>
    </div>
  );
}
