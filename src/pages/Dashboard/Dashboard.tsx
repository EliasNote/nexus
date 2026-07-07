import { useState, useEffect, useMemo } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import SidebarCredentials from "./components/SidebarCredentials/SidebarCredentials";
import { cryptoService, useCloudStore } from "../../hooks/useCloudStore";
import { Credential } from "./components/Credential/Credential";
import type { Credential as CredentialType, Folder } from "@/types/vault";
import { AddButton } from "./components/Credential/AddButton";
import { useAutoSave } from "@/hooks/useSave";
import { SIDEBAR_BUTTONS_IDS } from "./components/Sidebar/Buttons";
import { Generator } from "./components/Generator/Generator";
import { Audit } from "./components/Audit/Audit";

// import { salvarJsonComoArquivo, salvarJsonComTauri } from "./utils/salvarLocal";

const Dashboard = () => {
  useAutoSave();

  const [selected, setSelected] = useState<number | string>(0);
  const [focusPassword, setFocusPassword] = useState(false);

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

  const folders: Folder[] = useMemo(() => {
    return summaryVault?.folders || [];
  }, [summaryVault]);

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
          const targetFolder = folders.find((f) => f.id === selected);
          return targetFolder
            ? summaryVault.entries.filter((c) =>
                c.foldersIds?.includes(targetFolder.id),
              )
            : [];
        }
        return [];
    }
  }, [selected, summaryVault, folders]);

  useEffect(() => {
    if (selectedSideCredential && vault) {
      cryptoService
        .getCredential(selectedSideCredential, vault)
        .then((data) => {
          setCredential(data);
          setTempVault(data);
          setIsEdit(!isEditFromAudit ? false : true);
          setFocusPassword(isEditFromAudit);
          setIsCreate(null);
          setIsEditFromAudit(false);
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
        password: "",
      }),
      ...(type === "note" && { name: "", content: "" }),
    }) as CredentialType;

  const handleStartCreate = (type: CredentialType["type"]) => {
    setSelectedSideCredential(null);
    setTempVault(newEntry(type));
    setIsCreate(type);
    setIsEdit(false);
  };

  const handleChangeCredentialFromAudit = (credentialId: string) => {
    setIsEditFromAudit(true);
    setSelected(SIDEBAR_BUTTONS_IDS.all);
    setSelectedSideCredential(credentialId);
    setIsEdit(true);
  };

  return (
    <main className="flex bg-[#0A0A0A] max-h-screen w-screen">
      <Sidebar
        selected={selected}
        setSelected={setSelected}
        folders={folders}
      />
      {{
        [SIDEBAR_BUTTONS_IDS.generator]: <Generator />,
        [SIDEBAR_BUTTONS_IDS.audit]: (
          <Audit onChangeCredential={handleChangeCredentialFromAudit} />
        ),
      }[selected] || (
        <>
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
              setCredential={setCredential}
              focusPassword={focusPassword}
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
