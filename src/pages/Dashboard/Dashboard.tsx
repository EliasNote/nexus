import { useState, useEffect, useMemo } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import SidebarCredentials from "./components/SidebarCredentials/SidebarCredentials";
import { useCloudSync } from "../../hooks/useCloudSync";
import { cryptoService, useCloudStore } from "../../hooks/useCloudStore";
import { Credential } from "./components/Credential/Credential";
import type { Credential as CredentialType, Folder } from "@/types/vault";
import { AddButton } from "./components/Credential/AddButton";
import { useAutoSave } from "@/hooks/useSave";

// import { salvarJsonComoArquivo, salvarJsonComTauri } from "./utils/salvarLocal";

const Dashboard = () => {
  useAutoSave();

  const [selected, setSelected] = useState<number | string>(0);

  const isTokenValid = useCloudStore((state) => state.isTokenValid);
  const vault = useCloudStore((state) => state.vault);
  const setVault = useCloudStore((state) => state.setVault);
  const summaryVault = useCloudStore((state) => state.summaryVault);
  const [selectedSideCredential, setSelectedSideCredential] = useState<
    string | null
  >(null);
  const [credential, setCredential] = useState<CredentialType | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isCreate, setIsCreate] = useState<CredentialType["type"] | null>(null);
  const [tempVault, setTempVault] = useState<CredentialType | null>(credential);
  const [isLoadingCredential] = useState(false);

  const folders: Folder[] = useMemo(() => {
    return summaryVault?.folders || [];
  }, [summaryVault]);

  const { download } = useCloudSync();
  const credentials = useMemo(() => {
    if (!summaryVault?.entries) return [];

    if (selected === 0) {
      return summaryVault.entries.filter((credential) => !credential.isDeleted);
    } else if (selected === 1) {
      return summaryVault.entries.filter(
        (credential) => credential.isFavorite && !credential.isDeleted,
      );
    } else if (selected === 2) {
      return summaryVault.entries.filter((credential) => credential.isDeleted);
    } else if (selected as string) {
      const targetFolder = folders.find((f) => f.id === selected);

      if (!targetFolder) return [];

      return summaryVault.entries.filter((c) =>
        c.foldersIds?.includes(targetFolder.id),
      );
    } else {
      return [];
    }
  }, [selected, summaryVault]);

  useEffect(() => {
    if (isTokenValid && !summaryVault) {
      download()
        .then(async (result) => {
          if (result) {
            const initialData = await cryptoService.getInitialData(result);

            const interval = result.autoSaveInterval!;

            useCloudStore.getState().setAutoSaveInterval(interval);
            setVault(result);
            useCloudStore.getState().setSummaryVault(initialData);
            console.log("Vault baixado e descriptografado real", result);
          }
        })
        .catch((err) => console.error("Erro ao baixar cofre:", err));
    }
  }, [isTokenValid, download, setVault, summaryVault]);

  useEffect(() => {
    if (selectedSideCredential && vault) {
      cryptoService
        .getCredential(selectedSideCredential, vault)
        .then((data) => {
          setCredential(data);
          setTempVault(data);
          setIsEdit(false);
          setIsCreate(null);
        });
    }
  }, [selectedSideCredential, vault, cryptoService]);

  const newEntry = (type: CredentialType["type"]) =>
    ({
      id: crypto.randomUUID(),
      type: type,
      title: "Nova Credencial",
      isFavorite: false,
      isDeleted: false,
      foldersIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      audit: { leak: false, weak: false, reused: false, renewal: false },
      ...(type === "login" && { username: "", password: "", url: "" }),
      ...(type === "card" && {
        holderName: "",
        cardNumber: "",
        expirationDate: "",
        cvv: "",
      }),
      ...(type === "note" && { name: "", content: "" }),
    }) as CredentialType;

  const handleStartCreate = (type: CredentialType["type"]) => {
    setSelectedSideCredential(null);
    setTempVault(newEntry(type));
    setIsCreate(type);
    setIsEdit(false);
  };

  return (
    <main className="flex bg-[#0A0A0A] max-h-screen w-screen">
      <Sidebar
        selected={selected}
        setSelected={setSelected}
        folders={folders}
      />
      <SidebarCredentials
        selectedSideCredential={selectedSideCredential}
        setSelectedSideCredential={setSelectedSideCredential}
        credentials={credentials}
      />
      {(selectedSideCredential && credential && tempVault) || isCreate ? (
        <Credential
          tempVault={tempVault || newEntry(isCreate!)}
          setTempVault={setTempVault}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          isCreate={isCreate}
          setIsCreate={setIsCreate}
          setSelectedSideCredential={setSelectedSideCredential}
          credential={credential!}
          isLoadingCredential={isLoadingCredential}
          handleStartCreate={handleStartCreate}
        />
      ) : (
        <div className="absolute bottom-10 right-10">
          <AddButton handleStartCreate={handleStartCreate} />
        </div>
      )}
    </main>
  );
};

export default Dashboard;
