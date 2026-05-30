import { HashRouter, Routes, Route } from "react-router-dom";
import TelaPrincipal from "./pages/Dashboard/Dashboard";
import Steps from "./pages/Home/Home";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Steps />} />
        <Route path="/principal" element={<TelaPrincipal />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
