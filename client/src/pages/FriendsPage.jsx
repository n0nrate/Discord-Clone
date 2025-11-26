import { useState, useEffect } from "react";
import { api } from "../api/http";
import DMList from "../components/DMList";
import ActivitySidebar from "../components/ActivitySidebar";

export default function FriendsPage() {
  const [tab, setTab] = useState("online");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friendIdentifier, setFriendIdentifier] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadFriends();
  }, [tab]);

  async function loadFriends() {
    const res = await api.get("/friends/list");
    setFriends(res.data.friends);
    setRequests(res.data.requests);
  }

  async function sendRequest() {
    if (!friendIdentifier.trim()) return;
    await api.post("/friends/request", { email: friendIdentifier });
    setFriendIdentifier("");
    loadFriends();
  }

  async function accept(id) {
    await api.post("/friends/accept", { requestId: id });
    loadFriends();
  }

  return (
    <div className="flex h-full bg-[#1a1a1a] text-white">

      {/* Левая DM колонка */}
      <DMList />

      {/* Центральная зона — списки друзей */}
      <div className="flex-1 p-6">

        <h1 className="text-2xl font-bold text-red-400 mb-4">Друзья</h1>

        {/* Меню */}
        <div className="mb-6 flex gap-6">
          <button onClick={() => setTab("online")}>В сети</button>
          <button onClick={() => setTab("all")}>Все</button>
          <button onClick={() => setTab("pending")}>Ожидание</button>
          <button onClick={() => setTab("add")}>Добавить</button>
        </div>

        {tab === "add" && (
          <div className="flex items-center gap-2">
            <input
              className="flex-1 p-2 bg-[#222] border border-red-900 rounded"
              placeholder="Ник друга"
              value={friendIdentifier}
              onChange={e => setFriendIdentifier(e.target.value)}
            />
            <button onClick={sendRequest} className="p-2 bg-red-600 rounded">Отправить</button>
          </div>
        )}

        {tab === "pending" && (
          <div>
            {requests.map(r => (
              <div key={r.id} className="mb-3 flex items-center">
                <span className="mr-4">{r.username}</span>
                <button onClick={() => accept(r.id)} className="p-2 bg-red-700 rounded">
                  Принять
                </button>
              </div>
            ))}
          </div>
        )}

        {(tab === "online" || tab === "all") && (
          <div>
            {friends.map(f => (
              <div key={f.id} className="mb-3">
                {f.username}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Правая колонка активности */}
      <ActivitySidebar friends={friends} />

    </div>
  );
}
