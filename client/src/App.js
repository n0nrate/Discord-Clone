import { BrowserRouter, Routes, Route } from "react-router-dom";

import TopServersBar from "./components/TopServersBar";
import FriendsPage from "./pages/FriendsPage";
import ServerPage from "./pages/ServerPage";
import ChatPage from "./pages/ChatPage";

import RegisterPage from "./pages/RegisterPage";
import VerifyPage from "./pages/VerifyPage";
import LoginPage from "./pages/LoginPage";

import DMPage from "./pages/DMPage";
import CreateServerPage from "./pages/CreateServerPage";
import CreateChannelPage from "./pages/CreateChannelPage";
import CreateServerPage from "./pages/CreateServerPage";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen">

        <TopServersBar />

        <div className="flex-1 flex">
          <Routes>

            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/create-server" element={<CreateServerPage />} />
            <Route path="/server/:serverId/create-channel" element={<CreateChannelPage />} />
      
            <Route path="/dm/:userId" element={<DMPage />} />
           
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/server/:serverId" element={<ServerPage />} />
            <Route path="/create-server" element={<CreateServerPage />} />
            <Route
              path="/server/:serverId/channel/:channelId"
              element={<ChatPage />}
            />

          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
