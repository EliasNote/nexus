// import { useLocation } from "react-router-dom";
import { useState, useEffect, use } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import SidebarCredentials from "./components/SidebarCredentials.tsx/SidebarCredentials";
import { useCloudSync } from "../../hooks/useCloudSync";
import { useCloudStore } from "../../hooks/useCloudStore";

// import { salvarJsonComoArquivo, salvarJsonComTauri } from "./utils/salvarLocal";

const TelaPrincipal = () => {
  const [selected, setSelected] = useState(0);
  const [directories, setDirectories] = useState([
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
    "asdasd",
  ] as string[]);
  const [isAddDirectory, setIsAddDirectory] = useState(false);
  const [newDirectory, setNewDirectory] = useState("");
  const [vault, setVault] = useState(null);
  const iconsSize = 20;
  const isTokenValid = useCloudStore((state) => state.isTokenValid);
  const setIsTokenValid = useCloudStore((state) => state.setIsTokenValid);
  const token = useCloudStore((state) => state.accessToken);
  const expiresIn = useCloudStore((state) => state.expiresIn);

  const { download, refresh } = useCloudSync();

  useEffect(() => {
    if (token) {
      download()
        .then(setVault)
        .catch((err) => console.error("Erro ao baixar cofre:", err));
    }
  }, [token, download]);

  useEffect(() => {
    if (token && expiresIn && Date.now() < expiresIn) {
      setIsTokenValid(true);
    } else {
      setIsTokenValid(false);
      refresh();
    }
  }, [token, expiresIn, setIsTokenValid, refresh]);

  const addDirectory = () => {
    if (newDirectory.trim() === "") return;
    setDirectories([...directories, `/${newDirectory}`]);
    setNewDirectory("");
    setIsAddDirectory(false);
  };

  return (
    <main className="flex bg-[#0A0A0A] max-h-screen w-screen">
      <Sidebar
        selected={selected}
        setSelected={setSelected}
        iconsSize={iconsSize}
        setIsAddDirectory={setIsAddDirectory}
        isAddDirectory={isAddDirectory}
        setNewDirectory={setNewDirectory}
        newDirectory={newDirectory}
        addDirectory={addDirectory}
        directories={directories}
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

export default TelaPrincipal;
