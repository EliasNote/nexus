import { Button } from "./Button";
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
import { useCloudSync } from "@/hooks/useCloudSync";
import { useState } from "react";

const Sidebar = ({
  selected,
  setSelected,
  iconsSize,
  setIsAddFolder,
  isAddFolder,
  addFolder,
  folders,
}: {
  selected: number;
  setSelected: (id: number) => void;
  iconsSize: number;
  setIsAddFolder: (isAddFolder: boolean) => void;
  isAddFolder: boolean;
  addFolder: (name: string) => void;
  folders: string[];
}) => {
  const { disconnect } = useCloudSync();
  const [newFolder, setNewFolder] = useState("");

  const handleLogout = () => {
    disconnect();
  };

  return (
    <section className="flex flex-col gap-[20px] items-start border-r border-zinc-800 h-screen overflow-hidden max-w-[248px] w-full">
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
      <div className="flex flex-col gap-[10px] w-full flex-1 min-h-0">
        <div className="text-white font-medium text-[16px] flex flex-row pr-2">
          <Dot />
          <div className="flex items-center justify-between w-full">
            <span>DIRETÓRIOS</span>
            <motion.button
              className="cursor-pointer text-zinc-300 hover:text-brand"
              whileHover={{ rotate: 180 }}
              onClick={() => setIsAddFolder(!isAddFolder)}
            >
              {isAddFolder ? <Minus size={22} /> : <Plus size={22} />}
            </motion.button>
          </div>
        </div>
        <div className="flex flex-col gap-[5px] overflow-y-auto overflow-x-hidden flex-1">
          {isAddFolder && (
            <div className="flex flex-col gap-2 items-center px-2">
              <input
                type="text"
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                className="bg-zinc-900 text-white px-2 py-1.5 outline-none border border-zinc-700 focus:border-brand text-sm w-full"
                placeholder="Novo diretório"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addFolder(newFolder);
                  } else if (e.key === "Escape") {
                    setIsAddFolder(false);
                    setNewFolder("");
                  }
                }}
              />
              <button
                className="px-5 py-1.5 rounded bg-brand text-white font-medium hover:bg-blue-700 transition-colors text-sm cursor-pointer"
                onClick={() => {
                  addFolder(newFolder);
                }}
              >
                Confirmar
              </button>
            </div>
          )}
          {folders.map((dir, index) => (
            <Button
              key={index + 8}
              id={index + 8}
              selectedId={selected}
              title={dir}
              setSelected={setSelected}
              icon={<Folder size={iconsSize} />}
            />
          ))}
        </div>
      </div>

      <hr className="w-full text-zinc-800 mt-[-20px] mb-[-15px]" />
      <div className="flex flex-col w-full gap-2 ">
        <Button
          id={6}
          selectedId={selected}
          title="Sincronizar"
          setSelected={setSelected}
          icon={<Cloud size={iconsSize} />}
        />
        <Button
          id={7}
          selectedId={selected}
          title="Sair"
          setSelected={setSelected}
          onClick={handleLogout}
          icon={<LogOut size={iconsSize} />}
        />
      </div>
    </section>
  );
};

export default Sidebar;
