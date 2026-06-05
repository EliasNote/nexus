import { HashRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Home from "./pages/Home/Home";
import { ProtectedRoute } from "./components/ProtectedRoutes";
import { useCloudStore } from "./hooks/useCloudStore";
import { useCloudSync } from "./hooks/useCloudSync";
import { useEffect } from "react";

export const dashboardRoute = "/dashboard";

function App() {
  const token = useCloudStore((state) => state.accessToken);
  const expiresIn = useCloudStore((state) => state.expiresIn);
  const setIsTokenValid = useCloudStore((state) => state.setIsTokenValid);

  const { refresh } = useCloudSync();

  useEffect(() => {
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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path={dashboardRoute}
          element={<ProtectedRoute children={<Dashboard />} />}
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
