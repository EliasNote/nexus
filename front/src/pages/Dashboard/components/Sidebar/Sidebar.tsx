import { Button } from "./Button";
import {
  Dot,
  Folder as FolderIcon,
  Plus,
  Minus,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCloudSync } from "@/hooks/useCloudSync";
import { useEffect, useState } from "react";
import { useCloudStore } from "@/hooks/useCloudStore";
import { getAllButtons } from "./Buttons";
import type { Folder } from "@/types/vault";
import { useVaultActions } from "@/hooks/useVaultActions";
import { useSaveNow } from "@/hooks/useSave";

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
  const { isPendingSync, setIsPendingSync, isSaving } = useCloudStore(
    (state) => state,
  );
  const [isLogoutPending, setIsLogoutPending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const { saveVault } = useVaultActions();
  const saveNow = useSaveNow();

  const iconsSize = 20;
  const { defaults, tools, footers } = getAllButtons(
    iconsSize,
    isPendingSync,
    isSaving,
  );

  const { createFolder } = useVaultActions();

  const onSave = async () => {
    await createFolder(newFolder);
    setIsAddFolder(false);
  };

  const verifyLogout = () => {
    if (isPendingSync) setIsLogoutPending(true);
    else disconnect();
  };

  const handleLogout = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);

    try {
      if (isPendingSync) {
        await saveVault();
        setIsPendingSync(false);
        setSyncSuccess(true);

        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      disconnect();
    } catch (e) {
      console.error(e);
      setIsSyncing(false);
      setSyncSuccess(false);
    }
  };

  const handleLogoutWithoutSync = () => {
    setIsPendingSync(false);
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
                className="px-5 py-1.5 bg-brand text-white font-medium hover:bg-blue-700 transition-colors text-sm cursor-pointer"
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
              if (footers.length - 1 === index) verifyLogout();
              if (isPendingSync && !isSaving && item.title === "SINCRONIZAR")
                saveNow();
            }}
            setSelected={setSelected}
            icon={item.icon}
            isSyncButton={item.title === "SINCRONIZAR"}
            isSyncButtonAllowed={isPendingSync && !isSaving}
          />
        ))}
      </div>

      <AnimatePresence>
        {isLogoutPending && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => !isSyncing && setIsLogoutPending(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div
                className="pointer-events-auto flex flex-col gap-4 p-5 bg-zinc-900 border border-zinc-700 shadow-xl w-full max-w-sm mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                {isSyncing ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4 py-6"
                  >
                    <div className="flex gap-3 items-center">
                      {syncSuccess && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1.25 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                          }}
                        >
                          <CheckCircle2 size={24} className="text-green-500" />
                        </motion.div>
                      )}
                      {!syncSuccess && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Loader2 size={24} className="text-blue-500" />
                        </motion.div>
                      )}
                      <span className="text-white font-medium">
                        {syncSuccess
                          ? "Sincronizado com sucesso!"
                          : "Sincronizando..."}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 text-center">
                      {syncSuccess
                        ? "Preparando para sair..."
                        : "Salvando suas alterações"}
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-white font-semibold text-base">
                        Sincronizar antes de sair?
                      </h2>
                      <p className="text-sm text-zinc-400">
                        Você possui alterações pendentes que não foram
                        sincronizadas.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <motion.button
                        className="w-full px-4 py-2.5 border border-brand bg-brand/60 text-white font-medium text-sm cursor-pointer  hover:bg-brand"
                        onClick={handleLogout}
                        disabled={isSyncing}
                      >
                        Sincronizar e Sair
                      </motion.button>

                      <motion.button
                        className="w-full px-4 py-2.5 border border-zinc-500 text-zinc-100 bg-zinc-700 hover:bg-zinc-500 text-sm  cursor-pointer font-medium  "
                        onClick={handleLogoutWithoutSync}
                        disabled={isSyncing}
                      >
                        Sair sem salvar
                      </motion.button>

                      <button
                        className="w-full px-4 py-2.5 border border-zinc-700 text-zinc-100 hover:bg-zinc-700 text-sm font-medium cursor-pointer"
                        onClick={() => setIsLogoutPending(false)}
                        disabled={isSyncing}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Sidebar;
