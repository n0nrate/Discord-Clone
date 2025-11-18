import { useState } from "react";
import axios from "axios";

export default function CreateServerPage() {
  const [name, setName] = useState("");

  const token = localStorage.getItem("token");

  async function create() {
    await axios.post(
      "http://localhost:3001/servers/create",
      { name },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    window.location.href = "/friends";
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl mb-6">Создать сервер</h1>
      <input
        className="p-2 bg-[#222] border border-red-900"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Название сервера"
      />
      <button className="p-2 bg-red-700 ml-4" onClick={create}>
        Создать
      </button>
    </div>
  );
}
