import { useParams } from "react-router-dom";

export default function DirectMessagePage() {
  const { userId } = useParams();

  return (
    <div className="flex flex-1 bg-[#080808]">
      {/* слева – список ЛС/друзей */}
      <aside className="w-64 bg-[#101010] border-r border-[#2a0000] p-3">
        <div className="text-xs font-semibold text-[#ff0000] mb-2">
          ДРУЗЬЯ / ЛС
        </div>
        {/* заглушка – потом будет список из бекенда */}
        <div className="space-y-2 text-sm">
          <div className="px-2 py-2 rounded bg-[#1a1a1a]">Друг 1</div>
          <div className="px-2 py-2 rounded hover:bg-[#1a1a1a]">
            Друг 2
          </div>
        </div>
      </aside>

      {/* центр – чат */}
      <main className="flex-1 flex flex-col border-r border-[#2a0000]">
        <div className="h-12 bg-[#121212] border-b border-[#2a0000] flex items-center px-4 text-sm">
          <span className="font-semibold">Чат с другом #{userId}</span>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {/* тут потом будут сообщения */}
          <div className="text-[#aaaaaa] text-sm">
            Здесь будет история сообщений c другом.
          </div>
        </div>

        <div className="h-16 bg-[#101010] border-t border-[#2a0000] flex items-center px-4">
          <input
            className="w-full bg-[#181818] border border-[#2a0000] rounded-md px-3 py-2 text-sm outline-none focus:border-[#ff0000]"
            placeholder="Написать сообщение..."
          />
        </div>
      </main>

      {/* справа – профиль друга */}
      <aside className="w-80 bg-[#101010] p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#b80000]" />
          <div>
            <div className="font-semibold text-sm">Имя друга</div>
            <div className="text-xs text-[#888]">онлайн</div>
          </div>
        </div>
        <div className="text-xs text-[#888] space-y-2">
          <div>Общие серверы: 3</div>
          <div>Общие друзья: 5</div>
          <div className="pt-2 border-t border-[#2a0000] mt-2">
            Кнопки: пригласить, позвонить и т.д. (позже).
          </div>
        </div>
      </aside>
    </div>
  );
}
