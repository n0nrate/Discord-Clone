import { useState } from "react";
import { api } from "../api/http";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [debugCode, setDebugCode] = useState(null); // для локальной отладки
  const [error, setError] = useState("");

  const register = async () => {
    setError("");

    try {
      const res = await api.post("/auth/register", {
        email,
        username,
        password,
      });

      // Если отправка письма упала — сервер вернёт debugCode
      if (res.data.debugCode) {
        setDebugCode(res.data.debugCode);
      }

      nav("/verify?email=" + encodeURIComponent(email));
    } catch (err) {
      setError(err.response?.data?.error || "Ошибка регистрации");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#111] text-white">
      <h1 className="text-3xl mb-6 text-[#ff0000]">Регистрация</h1>

      <div className="w-80 flex flex-col gap-3">
        <input
          className="p-2 bg-[#222] border border-[#330000] rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="p-2 bg-[#222] border border-[#330000] rounded"
          placeholder="Никнейм"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="p-2 bg-[#222] border border-[#330000] rounded"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <button
          onClick={register}
          className="mt-2 bg-[#b80000] hover:bg-[#ff0000] py-2 rounded"
        >
          Создать аккаунт
        </button>

        {debugCode && (
          <div className="mt-4 text-sm text-gray-300">
            <div>⚠ DEBUG: Код подтверждения: <b>{debugCode}</b></div>
            <div>(это нормально, пока мы не подключили реальную почту)</div>
          </div>
        )}

        <button
          className="mt-6 text-gray-400 underline"
          onClick={() => nav("/login")}
        >
          Уже есть аккаунт?
        </button>
      </div>
    </div>
  );
}
