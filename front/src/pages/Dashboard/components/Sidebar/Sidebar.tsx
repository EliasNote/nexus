import { Button } from "./Button";
import { Dot, Folder as FolderIcon, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useCloudSync } from "@/hooks/useCloudSync";
import { useState } from "react";
import { getAllButtons } from "./Buttons";
import type { Folder } from "@/types/vault";
import { useVaultActions } from "@/hooks/useVaultActions";

const Sidebar = ({
  selected,
  setSelected,
  folders,
}: {
  selected: number | string;
  setSelected: (id: number | string) => void;
  folders: Folder[];
}) => {
  const { disconnect } = useCloudSync();
  const [newFolder, setNewFolder] = useState("");
  const [isAddFolder, setIsAddFolder] = useState(false);

  const iconsSize = 20;
  const { defaults, tools, footers } = getAllButtons(iconsSize);

  const { createFolder } = useVaultActions();
  const onSave = async () => {
    await createFolder(newFolder);

    setIsAddFolder(false);
  };

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
        {defaults.map((button, index) => (
          <Button
            key={index}
            id={index}
            selectedId={selected}
            title={button.title}
            setSelected={setSelected}
            icon={button.icon}
          />
        ))}
      </div>
      <div className="flex flex-col gap-[10px]">
        <div className="text-white font-medium text-[16px] flex flex-row">
          <Dot />
          <span>FERRAMENTAS</span>
        </div>
        <div className="flex flex-col gap-[5px]">
          {tools.map((button, index) => (
            <Button
              key={defaults.length + index}
              id={defaults.length + index}
              selectedId={selected}
              title={button.title}
              setSelected={setSelected}
              icon={button.icon}
            />
          ))}
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
                    onSave();
                  } else if (e.key === "Escape") {
                    setIsAddFolder(false);
                    setNewFolder("");
                  }
                }}
              />
              <button
                className="px-5 py-1.5 rounded bg-brand text-white font-medium hover:bg-blue-700 transition-colors text-sm cursor-pointer"
                onClick={onSave}
              >
                Confirmar
              </button>
            </div>
          )}
          {folders.map((f, index) => (
            <Button
              key={defaults.length + tools.length + footers.length + index}
              id={f.id}
              selectedId={selected}
              title={`/${f.name}`}
              setSelected={setSelected}
              icon={<FolderIcon size={20} />}
            />
          ))}
        </div>
      </div>

      <hr className="w-full text-zinc-800 mt-[-20px] mb-[-15px]" />
      <div className="flex flex-col w-full gap-2 ">
        {footers.map((item, index) => (
          <Button
            key={defaults.length + tools.length + index}
            id={defaults.length + tools.length + index}
            selectedId={selected}
            title={item.title}
            onClick={() => {
              if (footers.length - 1 === index) handleLogout();
            }}
            setSelected={setSelected}
            icon={item.icon}
          />
        ))}
      </div>
    </section>
  );
};

export default Sidebar;
