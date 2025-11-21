import { BrowserRouter, Routes, Route } from "react-router-dom";

import TopServersBar from "./components/TopServersBar";

import FriendsPage from "./pages/FriendsPage";
import ServerPage from "./pages/ServerPage";
import ChatPage from "./pages/ChatPage";
import DMPage from "./pages/DMPage";

import RegisterPage from "./pages/RegisterPage";
import VerifyPage from "./pages/VerifyPage";
import LoginPage from "./pages/LoginPage";

// ВОТ ЭТОГО И НЕ ХВАТАЛО
import VoiceCallPage from "./pages/VoiceCallPage";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen bg-black">
        {/* верхняя полоса с серверами */}
        <TopServersBar />

        {/* основное содержимое под ней */}
        <div className="flex-1 flex">
          <Routes>
            {/* --- auth --- */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* --- друзья и лс --- */}
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/dm/:userId" element={<DMPage />} />

            {/* --- сервера и каналы --- */}
            <Route path="/server/:serverId" element={<ServerPage />} />
            <Route
              path="/server/:serverId/channel/:channelId"
              element={<ChatPage />}
            />

            {/* голосовой звонок / экранка для голосового канала */}
            <Route
              path="/server/:serverId/voice/:channelId"
              element={<VoiceCallPage />}
            />

            {/* дефолт – кидаем на друзей */}
            <Route path="*" element={<FriendsPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
