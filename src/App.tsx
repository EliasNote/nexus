import { HashRouter, Routes, Route } from "react-router-dom";
import TelaPrincipal from "./Tela Principal";
import Steps from "./Home";

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
