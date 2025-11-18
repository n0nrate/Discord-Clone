import { useState, useEffect } from "react";
import axios from "axios";
import DMList from "../components/DMList";
import ActivitySidebar from "../components/ActivitySidebar";

export default function FriendsPage() {
  const [tab, setTab] = useState("online");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [emailToAdd, setEmailToAdd] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadFriends();
  }, [tab]);

  async function loadFriends() {
    const res = await axios.get(
      "http://localhost:3001/friends/list",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setFriends(res.data.friends);
    setRequests(res.data.requests);
  }

  async function sendRequest() {
    await axios.post(
      "http://localhost:3001/friends/request",
      { email: emailToAdd },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setEmailToAdd("");
    loadFriends();
  }

  async function accept(id) {
    await axios.post(
      "http://localhost:3001/friends/accept",
      { userId: id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
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
          <div>
            <input
              className="p-2 bg-[#222] border border-red-900 rounded"
              placeholder="Email друга"
              value={emailToAdd}
              onChange={e => setEmailToAdd(e.target.value)}
            />
            <button onClick={sendRequest} className="ml-2 p-2 bg-red-600">Отправить</button>
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
