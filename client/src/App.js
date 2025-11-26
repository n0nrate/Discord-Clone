import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import TopServersBar from "./components/TopServersBar";

import FriendsPage from "./pages/FriendsPage";
import ServerPage from "./pages/ServerPage";
import ChatPage from "./pages/ChatPage";
import DMPage from "./pages/DMPage";

import RegisterPage from "./pages/RegisterPage";
import VerifyPage from "./pages/VerifyPage";
import LoginPage from "./pages/LoginPage";
import InvitePage from "./pages/InvitePage";

// ВОТ ЭТОГО И НЕ ХВАТАЛО
import VoiceCallPage from "./pages/VoiceCallPage";

function App() {
  const [hasToken, setHasToken] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const sync = () => setHasToken(!!localStorage.getItem("token"));
    window.addEventListener("storage", sync);
    window.addEventListener("token-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("token-changed", sync);
    };
  }, []);

  const protectedRoute = (element) =>
    hasToken ? element : <LoginPage />;

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
            <Route path="/friends" element={protectedRoute(<FriendsPage />)} />
            <Route path="/dm/:userId" element={protectedRoute(<DMPage />)} />
            <Route path="/invite/:code" element={protectedRoute(<InvitePage />)} />

            {/* --- сервера и каналы --- */}
            <Route path="/server/:serverId" element={protectedRoute(<ServerPage />)} />
            <Route
              path="/server/:serverId/channel/:channelId"
              element={protectedRoute(<ChatPage />)}
            />

            {/* голосовой звонок / экранка для голосового канала */}
            <Route
              path="/server/:serverId/voice/:channelId"
              element={protectedRoute(<VoiceCallPage />)}
            />

            {/* дефолт – кидаем на друзей */}
            <Route path="*" element={protectedRoute(<FriendsPage />)} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
