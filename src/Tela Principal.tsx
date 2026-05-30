// import { useLocation } from "react-router-dom";
import { Button } from "./components/Tela Principal/Sidebar/Button";
import { useState } from "react";
import { LayoutGrid, Star, Trash2 } from "lucide-react";

// import { salvarJsonComoArquivo, salvarJsonComTauri } from "./utils/salvarLocal";

const TelaPrincipal = () => {
  const [selected, setSelected] = useState(1);
  // const location = useLocation();
  // const texto = location.state?.texto || "";

  return (
    <section className="flex bg-zinc-950 h-screen w-screen">
      <div className="flex flex-col items-start border-r border-zinc-800 h-full w-fit">
        <Button
          id={0}
          selectedId={selected}
          title="TODOS OS ITENS"
          setSelected={setSelected}
          icon={<LayoutGrid size={20} />}
        />
        <Button
          id={1}
          selectedId={selected}
          title="FAVORITOS"
          setSelected={setSelected}
          icon={<Star size={20} />}
        />
        <Button
          id={2}
          selectedId={selected}
          title="LIXEIRA"
          setSelected={setSelected}
          icon={<Trash2 size={20} />}
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
