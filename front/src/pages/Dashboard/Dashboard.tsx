import { useState, useEffect, useMemo, useCallback } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import SidebarCredentials from "./components/SidebarCredentials.tsx/SidebarCredentials";
import { useCloudSync } from "../../hooks/useCloudSync";
import { useCloudStore } from "../../hooks/useCloudStore";
import { Credential } from "./components/Credential/Credential";

// import { salvarJsonComoArquivo, salvarJsonComTauri } from "./utils/salvarLocal";

const Dashboard = () => {
  const [selected, setSelected] = useState<number | string>(0);
  const [isAddFolder, setIsAddFolder] = useState(false);

  const isTokenValid = useCloudStore((state) => state.isTokenValid);
  const setVault = useCloudStore((state) => state.setVault);
  const vault = useCloudStore((state) => state.vault);
  const [selectedSideCredential, setSelectedSideCredential] = useState<
    string | null
  >(null);

  const folders = useMemo(() => {
    return vault?.folders || [];
  }, [vault]);

  const { download } = useCloudSync();

  const allFolders = useMemo(() => vault?.folders || [], [vault]);
  const credentials = useMemo(() => {
    if (!vault?.entries) return [];

    if (selected === 0) {
      return vault.entries;
    } else if (selected === 1) {
      return vault.entries.filter((credential) => credential.isFavorite);
    } else if (selected === 2) {
      return vault.entries.filter((credential) => credential.isDeleted);
    } else if (selected as string) {
      const targetFolder = allFolders.find((f) => f.id === selected);

      if (!targetFolder) return [];

      return vault.entries.filter((c) =>
        c.foldersIds?.includes(targetFolder.id),
      );
    } else {
      return [];
    }
  }, [selected, vault]);

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

  const addFolder = useCallback(
    (name: string) => {
      if (name.trim() === "" || !vault) return;

      const newFolder = {
        id: crypto.randomUUID(),
        name: name.trim(),
      };

      const updatedVault = {
        ...vault,
        folders: [...(vault.folders || []), newFolder],
      };

      setVault(updatedVault);
      setIsAddFolder(false);
    },
    [vault, setVault],
  );

  const selectedCredential = useMemo(() => {
    return vault?.entries.find((x) => x.id === selectedSideCredential);
  }, [vault?.entries, selectedSideCredential]);

  return (
    <main className="flex bg-[#0A0A0A] max-h-screen w-screen">
      <Sidebar
        selected={selected}
        setSelected={setSelected}
        setIsAddFolder={setIsAddFolder}
        isAddFolder={isAddFolder}
        addFolder={addFolder}
        folders={folders}
      />
      <SidebarCredentials
        selectedSideCredential={selectedSideCredential}
        setSelectedSideCredential={setSelectedSideCredential}
        credentials={credentials}
      />
      {/*{credentials && <Credential credential={selectedCredential} />}*/}
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
