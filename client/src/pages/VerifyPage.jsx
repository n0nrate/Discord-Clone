import { useState } from "react";
import { api } from "../api/http";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function VerifyPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email");

  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const verify = async () => {
    setError("");

    try {
      await api.post("/auth/verify", {
        email,
        code,
      });

      nav("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Ошибка подтверждения");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#111] text-white">
      <h1 className="text-3xl mb-6 text-[#ff0000]">Подтвердите почту</h1>

      <div className="w-80 flex flex-col gap-3">
        <div className="text-gray-300 text-sm">
          Код отправлен на почту:
          <br />
          <b>{email}</b>
        </div>

        <input
          className="p-2 bg-[#222] border border-[#330000] rounded"
          placeholder="Введите код из письма"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <button
          onClick={verify}
          className="mt-2 bg-[#b80000] hover:bg-[#ff0000] py-2 rounded"
        >
          Подтвердить
        </button>
      </div>
    </div>
  );
}
