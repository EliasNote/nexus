import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Senha from "./pages/Senha";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/senha" element={<Senha />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
