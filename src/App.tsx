import { useGoogleDriveStore } from "./hooks/useGoogleDriveStore";
import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import TelaPrincipal from "./pages/Dashboard/Dashboard";
import Home from "./pages/Home/Home";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  const token = useGoogleDriveStore((state) => state.accessToken);
  const expiresIn = useGoogleDriveStore((state) => state.expiresIn);

  useEffect(() => {
    if (token && expiresIn && Date.now() > expiresIn) {
      console.log("Token expirado");
    }
  }, [token, expiresIn]);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/principal" element={<TelaPrincipal />} />
        </Routes>
      </HashRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
