import { useGoogleDriveStore } from "./hooks/useGoogleDriveStore";
import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import TelaPrincipal from "./pages/Dashboard/Dashboard";
import Home from "./pages/Home/Home";
import { useGoogleDrive } from "./hooks/useGoogleDrive";

function App() {
  const token = useGoogleDriveStore((state) => state.accessToken);
  const expiresIn = useGoogleDriveStore((state) => state.expiresIn);
  const { loginRefresh } = useGoogleDrive();

  useEffect(() => {
    if (token && expiresIn && Date.now() > expiresIn) {
      loginRefresh();
      console.log("Token expirado");
    }
  }, [token, expiresIn]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/principal" element={<TelaPrincipal />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
