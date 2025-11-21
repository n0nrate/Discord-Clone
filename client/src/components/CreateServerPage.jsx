import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateServerPage() {
  const [name, setName] = useState("");
  const nav = useNavigate();

  async function create() {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://localhost:3001/servers",
      { name },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    nav(`/server/${res.data.server.id}`);
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">Создать сервер</h1>

      <input
        className="p-2 bg-[#1a1a1a] border border-red-700"
        placeholder="Название сервера"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={create}
        className="ml-2 bg-red-700 p-2 rounded"
      >
        Создать
      </button>
    </div>
  );
}
