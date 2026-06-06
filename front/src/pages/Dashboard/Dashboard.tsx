import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import SidebarCredentials from "./components/SidebarCredentials.tsx/SidebarCredentials";
import { useCloudSync } from "../../hooks/useCloudSync";
import { useCloudStore } from "../../hooks/useCloudStore";

// import { salvarJsonComoArquivo, salvarJsonComTauri } from "./utils/salvarLocal";

const Dashboard = () => {
  const [selected, setSelected] = useState(0);
  const [folders, setFolders] = useState([] as string[]);

  const [isAddFolder, setIsAddFolder] = useState(false);
  const iconsSize = 20;

  const isTokenValid = useCloudStore((state) => state.isTokenValid);
  const setVault = useCloudStore((state) => state.setVault);
  const vault = useCloudStore((state) => state.vault);

  const { download } = useCloudSync();

  useEffect(() => {
    if (isTokenValid && !vault) {
      download()
        .then((result) => {
          if (result) {
            setVault(result);
            console.log("Vault baixado real", result);
          }
        })
        .catch((err) => console.error("Erro ao baixar cofre:", err));
    }
  }, [isTokenValid, download, setVault, vault]);

  const addFolder = (name: string) => {
    if (name.trim() === "") return;
    setFolders([...folders, `/${name}`]);
    setIsAddFolder(false);
  };

  useEffect(() => {
    if (vault && folders.length === 0) {
      vault.folders.map((folder) => addFolder(folder.name));
      console.log("Adicionando pastas ", folders);
    }
  }, [vault]);

  return (
    <main className="flex bg-[#0A0A0A] max-h-screen w-screen">
      <Sidebar
        selected={selected}
        setSelected={setSelected}
        iconsSize={iconsSize}
        setIsAddFolder={setIsAddFolder}
        isAddFolder={isAddFolder}
        addFolder={addFolder}
        folders={folders}
      />
      <SidebarCredentials />
      <div className="bg-black w-full"></div>
    </main>
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

export default Dashboard;
