export default function ServerPage() {
  return (
    <div className="flex flex-1 bg-[#080808]">
      {/* каналы слева */}
      <aside className="w-64 bg-[#101010] border-r border-[#2a0000] p-3">
        <div className="text-xs font-semibold text-[#ff0000] mb-2">
          КАНАЛЫ
        </div>
        <div className="space-y-1 text-sm">
          <div className="px-2 py-1 rounded bg-[#1a1a1a]"># general</div>
          <div className="px-2 py-1 rounded hover:bg-[#1a1a1a]">
            # anime
          </div>
          <div className="px-2 py-1 rounded hover:bg-[#1a1a1a]">
            🔊 gaming voice
          </div>
        </div>
      </aside>

      {/* чат по центру */}
      <main className="flex-1 flex flex-col border-r border-[#2a0000]">
        <div className="h-12 bg-[#121212] border-b border-[#2a0000] flex items-center px-4 text-sm">
          <span className="font-semibold"># general</span>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-[#444]" />
            <div>
              <div className="font-semibold text-sm">Миша</div>
              <div className="text-sm text-[#d0d0d0]">
                Йоу, как дела?
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-[#444]" />
            <div>
              <div className="font-semibold text-sm">Бот</div>
              <div className="text-sm text-[#d0d0d0]">
                Всё огонь, братик 😎
              </div>
            </div>
          </div>
        </div>

        <div className="h-16 bg-[#101010] border-t border-[#2a0000] flex items-center px-4">
          <input
            className="w-full bg-[#181818] border border-[#2a0000] rounded-md px-3 py-2 text-sm outline-none focus:border-[#ff0000]"
            placeholder="Написать сообщение..."
          />
        </div>
      </main>

      {/* участники справа */}
      <aside className="w-72 bg-[#101010] p-3">
        <div className="text-xs font-semibold text-[#ff0000] mb-2">
          УЧАСТНИКИ
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#b80000]" />
            <div>
              <div className="font-semibold text-sm">Миша</div>
              <div className="text-xs text-[#888]">в сети</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#444]" />
            <div>
              <div className="font-semibold text-sm">Бот</div>
              <div className="text-xs text-[#888]">слушает Spotify</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
