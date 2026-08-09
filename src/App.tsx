import { useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoutes";
import { useStorageSync } from "./hooks/useStorageSync";
import { useCloudStore } from "./hooks/useCloudStore";
import Dashboard from "./pages/Dashboard/Dashboard";
import Home from "./pages/Home/Home";
import Manual from "./pages/Manual/Manual";
import { TitleBar } from "./desktop/TitleBar";
import { isTauri } from "@tauri-apps/api/core";

export const dashboardRoute = "/dashboard";
export const manualRoute = "/manual";


function App() {
  const token = useCloudStore((state) => state.accessToken);
  const expiresIn = useCloudStore((state) => state.expiresIn);
  const setIsTokenValid = useCloudStore((state) => state.setIsTokenValid);

  const { refresh } = useStorageSync();

  useEffect(() => {
    console.log("Token: ", token);
    console.log("ExpiresIn: ", expiresIn);
    if (token && expiresIn) {
      if (Date.now() < expiresIn) {
        setIsTokenValid(true);
      } else {
        setIsTokenValid(false);
        refresh();
      }
    }
  }, [token, expiresIn, refresh, setIsTokenValid]);

  return (
    <HashRouter>
          <div className="flex h-screen flex-col overflow-hidden bg-dark-background">
            {isTauri() && <TitleBar />}

            <div className="min-h-0 flex-1">
              <Routes>
                <Route path="/" element={<Home />} />

                <Route
                  path={dashboardRoute}
                  element={<ProtectedRoute children={<Dashboard />} />}
                />

                <Route path={manualRoute} element={<Manual />} />
              </Routes>
            </div>
          </div>
        </HashRouter>
  );
}

export default App;
