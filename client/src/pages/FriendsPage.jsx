export default function FriendsPage() {
  return (
    <div className="flex flex-1 bg-[#080808]">
      {/* левое меню */}
      <aside className="w-56 bg-[#101010] border-r border-[#2a0000] flex flex-col py-4 px-3 gap-2">
        <div className="text-xs font-semibold text-[#ff0000] mb-2">
          МЕНЮ
        </div>
        {["Друзья", "ЛС", "Ожидание", "Заблокированные"].map((item, idx) => (
          <button
            key={item}
            className={`
              text-sm text-left px-2 py-2 rounded 
              transition
              ${
                idx === 0
                  ? "bg-[#b80000] text-white"
                  : "text-[#b0b0b0] hover:bg-[#1a1a1a] hover:text-white"
              }
            `}
          >
            {item}
          </button>
        ))}
      </aside>

      {/* центр — список друзей / основная зона */}
      <main className="flex-1 flex flex-col border-r border-[#2a0000]">
        {/* верхняя красная полоска с фильтрами */}
        <div className="h-12 bg-[#121212] border-b border-[#2a0000] flex items-center px-4 gap-3 text-sm">
          <span className="font-semibold">Друзья</span>
          <button className="px-2 py-1 rounded bg-[#b80000] hover:bg-[#ff0000] text-xs">
            В сети
          </button>
          <button className="px-2 py-1 rounded bg-[#181818] hover:bg-[#2a2a2a] text-xs">
            Все
          </button>
          <button className="px-2 py-1 rounded bg-[#181818] hover:bg-[#2a2a2a] text-xs">
            Ожидание
          </button>
          <button className="ml-auto px-3 py-1 rounded bg-[#0050ff] hover:bg-[#336dff] text-xs">
            Добавить в друзья
          </button>
        </div>

        {/* тут будет список друзей */}
        <div className="flex-1 p-6 space-y-3 overflow-y-auto">
          <div className="text-4xl font-bold text-[#ff0000] opacity-40">
            ДРУЗЬЯ / СПИСОК
          </div>
          {/* потом сюда придут реальные карточки из бекенда */}
        </div>
      </main>

      {/* справа — активность */}
      <aside className="w-72 bg-[#101010] py-4 px-3">
        <div className="text-xs font-semibold text-[#ff0000] mb-3">
          АКТИВНОСТЬ
        </div>
        <div className="text-sm text-[#888]">
          Тут позже будет: кто во что играет, кто в войсе, кто стримит.
        </div>
      </aside>
    </div>
  );
}
