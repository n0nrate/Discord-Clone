import { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function CreateChannelModal({ isOpen, onClose, onCreated }) {
  const { serverId } = useParams();
  const [name, setName] = useState("");
  const [type, setType] = useState("text");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  if (!isOpen) return null;

  async function createChannel(e) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:3001/channels",
        {
          serverId,
          name,
          type,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onCreated && onCreated();
      onClose();
      setName("");

    } catch (err) {
      console.error("Ошибка создания канала:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-[#1a1a1a] p-6 rounded w-80 text-white">

        <h2 className="text-xl mb-4">Создать канал</h2>

        <form onSubmit={createChannel}>
          <input
            className="w-full p-2 bg-[#222] border border-red-700 mb-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название канала"
          />

          <select
            className="w-full p-2 bg-[#222] border border-red-700 mb-3"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="text">Текстовый</option>
            <option value="voice">Голосовой</option>
          </select>

          <button
            disabled={loading}
            className="w-full bg-red-700 py-2 rounded hover:bg-red-600"
          >
            {loading ? "Создание..." : "Создать"}
          </button>
        </form>

        <button
          className="w-full mt-3 bg-gray-700 py-2 rounded hover:bg-gray-600"
          onClick={onClose}
        >
          Отмена
        </button>

      </div>
    </div>
  );
}
