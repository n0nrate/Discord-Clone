import ChannelList from "../components/ChannelList/ChannelList";

export default function ServerPage() {
  return (
    <div className="flex h-full">
      <ChannelList />

      <div className="flex-1 bg-[#1a1a1a] p-4 text-white">
        <h1 className="text-2xl">Выберите канал</h1>
      </div>
    </div>
  );
}