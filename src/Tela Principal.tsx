// import { useLocation } from "react-router-dom";
import { Button } from "./components/Tela Principal/Sidebar/Button";
import { useState } from "react";
import { LayoutGrid, Star, Trash2, Dot, Binary, Shield } from "lucide-react";

// import { salvarJsonComoArquivo, salvarJsonComTauri } from "./utils/salvarLocal";

const TelaPrincipal = () => {
  const [selected, setSelected] = useState(0);
  // const location = useLocation();
  // const texto = location.state?.texto || "";

  return (
    <section className="flex bg-zinc-950 h-screen w-screen">
      <div className="flex flex-col gap-[20px] items-start border-r border-zinc-800 h-full w-fit">
        <div className="flex flex-col gap-[5px]">
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
        <div className="flex flex-col gap-[10px]">
          <div className="text-white font-medium text-[16px] flex flex-row">
            <Dot />
            <span>FERRAMENTAS</span>
          </div>
          <div className="flex flex-col gap-[5px]">
            <Button
              id={3}
              selectedId={selected}
              title="GERADOR"
              setSelected={setSelected}
              icon={<Binary size={20} />}
            />
            <Button
              id={4}
              selectedId={selected}
              title="AUDITORIA"
              setSelected={setSelected}
              icon={<Shield size={20} />}
            />
          </div>
        </div>
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
