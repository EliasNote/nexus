import { type Credential as CredentialType } from "@/types/vault";
import { Login } from "./CredentialTypes/Login";
import { useCloudStore } from "@/hooks/useCloudStore";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header/Header";
import { Card } from "./CredentialTypes/Card";
import { Note } from "./CredentialTypes/Note";
import { useState } from "react";

export const Credential = ({
  credential,
  setCredential,
  setSelectedSideCredential,
  tempVault,
  setTempVault,
  isEdit,
  setIsEdit,
  isCreate,
  setIsCreate,
  isLoadingCredential,
  handleStartCreate,
}: {
  credential: CredentialType;
  setCredential: (credential: CredentialType | null) => void;
  setSelectedSideCredential: (id: string | null) => void;
  tempVault: CredentialType;
  setTempVault: React.Dispatch<React.SetStateAction<CredentialType | null>>;
  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
  isCreate: CredentialType["type"] | null;
  setIsCreate: (isCreate: CredentialType["type"] | null) => void;
  isLoadingCredential: boolean;
  handleStartCreate: (type: CredentialType["type"]) => void;
}) => {
  const iconsSize = 18;

  const summaryVault = useCloudStore((state) => state.summaryVault);

  const folders = summaryVault?.folders ?? [];

  const [autoFocusId, setAutoFocusId] = useState<string | null>(null);

  const handleEditClick = (focusId: string = "title") => {
    setTempVault(credential || null);
    setAutoFocusId(focusId);
    setIsEdit(true);
  };

  const isEditable = isEdit || isCreate !== null;

  const handleCancel = () => {
    if (isCreate) {
      setIsCreate(null);
      setSelectedSideCredential(null);
    } else {
      setIsEdit(false);
    }
  };

  const handleRemoveCredential = async () => {
    setTempVault(null);
    setCredential(null);
    setSelectedSideCredential(null);
  };

  return (
    <section className="flex flex-col h-screen w-full">
      <Header
        tempVault={tempVault}
        setTempVault={setTempVault}
        iconsSize={iconsSize}
        isLoadingCredential={isLoadingCredential}
        handleRemoveCredential={handleRemoveCredential}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        isCreate={isCreate}
        setIsCreate={setIsCreate}
        handleEditClick={handleEditClick}
        handleCancel={handleCancel}
        autoFocus={autoFocusId === "title"}
      />
      <div className="flex flex-1 h-full w-full flex-col overflow-y-auto">
        {tempVault?.type === "login" && (
          <Login
            key={isCreate ? "new" : tempVault.id}
            folders={folders}
            isEdit={isEditable}
            setIsEdit={setIsEdit}
            isCreate={isCreate}
            credential={tempVault}
            setCredential={setTempVault}
            autoFocusId={autoFocusId}
            setAutoFocusId={setAutoFocusId}
          />
        )}
        {tempVault?.type === "card" && (
          <Card
            key={isCreate ? "new" : tempVault.id}
            folders={folders}
            isEdit={isEditable}
            setIsEdit={setIsEdit}
            isCreate={isCreate}
            credential={tempVault}
            setCredential={setTempVault}
            autoFocusId={autoFocusId}
            setAutoFocusId={setAutoFocusId}
          />
        )}
        {tempVault?.type === "note" && (
          <Note
            key={isCreate ? "new" : tempVault.id}
            folders={folders}
            isEdit={isEditable}
            setIsEdit={setIsEdit}
            credential={tempVault}
            setCredential={setTempVault}
            autoFocusId={autoFocusId}
            setAutoFocusId={setAutoFocusId}
          />
        )}
      </div>
      <Footer
        isCreate={isCreate}
        tempVault={tempVault}
        summaryVault={
          summaryVault?.entries.filter((x) => x.id === tempVault.id)[0]
        }
        handleStartCreate={handleStartCreate}
      />
    </section>
  );
};
