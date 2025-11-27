import { Outlet } from "react-router-dom";
import TopServersBar from "../components/TopServersBar";
import "./MainLayout.css";

export default function MainLayout() {
  return (
    <div className="app-shell">
      {/* верхнее горизонтальное меню серверов, фиксированная высота */}
      <header className="top-bar">
        <TopServersBar />
      </header>

      {/* содержимое под топ-баром: слева каналы, центр чат, справа участники */}
      <main className="content-row">
        <Outlet />
      </main>
    </div>
  );
}
