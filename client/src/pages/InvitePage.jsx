import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/http";

export default function InvitePage() {
  const { code } = useParams();
  const nav = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function joinServer() {
      if (!token) {
        setError("Нужно войти, чтобы принять приглашение");
        setLoading(false);
        return;
      }

      try {
        const res = await api.post(`/invites/${code}/join`);

        setLoading(false);
        setTimeout(() => {
          nav(`/server/${res.data.serverId}`);
        }, 600);
      } catch (err) {
        console.error("Ошибка принятия инвайта:", err);
        const msg = err.response?.data?.error || "Не удалось присоединиться";
        setError(msg);
        setLoading(false);
      }
    }

    joinServer();
  }, [code, nav, token]);

  return (
    <div className="flex items-center justify-center h-full bg-black text-white">
      <div className="bg-[#141414] border border-red-900 rounded p-6 w-96 text-center">
        <h1 className="text-xl font-bold text-red-400 mb-3">
          Приглашение на сервер
        </h1>

        {loading && <p>Проверяем ссылку...</p>}
        {!loading && !error && <p>Подключаем... готово!</p>}
        {error && <p className="text-red-400">{error}</p>}
      </div>
    </div>
  );
}
