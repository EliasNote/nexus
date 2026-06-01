import { HashRouter, Routes, Route } from "react-router-dom";
import TelaPrincipal from "./pages/Dashboard/Dashboard";
import Home from "./pages/Home/Home";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
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
