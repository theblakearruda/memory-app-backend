import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Create from "./pages/Create";
import LegacyCreate from "./pages/LegacyCreate";

import Signup from "./pages/Signup";
import Auth from "./pages/Auth";
import Onboarding2 from "./pages/Onboarding2";
import Onboarding3 from "./pages/Onboarding3";

import Placeholder from "./pages/Placeholder";

import BootSplash from "./components/BootSplash";

import { STORAGE_AUTH } from "./lib/storage";

export default function App() {
  const location = useLocation();

  const authed = localStorage.getItem(STORAGE_AUTH) === "1";

  const isOnboarding =
    location.pathname === "/" ||
    location.pathname === "/signup" ||
    location.pathname === "/auth" ||
    location.pathname.startsWith("/onboarding");

  return (
    <div style={isOnboarding ? styles.pageOnboarding : styles.pageApp}>
      <div style={isOnboarding ? styles.containerOnboarding : styles.containerApp}>
        {/* visual only, no routing */}
        <BootSplash />

        <Routes>
          {/* root decides where you belong */}
          <Route path="/" element={<Navigate to={authed ? "/home" : "/signup"} replace />} />

          {/* auth */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth" element={<Auth />} />

          {/* onboarding */}
          <Route path="/onboarding/2" element={<Onboarding2 />} />
          <Route path="/onboarding/3" element={<Onboarding3 />} />

          {/* main */}
          <Route path="/home" element={authed ? <Home /> : <Navigate to="/signup" replace />} />
          <Route path="/envos" element={authed ? <Home mode="envos" /> : <Navigate to="/signup" replace />} />

          <Route path="/create/envo" element={authed ? <Create /> : <Navigate to="/signup" replace />} />
          <Route path="/legacy-create" element={authed ? <LegacyCreate /> : <Navigate to="/signup" replace />} />

          {/* create placeholders so create menu doesn't send you into the void */}
          <Route
            path="/create/group"
            element={authed ? <Placeholder title="group" msg="group creation coming soon." /> : <Navigate to="/signup" replace />}
          />
          <Route
            path="/create/journal"
            element={authed ? <Placeholder title="journal" msg="journal creation coming soon." /> : <Navigate to="/signup" replace />}
          />
          <Route
            path="/create/lifeevent"
            element={authed ? <Placeholder title="life event" msg="life event creation coming soon." /> : <Navigate to="/signup" replace />}
          />

          {/* sidebar/topbar routes so clicks actually work */}
          <Route
            path="/friends"
            element={authed ? <Placeholder title="friends" msg="friends page coming soon." /> : <Navigate to="/signup" replace />}
          />
          <Route
            path="/groups"
            element={authed ? <Placeholder title="groups" msg="groups page coming soon." /> : <Navigate to="/signup" replace />}
          />
          <Route
            path="/journals"
            element={authed ? <Placeholder title="journals" msg="journals page coming soon." /> : <Navigate to="/signup" replace />}
          />
          <Route
            path="/saved"
            element={authed ? <Placeholder title="saved" msg="saved page coming soon." /> : <Navigate to="/signup" replace />}
          />
          <Route
            path="/video"
            element={authed ? <Placeholder title="video" msg="video page coming soon." /> : <Navigate to="/signup" replace />}
          />

          {/* alias */}
          <Route path="/create" element={<Navigate to="/create/envo" replace />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageApp: {
    minHeight: "100vh",
    width: "100vw",
    background: "#0b0e14",
    color: "white",
    padding: 0,
    boxSizing: "border-box",
  },
  containerApp: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  pageOnboarding: {
    minHeight: "100vh",
    width: "100vw",
    background: "#ffffff",
    color: "#0b0e14",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
  },
  containerOnboarding: {
    width: "100%",
    maxWidth: "none",
    margin: 0,
    padding: 0,
  },
};