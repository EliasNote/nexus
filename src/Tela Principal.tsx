import { useLocation } from "react-router-dom";
import { salvarJsonComoArquivo, salvarJsonComTauri } from "./utils/salvarLocal";

const TelaPrincipal = () => {
  const location = useLocation();
  const texto = location.state?.texto || "";

  return (
    <div>
      <h1 className="text-black">{texto}</h1>
      <button onClick={() => salvarJsonComoArquivo(texto, "texto.json")}>
        Salvar Web
      </button>
      <button onClick={() => salvarJsonComTauri(texto, "texto.json")}>
        Salvar Tauri
      </button>
    </div>
  );
};

export default TelaPrincipal;
