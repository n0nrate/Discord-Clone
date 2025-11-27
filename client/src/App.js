import { HashRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import FriendsPage from "./pages/FriendsPage";
import ServerPage from "./pages/ServerPage";
import ChatPage from "./pages/ChatPage";
import DMPage from "./pages/DMPage";

import RegisterPage from "./pages/RegisterPage";
import VerifyPage from "./pages/VerifyPage";
import LoginPage from "./pages/LoginPage";
import InvitePage from "./pages/InvitePage";
import VoiceCallPage from "./pages/VoiceCallPage";
import MainLayout from "./layout/MainLayout";

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

  const protectedRoute = (element) => (hasToken ? element : <LoginPage />);

  return (
    <HashRouter>
      <Routes>
        {/* auth routes без основного layout */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* основной layout */}
        <Route element={<MainLayout />}>
          <Route path="/friends" element={protectedRoute(<FriendsPage />)} />
          <Route path="/dm/:userId" element={protectedRoute(<DMPage />)} />
          <Route path="/invite/:code" element={protectedRoute(<InvitePage />)} />

          <Route path="/server/:serverId" element={protectedRoute(<ServerPage />)} />
          <Route
            path="/server/:serverId/channel/:channelId"
            element={protectedRoute(<ChatPage />)}
          />
          <Route
            path="/server/:serverId/voice/:channelId"
            element={protectedRoute(<VoiceCallPage />)}
          />

          <Route path="*" element={protectedRoute(<FriendsPage />)} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
