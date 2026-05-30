// import { useLocation } from "react-router-dom";
import { Button } from "./components/Sidebar/Button";
import { useState } from "react";
import {
  LayoutGrid,
  Star,
  Trash2,
  Dot,
  Binary,
  Shield,
  Folder,
  Plus,
  Minus,
  Cloud,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";

// import { salvarJsonComoArquivo, salvarJsonComTauri } from "./utils/salvarLocal";

const TelaPrincipal = () => {
  const [selected, setSelected] = useState(0);
  const [directories, setDirectories] = useState([] as string[]);
  const [isAddDirectory, setIsAddDirectory] = useState(false);
  const [newDirectory, setNewDirectory] = useState("");
  const iconsSize = 20;

  // const location = useLocation();
  // const texto = location.state?.texto || "";
  //

  const addDirectory = () => {
    if (newDirectory.trim() === "") return;
    setDirectories([...directories, `/${newDirectory}`]);
    setNewDirectory("");
    setIsAddDirectory(false);
  };

  return (
    <section className="flex bg-zinc-950 h-screen w-screen">
      <div className="flex flex-col gap-[20px] items-start border-r border-zinc-800 h-full w-fit">
        <div className="w-full">
          <div className="flex items-center gap-[10px] justify-center h-[60px] py-[20px]">
            <img src="/logo.svg" alt="Logo" className="w-[40px]" />
            <h1 className="text-white font-bold text-[22px]">Nexus</h1>
          </div>
          <hr className="w-full text-zinc-800" />
        </div>
        <div className="flex flex-col gap-[5px]">
          <Button
            id={0}
            selectedId={selected}
            title="TODOS OS ITENS"
            setSelected={setSelected}
            icon={<LayoutGrid size={iconsSize} />}
          />
          <Button
            id={1}
            selectedId={selected}
            title="FAVORITOS"
            setSelected={setSelected}
            icon={<Star size={iconsSize} />}
          />
          <Button
            id={2}
            selectedId={selected}
            title="LIXEIRA"
            setSelected={setSelected}
            icon={<Trash2 size={iconsSize} />}
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
              icon={<Binary size={iconsSize} />}
            />
            <Button
              id={4}
              selectedId={selected}
              title="AUDITORIA"
              setSelected={setSelected}
              icon={<Shield size={iconsSize} />}
            />
          </div>
        </div>
        <div className="flex flex-col gap-[10px] w-full h-full">
          <div className="text-white font-medium text-[16px] flex flex-row pr-2">
            <Dot />
            <div className="flex items-center justify-between w-full">
              <span>DIRETÓRIOS</span>
              <motion.button
                className="cursor-pointer text-zinc-300 hover:text-brand"
                whileHover={{ rotate: 180 }}
                onClick={() => setIsAddDirectory(!isAddDirectory)}
              >
                {isAddDirectory ? (
                  <Minus size={22} />
                ) : (
                  <Plus size={22} onClick={() => setNewDirectory("")} />
                )}
              </motion.button>
            </div>
          </div>
          <div className="flex flex-col gap-[5px]">
            {isAddDirectory && (
              <div className="flex flex-col gap-2 items-center px-2">
                <input
                  type="text"
                  value={newDirectory}
                  onChange={(e) => setNewDirectory(e.target.value)}
                  className="bg-zinc-900 text-white px-2 py-1.5 rounded outline-none border border-zinc-700 focus:border-brand text-sm w-full"
                  placeholder="Novo diretório"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addDirectory();
                    } else if (e.key === "Escape") {
                      setIsAddDirectory(false);
                      setNewDirectory("");
                    }
                  }}
                />
                <button
                  className="px-5 py-1.5 rounded bg-brand text-white font-medium hover:bg-blue-700 transition-colors text-sm cursor-pointer"
                  onClick={() => {
                    addDirectory();
                  }}
                >
                  Confirmar
                </button>
              </div>
            )}
            {directories.map((dir, index) => (
              <Button
                key={index + 7}
                id={index + 7}
                selectedId={selected}
                title={dir}
                setSelected={setSelected}
                icon={<Folder size={iconsSize} />}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col w-full gap-2 ">
          <Button
            id={5}
            selectedId={selected}
            title="Sincronizar"
            setSelected={setSelected}
            icon={<Cloud size={iconsSize} />}
          />
          <Button
            id={6}
            selectedId={selected}
            title="Sair"
            setSelected={setSelected}
            icon={<LogOut size={iconsSize} />}
          />
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
