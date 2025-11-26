import { useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/http";

export default function CreateChannelPage() {
  const { serverId } = useParams();
  const [name, setName] = useState("");
  const [type, setType] = useState("text");

  async function create() {
    await api.post("/channels", { serverId, name, type });
    window.location.href = `/server/${serverId}`;
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl mb-6">Создать канал</h1>

      <input
        className="p-2 bg-[#222] border border-red-900"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Название канала"
      />

      <select
        className="ml-4 p-2 bg-[#222]"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="text">Текстовый</option>
        <option value="voice">Голосовой</option>
      </select>

      <button onClick={create} className="ml-4 p-2 bg-red-700">
        Создать
      </button>
    </div>
  );
}
