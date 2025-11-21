import { useState } from "react";
import axios from "axios";

export default function CreateInviteModal({ isOpen, onClose }) {
  const [expiresIn, setExpiresIn] = useState(7);
  const [maxUses, setMaxUses] = useState(0); // 0 = бесконечно
  const [inviteLink, setInviteLink] = useState(null);

  const token = localStorage.getItem("token");
  const serverId = window.location.pathname.split("/")[2];

  if (!isOpen) return null;

  async function createInvite() {
    const res = await axios.post(
      "http://localhost:3001/invites/create",
      {
        serverId,
        expiresIn,
        maxUses,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setInviteLink(res.data.link);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-[#1a1a1a] p-5 rounded w-96 text-white border border-red-800">
        <h2 className="text-xl mb-3 font-bold text-red-400">
          Параметры приглашения
        </h2>

        {/* Срок действия */}
        <label className="text-sm text-gray-300">Истекает через</label>
        <select
          value={expiresIn}
          onChange={(e) => setExpiresIn(Number(e.target.value))}
          className="w-full p-2 bg-[#222] border border-red-700 mt-1 mb-3"
        >
          <option value={0}>Никогда</option>
          <option value={1}>1 день</option>
          <option value={7}>7 дней</option>
          <option value={30}>30 дней</option>
        </select>

        {/* Кол-во использований */}
        <label className="text-sm text-gray-300">Максимум использований</label>
        <select
          value={maxUses}
          onChange={(e) => setMaxUses(Number(e.target.value))}
          className="w-full p-2 bg-[#222] border border-red-700 mt-1 mb-3"
        >
          <option value={0}>Без ограничения</option>
          <option value={1}>1</option>
          <option value={5}>5</option>
          <option value={25}>25</option>
        </select>

        {/* Если ссылка сгенерирована */}
        {inviteLink ? (
          <div className="mt-4">
            <p className="text-sm">Приглашение готово:</p>
            <input
              className="w-full bg-[#222] p-2 mt-2"
              value={inviteLink}
              readOnly
            />
          </div>
        ) : (
          <button
            onClick={createInvite}
            className="w-full bg-red-700 hover:bg-red-600 p-2 rounded mt-3"
          >
            Сгенерировать
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full bg-gray-700 hover:bg-gray-600 p-2 rounded mt-3"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
