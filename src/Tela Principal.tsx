import { useLocation } from "react-router-dom";
import { Button } from "./components/Tela Principal/Sidebar/Button";
import { useState } from "react";

// import { salvarJsonComoArquivo, salvarJsonComTauri } from "./utils/salvarLocal";

const TelaPrincipal = () => {
  const location = useLocation();
  const [selected, setSelected] = useState(1);
  const texto = location.state?.texto || "";

  return (
    <section className="flex bg-zinc-950 h-screen w-screen">
      <div className="flex flex-col items-start border-r border-zinc-800 h-full w-fit">
        <Button
          id={1}
          selectedId={selected}
          title="TODOS OS ITENS"
          setSelected={setSelected}
        />
        <Button
          id={2}
          selectedId={selected}
          title="FAVORITOS"
          setSelected={setSelected}
        />
      </div>
    </section>
  );
};

{
  /*<button onClick={() => salvarJsonComoArquivo(texto, "texto.json")}>
  Salvar Web
</button>
<button onClick={() => salvarJsonComTauri(texto, "texto.json")}>
  Salvar Tauri
</button>*/
}

export default TelaPrincipal;
