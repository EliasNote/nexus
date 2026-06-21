import { useState, useEffect, useMemo, useCallback } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import SidebarCredentials from "./components/SidebarCredentials/SidebarCredentials";
import { useCloudSync } from "../../hooks/useCloudSync";
import { useCloudStore } from "../../hooks/useCloudStore";
import { Credential } from "./components/Credential/Credential";
import type {
  Credential as CredentialType,
  Folder,
  VaultSummarizedData,
} from "@/types/vault";
import { AddButton } from "./components/Credential/AddButton";
import { updateSummaryVaultCredential } from "@/utils/utils";

// import { salvarJsonComoArquivo, salvarJsonComTauri } from "./utils/salvarLocal";

const Dashboard = () => {
  const [selected, setSelected] = useState<number | string>(0);
  const [isAddFolder, setIsAddFolder] = useState(false);

  const isTokenValid = useCloudStore((state) => state.isTokenValid);
  const vault = useCloudStore((state) => state.vault);
  const setVault = useCloudStore((state) => state.setVault);
  const setSummaryVault = useCloudStore((state) => state.setSummaryVault);
  const summaryVault = useCloudStore((state) => state.summaryVault);
  const [selectedSideCredential, setSelectedSideCredential] = useState<
    string | null
  >(null);
  const cryptoService = useCloudStore.getState().cryptoService;
  const [credential, setCredential] = useState<CredentialType | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isCreate, setIsCreate] = useState<CredentialType["type"] | null>(null);
  const [tempVault, setTempVault] = useState<CredentialType | null>(credential);
  const [isLoadingCredential, setIsLoadingCredential] = useState(false);
  const { uploadVault } = useCloudSync();

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
        .then((result) => {
          if (result) {
            setVault(result);
            console.log("Vault baixado real", result);
          }
        })
        .catch((err) => console.error("Erro ao baixar cofre:", err));
    }
  }, [isTokenValid, download, setVault, summaryVault]);

  const addFolder = useCallback(
    async (name: string) => {
      if (name.trim() === "" || !summaryVault) return;

      const newFolder = {
        id: crypto.randomUUID(),
        name: name.trim(),
      };

      const updatedVault = {
        ...summaryVault,
        folders: [...(summaryVault.folders || []), newFolder],
      };

      const newVault = await cryptoService.updateVaultFromSummary(
        vault!,
        updatedVault,
      );

      try {
        if (!newVault) return;
        await uploadVault(newVault);
        setVault(newVault);
        setSummaryVault(updatedVault);
        setIsAddFolder(false);
        console.log("Cofre salvo com sucesso");
      } catch (uploadError) {
        console.error("Erro ao salvar cofre:", uploadError);
      }
    },
    [vault, setVault, summaryVault, setSummaryVault, uploadVault],
  );

  const handleSave = async (
    newTempVault: CredentialType,
    newSummaryVault: VaultSummarizedData,
  ) => {
    if (!vault) return;

    const updatedCredential = {
      ...newTempVault,
      updatedAt: new Date().toISOString(),
    };

    try {
      setIsLoadingCredential(true);

      const newVault = await cryptoService.updateVaultFromCredential(
        vault,
        updatedCredential,
      );

      await uploadVault(newVault);

      const updatedSummaryVault = updateSummaryVaultCredential(
        newSummaryVault,
        updatedCredential,
      );

      setVault(newVault);
      setSummaryVault(updatedSummaryVault);

      console.log("Sincronização completa!");
      return;
    } catch (error) {
      console.error("Erro ao salvar. Tentando recuperar...", error);
      await cryptoService.updateVaultFromCredential(vault, updatedCredential);
      alert(
        "Erro ao sincronizar. Verifique sua conexão ou tente salvar novamente.",
      );
      return;
    } finally {
      setIsLoadingCredential(false);
    }
  };

  // const handleSaveAndDelete = async (
  //   newTempVault?: CredentialType | null,
  //   newSummaryVault?: VaultSummarizedData | null,
  // ) => {
  //   const baseData = isEdit || isCreate ? tempVault : credential;

  //   if (!baseData || !vault) return;

  //   const updatedCredential = {
  //     ...tempVault,
  //     isDeleted: isEdit || isCreate ? false : true,
  //     updatedAt: new Date().toISOString(),
  //   };

  //   try {
  //     try {
  //       const newVault = await cryptoService.updateVaultFromCredential(
  //         vault,
  //         updatedCredential,
  //       );
  //       setIsLoadingCredential(true);
  //       await uploadVault(newVault);

  //       const updatedSummaryVault = updateSummaryVaultCredential(
  //         summaryVault!,
  //         updatedCredential,
  //       );

  //       setSummaryVault(updatedSummaryVault);
  //       setVault(newVault);
  //     } catch (error) {
  //       console.error("Erro ao sincronizar com a nuvem.", error);
  //     } finally {
  //       setIsLoadingCredential(false);
  //     }

  //     if (isCreate) {
  //       setIsCreate(null);
  //       setSelectedSideCredential(null);
  //     } else if (isEdit) {
  //       setIsEdit(false);
  //     } else {
  //       setSelectedSideCredential(null);
  //     }
  //     console.log("Salvo com sucesso na nuvem e localmente!");
  //   } catch (error) {
  //     console.error("Erro ao salvar. Tentando recuperar...", error);
  //     alert(
  //       "Erro ao sincronizar. Verifique sua conexão ou tente salvar novamente.",
  //     );
  //   }
  // };

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
    setTempVault(newEntry(type));
    setIsCreate(type);
    setIsEdit(false);
  };

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
      {(selectedSideCredential && credential && tempVault) || isCreate ? (
        <Credential
          key={credential ? credential.id || isCreate : null}
          tempVault={tempVault ? tempVault : newEntry(isCreate!)}
          setTempVault={setTempVault}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          isCreate={isCreate}
          setIsCreate={setIsCreate}
          setSelectedSideCredential={setSelectedSideCredential}
          credential={credential!}
          handleStartCreate={handleStartCreate}
          handleSave={handleSave}
          isLoadingCredential={isLoadingCredential}
          setIsLoadingCredential={setIsLoadingCredential}
        />
      ) : (
        <div className="absolute bottom-10 right-10">
          <AddButton handleStartCreate={handleStartCreate} />
        </div>
      )}
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
