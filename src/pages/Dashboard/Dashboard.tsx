import { useState, useEffect, useMemo } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import SidebarCredentials from "./components/SidebarCredentials/SidebarCredentials";
import { cryptoService, useCloudStore } from "../../hooks/useCloudStore";
import { Credential } from "./components/Credential/Credential";
import type { Credential as CredentialType, Directory } from "@/types/vault";
import { AddButton } from "./components/Credential/AddButton";
import { useAutoSave } from "@/hooks/useSave";
import { SIDEBAR_BUTTONS_IDS } from "./components/Sidebar/Buttons";
import { Generator } from "./components/Generator/Generator";
import { Audit } from "./components/Audit/Audit";
import { Config } from "./components/Config/Config";



const Dashboard = () => {
  useAutoSave();

  const [selected, setSelected] = useState<number | string>(0);

  const vault = useCloudStore((state) => state.vault);
  const summaryVault = useCloudStore((state) => state.summaryVault);
  const [selectedSideCredential, setSelectedSideCredential] = useState<
    string | null
  >(null);
  const [credential, setCredential] = useState<CredentialType | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isEditFromAudit, setIsEditFromAudit] = useState(false);
  const [isCreate, setIsCreate] = useState<CredentialType["type"] | null>(null);
  const [tempVault, setTempVault] = useState<CredentialType | null>(credential);
  const [isLoadingCredential] = useState(false);

  const directories: Directory[] = useMemo(() => {
    return summaryVault?.directories || [];
  }, [summaryVault]);

  const getTitle = () => {
    switch (selected) {
      case SIDEBAR_BUTTONS_IDS.all:
        return "TODOS OS ITENS";
      case SIDEBAR_BUTTONS_IDS.favorites:
        return "FAVORITOS";
      case SIDEBAR_BUTTONS_IDS.trash:
        return "LIXEIRA";
      default:
        if (typeof selected === "string") {
          const targetDirectory = directories.find((f) => f.id === selected);
          return targetDirectory?.name || "";
        };
        return "TODOS OS ITENS";
    }
  }

  const credentials = useMemo(() => {
    if (!summaryVault?.entries) return [];

    switch (selected) {
      case SIDEBAR_BUTTONS_IDS.all:
        return summaryVault.entries.filter(
          (credential) => !credential.isDeleted,
        );
      case SIDEBAR_BUTTONS_IDS.favorites:
        return summaryVault.entries.filter(
          (credential) => credential.isFavorite && !credential.isDeleted,
        );
      case SIDEBAR_BUTTONS_IDS.trash:
        return summaryVault.entries.filter(
          (credential) => credential.isDeleted,
        );
      default:
        if (selected as string) {
          const targetDirectory = directories.find((f) => f.id === selected);
          return targetDirectory
            ? summaryVault.entries.filter((c) =>
                c.directoriesIds?.includes(targetDirectory.id),
              )
            : [];
        }
        return [];
    }
  }, [selected, summaryVault, directories]);

  const clearDecryptedCredential = (id?: string | null) => {
    setCredential(null);
    setTempVault(null);
    setSelectedSideCredential(id ?? null);
    setIsEdit(false);
    setIsEditFromAudit(false);
    setIsCreate(null);
  };

  const handleSelectCredential = (id: string | null) => {
    if (isEdit || isCreate) {
      const shouldDiscard = window.confirm(
        "Descartar as alterações e abrir outra credencial?",
      );
      if (!shouldDiscard) return;
    }

    clearDecryptedCredential(id);
  };

  useEffect(() => {
    if (selectedSideCredential && vault) {
      cryptoService
        .getCredential(selectedSideCredential, vault)
        .then((data) => {
          setCredential(data);
          setTempVault(data);
          setIsCreate(null);
        });
    }
  }, [selectedSideCredential, vault]);

  const newEntry = (type: CredentialType["type"]) =>
    ({
      id: crypto.randomUUID(),
      type: type,
      title: "Nova Credencial",
      isFavorite: false,
      isDeleted: false,
      directoriesIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      audit: { leak: false, weak: false, reused: false, renewal: false },
      ...(type === "login" && { username: "", password: "", url: "" }),
      ...(type === "card" && {
        holderName: "",
        cardNumber: "",
        expirationDate: "",
        cvv: "",
        password: "",
      }),
      ...(type === "note" && { name: "", content: "" }),
    }) as CredentialType;

  const handleStartCreate = (type: CredentialType["type"]) => {
    clearDecryptedCredential();

    setTempVault(newEntry(type));
    setIsCreate(type);
  };

  const handleChangeCredentialFromAudit = (credentialId: string) => {
    clearDecryptedCredential(credentialId);

    setSelected(SIDEBAR_BUTTONS_IDS.all);
    setIsEditFromAudit(true);
    setIsEdit(true);
  };

  return (
    <main className="flex bg-dark-background h-full w-full">
      <Sidebar
        selected={selected}
        setSelected={setSelected}
        directories={directories}
      />
      {{
        [SIDEBAR_BUTTONS_IDS.generator]: <Generator />,
        [SIDEBAR_BUTTONS_IDS.audit]: <Audit onChangeCredential={handleChangeCredentialFromAudit} />,
        [SIDEBAR_BUTTONS_IDS.config]: <Config />,
      }[selected] || (
        <>
          <SidebarCredentials
            selectedSideCredential={selectedSideCredential}
            setSelectedSideCredential={handleSelectCredential}
            credentials={credentials}
            topTitle={getTitle()}
          />
          {(selectedSideCredential && credential && tempVault) || isCreate ? (
            <Credential
              tempVault={tempVault || newEntry(isCreate!)}
              setTempVault={setTempVault}
              isEdit={isEdit}
              setIsEdit={setIsEdit}
              isCreate={isCreate}
              isEditFromAudit={isEditFromAudit}
              setIsCreate={setIsCreate}
              setSelectedSideCredential={setSelectedSideCredential}
              credential={credential!}
              setCredential={setCredential}
              isLoadingCredential={isLoadingCredential}
              handleStartCreate={handleStartCreate}
            />
          ) : (
            <div className="absolute bottom-10 right-10">
              <AddButton handleStartCreate={handleStartCreate} />
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default Dashboard;
