// client/src/components/ServerSidebar.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { api } from "../api/http";
import CreateChannelModal from "./modals/CreateChannelModal";
import CreateInviteModal from "./modals/CreateInviteModal";
import CreateCategoryModal from "./modals/CreateCategoryModal";

export default function ServerSidebar() {
  const { serverId } = useParams();
  const nav = useNavigate();
  const loc = useLocation();

  const [channels, setChannels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [serverName, setServerName] = useState(`Сервер ${serverId}`);
  const [showCreate, setShowCreate] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [defaultCategory, setDefaultCategory] = useState(null);

  const token = localStorage.getItem("token");

  async function load() {
    const [channelsRes, categoriesRes, serversRes] = await Promise.all([
      api.get(`/channels/${serverId}`),
      api.get(`/categories/${serverId}`),
      api.get("/servers"),
    ]);
    setChannels(channelsRes.data || []);
    setCategories(categoriesRes.data || []);
    const foundServer = (serversRes.data || []).find(
      (s) => String(s.id) === String(serverId)
    );
    if (foundServer) setServerName(foundServer.name);
  }

  useEffect(() => {
    load();
  }, [serverId]);

  function handleChannelClick(channel) {
    if (channel.type === "voice") {
      nav(`/server/${serverId}/voice/${channel.id}`);
    } else {
      nav(`/server/${serverId}/channel/${channel.id}`);
    }
  }

  function isActive(channelId) {
    return (
      loc.pathname.includes(`/channel/${channelId}`) ||
      loc.pathname.includes(`/voice/${channelId}`)
    );
  }

  const sortedChannels = useMemo(() => {
    return [...channels].sort((a, b) => {
      const typeA = a.type === "text" ? 0 : 1;
      const typeB = b.type === "text" ? 0 : 1;
      if (typeA !== typeB) return typeA - typeB;
      const posA = typeof a.position === "number" ? a.position : 0;
      const posB = typeof b.position === "number" ? b.position : 0;
      return posA - posB;
    });
  }, [channels]);

  async function moveChannel(channel, direction) {
    const sameCategory = sortedChannels.filter(
      (c) =>
        (c.categoryId || null) === (channel.categoryId || null) &&
        c.type === channel.type
    );
    const idx = sameCategory.findIndex((c) => c.id === channel.id);
    const target = direction === "up" ? sameCategory[idx - 1] : sameCategory[idx + 1];
    if (!target) return;

    const posA =
      typeof channel.position === "number" ? channel.position : idx;
    const posB = typeof target.position === "number" ? target.position : idx;

    await Promise.all([
      api.patch(`/channels/${channel.id}`, { position: posB }),
      api.patch(`/channels/${target.id}`, { position: posA }),
    ]);

    load();
  }

  function renderChannelRow(c) {
    return (
      <div
        key={c.id}
        className={`
            flex items-center justify-between gap-2 p-2 rounded cursor-pointer 
            text-gray-300 mb-1
            ${isActive(c.id) ? "bg-red-800 text-white" : "hover:bg-[#1b1b1b]"}
          `}
        onClick={() => handleChannelClick(c)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">
            {c.type === "voice" ? "🔊" : "#"}
          </span>
          <span className="text-sm">{c.name}</span>
        </div>

        <div className="flex gap-1">
          <button
            className="text-xs px-1 rounded bg-[#222]"
            onClick={(e) => {
              e.stopPropagation();
              moveChannel(c, "up");
            }}
            title="Вверх"
          >
            ↑
          </button>
          <button
            className="text-xs px-1 rounded bg-[#222]"
            onClick={(e) => {
              e.stopPropagation();
              moveChannel(c, "down");
            }}
            title="Вниз"
          >
            ↓
          </button>
        </div>
      </div>
    );
  }

  const grouped = {
    uncategorized: sortedChannels.filter((c) => !c.categoryId),
    byCategory: categories.map((cat) => ({
      ...cat,
      channels: sortedChannels.filter((c) => c.categoryId === cat.id),
    })),
  };

  return (
    <>
      <div className="w-72 bg-[#111] border-r border-red-900 flex flex-col select-none">

        {/* Заголовок сервера */}
        <div className="p-3 text-red-400 font-bold border-b border-red-900 text-lg flex items-center justify-between">
          <span>{serverName}</span>
          <div className="flex gap-2 text-sm">
            <button
              className="px-2 py-1 bg-[#1f1f1f] rounded"
              onClick={() => setCategoryModalOpen(true)}
              title="Создать категорию"
            >
              Категория +
            </button>
            <button
              className="px-2 py-1 bg-[#1f1f1f] rounded"
              onClick={() => setInviteModalOpen(true)}
              title="Пригласить"
            >
              Инвайт
            </button>
          </div>
        </div>

        {/* Список каналов */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* Без категории */}
          {grouped.uncategorized.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-gray-400 uppercase text-xs px-1">
                <span>Без категории</span>
                <button
                  className="text-red-400"
                  onClick={() => {
                    setDefaultCategory(null);
                    setShowCreate(true);
                  }}
                >
                  +
                </button>
              </div>
              <div className="mt-2">
                {grouped.uncategorized.map(renderChannelRow)}
              </div>
            </div>
          )}

          {/* Категории */}
          {grouped.byCategory.map((cat) => (
            <div key={cat.id} className="mb-4">
              <div className="flex items-center justify-between text-gray-400 uppercase text-xs px-1">
                <span>{cat.name}</span>
                <button
                  className="text-red-400"
                  onClick={() => {
                    setDefaultCategory(cat.id);
                    setShowCreate(true);
                  }}
                >
                  +
                </button>
              </div>

              <div className="mt-2">
                {cat.channels.map(renderChannelRow)}
              </div>
            </div>
          ))}

          {/* если нет каналов */}
          {sortedChannels.length === 0 && (
            <div className="text-gray-500 text-sm px-1">
              Каналов пока нет. Создай текстовый или голосовой.
            </div>
          )}
        </div>

        {/* Создать канал */}
        <div className="p-2 border-t border-red-900">
          <button
            onClick={() => {
              setDefaultCategory(null);
              setShowCreate(true);
            }}
            className="w-full bg-red-700 hover:bg-red-600 p-2 rounded text-white mb-2"
          >
            + Создать канал
          </button>

          <CreateInviteModal
            isOpen={inviteModalOpen}
            onClose={() => setInviteModalOpen(false)}
            serverId={serverId}
          />
        </div>
      </div>

      <CreateChannelModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => load()}
        categories={categories}
        defaultCategoryId={defaultCategory}
      />

      <CreateCategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onCreated={() => load()}
      />
    </>
  );
}
