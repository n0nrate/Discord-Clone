import { Outlet } from "react-router-dom";
import TopServersBar from "../components/TopServersBar";

export default function MainLayout() {
  return (
    <div className="h-screen w-screen bg-[#050505] text-[#e5e5e5] flex flex-col overflow-hidden">
      {/* верхняя панель серверов */}
      <TopServersBar />

      {/* всё остальное под серверами */}
      <div className="flex-1 flex overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
