import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import FriendsPage from "./pages/FriendsPage";
import DirectMessagePage from "./pages/DirectMessagePage";
import ServerPage from "./pages/ServerPage";
import VoicePage from "./pages/VoicePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* главная – друзья */}
          <Route index element={<FriendsPage />} />

          {/* вкладка Друзья */}
          <Route path="friends" element={<FriendsPage />} />

          {/* личные сообщения */}
          <Route path="dm/:userId" element={<DirectMessagePage />} />

          {/* сервер: каналы слева, чат, участники */}
          <Route path="server/:serverId" element={<ServerPage />} />

          {/* голосовой канал / звонок */}
          <Route path="voice/:voiceId" element={<VoicePage />} />

          {/* редирект на / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
