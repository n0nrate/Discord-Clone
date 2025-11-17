export default function VoicePage() {
  return (
    <div className="flex flex-1 bg-[#080808]">
      {/* слева – голосовые каналы + ЛС */}
      <aside className="w-64 bg-[#101010] border-r border-[#2a0000] p-3">
        <div className="text-xs font-semibold text-[#ff0000] mb-2">
          ГОЛОСОВЫЕ / ЛС
        </div>
        <div className="space-y-1 text-sm">
          <div className="px-2 py-1 rounded bg-[#1a1a1a]">🔊 Gaming room</div>
          <div className="px-2 py-1 rounded hover:bg-[#1a1a1a]">
            🔊 Chill
          </div>
          <div className="px-2 py-1 rounded hover:bg-[#1a1a1a]">
            💬 ЛС с другом
          </div>
        </div>
      </aside>

      {/* центр + право – плитки участников/видео */}
      <main className="flex-1 flex flex-col p-4 gap-4">
        <div className="flex gap-4 flex-wrap justify-center items-center flex-1">
          {/* плитки участников */}
          {["Миша", "Друг 1", "Друг 2"].map((name) => (
            <div
              key={name}
              className="w-60 h-40 bg-[#101010] border border-[#2a0000] rounded-lg flex flex-col items-center justify-center gap-2"
            >
              <div className="w-14 h-14 rounded-full bg-[#b80000]" />
              <div className="text-sm font-semibold">{name}</div>
              <div className="text-xs text-[#888]">микрофон включен</div>
            </div>
          ))}
        </div>

        <div className="h-16 bg-[#101010] border-t border-[#2a0000] flex items-center justify-center gap-4 rounded-md">
          <button className="px-4 py-2 rounded-full bg-[#b80000] hover:bg-[#ff0000] text-sm">
            Отключить микрофон
          </button>
          <button className="px-4 py-2 rounded-full bg-[#181818] hover:bg-[#2a2a2a] text-sm">
            Включить камеру
          </button>
          <button className="px-4 py-2 rounded-full bg-[#181818] hover:bg-[#2a2a2a] text-sm">
            Поделиться экраном
          </button>
        </div>
      </main>
    </div>
  );
}
