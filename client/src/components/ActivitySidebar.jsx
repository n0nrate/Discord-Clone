export default function ActivitySidebar({ friends }) {
  return (
    <div className="w-80 bg-[#111] border-l border-red-900 p-4 overflow-y-auto">
      
      <h2 className="text-red-500 text-xl font-bold mb-4">
        Активные контакты
      </h2>

      {friends
        .filter(f => f.activity)
        .map(f => (
          <div
            key={f.id}
            className="bg-[#1b1b1b] rounded-xl p-4 mb-4 border border-[#330000]"
          >
            {/* Имя + Аватар */}
            <div className="flex items-center mb-2">
              <img
                src={f.avatar}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <div className="font-bold text-white">{f.username}</div>
                <div className="text-green-400 text-sm">
                  {f.activity.type === "voice" && "В голосовом канале"}
                  {f.activity.type === "game" && `Играет в ${f.activity.name}`}
                  {f.activity.type === "app" && `${f.activity.name}`}
                </div>
              </div>
            </div>

            {/* Детали активности */}
            {f.activity.details && (
              <div className="bg-[#242424] p-3 rounded-lg text-sm text-gray-300">
                {f.activity.details}
                <br />
                <span className="text-gray-500">
                  Прошло: {Math.floor((Date.now() - f.activity.time) / 60000)} мин.
                </span>
              </div>
            )}

          </div>
        ))}
    </div>
  );
}
