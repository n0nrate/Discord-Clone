export default function DMList() {
  const dummyDMs = [
    { id: 1, name: "Guzzelin", avatar: "/default.png", status: "online" },
    { id: 2, name: "n0nrate", avatar: "/default.png", status: "dnd" },
    { id: 3, name: "Хачачкала", avatar: "/default.png", status: "online" },
  ];

  return (
    <div className="w-64 bg-[#111] border-r border-red-900 p-3 overflow-y-auto">
      <h2 className="text-red-500 font-bold mb-3">Сообщения</h2>

      {dummyDMs.map(u => (
        <div key={u.id} className="flex items-center p-2 hover:bg-[#1d1d1d] rounded-lg cursor-pointer">
          <div className="relative">
            <img src={u.avatar} className="w-10 h-10 rounded-full" />
            <div className={`
              absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111]
              ${u.status === "online" ? "bg-green-500" : 
                u.status === "dnd" ? "bg-red-500" :
                "bg-gray-500"
              }
            `}/>
          </div>
          <span className="ml-3 text-white">{u.name}</span>
        </div>
      ))}
    </div>
  );
}
