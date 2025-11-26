import { useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/http";

export default function CreateCategoryModal({ isOpen, onClose, onCreated }) {
  const { serverId } = useParams();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function create(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setLoading(true);
      await api.post("/categories", { serverId, name });
      setName("");
      onCreated && onCreated();
      onClose();
    } catch (err) {
      console.error("Ошибка создания категории:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-[#1a1a1a] p-6 rounded w-80 text-white">
        <h2 className="text-xl mb-4">Новая категория</h2>

        <form onSubmit={create}>
          <input
            className="w-full p-2 bg-[#222] border border-red-700 mb-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название категории"
          />

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
