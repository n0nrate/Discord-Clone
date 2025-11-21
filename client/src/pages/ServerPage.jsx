// client/src/pages/ServerPage.jsx

import ServerSidebar from "../components/ServerSidebar";

export default function ServerPage() {
  return (
    <div className="flex h-full">
      {/* Левая колонка каналов сервера */}
      <ServerSidebar />

      {/* Правая часть — пока пустая.
          Когда пользователь выберет канал, вместо этого блока откроется ChatPage */}
      <div className="flex-1 text-white p-4">
        <h1>Выберите канал или создайте новый</h1>
      </div>
    </div>
  );
}
