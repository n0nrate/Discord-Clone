// client/src/components/modals/CreateServerModal.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/http";

const TEMPLATES = [
  {
    id: "friends",
    title: "Для меня и друзей",
    description: "Маленькая тусовка друзей, чат и войс.",
    emoji: "👥",
  },
  {
    id: "gaming",
    title: "Игровой сервер",
    description: "Каналы для игр, общения и войса.",
    emoji: "🎮",
  },
  {
    id: "study",
    title: "Учёба / проект",
    description: "Для командной работы и学习.",
    emoji: "📚",
  },
  {
    id: "community",
    title: "Сообщество",
    description: "Паблик-сервер, ивенты и активность.",
    emoji: "🌐",
  },
];

export default function CreateServerModal({ isOpen, onClose, onCreated }) {
  const nav = useNavigate();

  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState("friends");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const me = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  if (!isOpen) return null;
  if (!me || !token) {
    // на всякий случай
    return null;
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);

      const res = await api.post("/servers", {
        name: name.trim(),
        template,
        ownerId: me.id,
      });

      const server = res.data;
      onCreated && onCreated(server);

      // сразу переходим на сервер (на основной канал, если есть)
      if (server.mainTextChannelId) {
        nav(`/server/${server.id}/channel/${server.mainTextChannelId}`);
      } else {
        nav(`/server/${server.id}`);
      }

      // сброс и закрытие
      setStep(1);
      setName("");
      setTemplate("friends");
      onClose && onClose();
    } catch (err) {
      console.error("Ошибка создания сервера:", err);
      alert("Не удалось создать сервер (см. консоль).");
    } finally {
      setLoading(false);
    }
  }

  function closeAll() {
    setStep(1);
    setName("");
    setTemplate("friends");
    onClose && onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
      <div className="bg-[#181818] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        {/* Шапка */}
        <div className="px-6 py-4 border-b border-[#2a0000] flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {step === 1 ? "Создать сервер" : "Настроить сервер"}
          </h2>
          <button
            onClick={closeAll}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* Шаг 1 — выбор шаблона */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <p className="text-gray-300 text-sm mb-2">
              Выбери тип сервера. Это больше для удобства — всегда можно поменять
              каналы позже.
            </p>

            <div className="space-y-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border
                    ${
                      template === t.id
                        ? "border-red-600 bg-[#2a0000]"
                        : "border-[#333] bg-[#202020] hover:border-red-500"
                    }`}
                >
                  <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-2xl">
                    {t.emoji}
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold">{t.title}</div>
                    <div className="text-xs text-gray-400">
                      {t.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={closeAll}
                className="px-4 py-2 rounded bg-[#303030] text-sm text-gray-200 hover:bg-[#3a3a3a]"
              >
                Отмена
              </button>
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded bg-red-700 text-sm text-white hover:bg-red-600"
              >
                Далее
              </button>
            </div>
          </div>
        )}

        {/* Шаг 2 — имя сервера */}
        {step === 2 && (
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <p className="text-gray-300 text-sm">
              Дай серверу имя. Можно потом поменять в настройках.
            </p>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 uppercase">
                Название сервера
              </label>
              <input
                className="w-full bg-[#101010] border border-[#333] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Злодейское логово"
                maxLength={64}
              />
            </div>

            {/* (пока без загрузки аватарки – добавим позже) */}
            <div className="text-xs text-gray-500">
              Аватарку сервера сделаем чуть позже — сейчас важнее функционал 😉
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded bg-[#303030] text-sm text-gray-200 hover:bg-[#3a3a3a]"
              >
                Назад
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="px-4 py-2 rounded bg-red-700 text-sm text-white hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Создаём..." : "Создать сервер"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
