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
  tempCredential,
  setTempCredential,
  isEdit,
  setIsEdit,
  isCreate,
  isEditFromAudit,
  setIsCreate,
  isLoadingCredential,
  handleStartCreate,
}: {
  credential: CredentialType;
  setCredential: (credential: CredentialType | null) => void;
  setSelectedSideCredential: (id: string | null) => void;
  tempCredential: CredentialType;
  setTempCredential: React.Dispatch<React.SetStateAction<CredentialType | null>>;
  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
  isCreate: CredentialType["type"] | null;
  isEditFromAudit: boolean;
  setIsCreate: (isCreate: CredentialType["type"] | null) => void;
  isLoadingCredential: boolean;
  handleStartCreate: (type: CredentialType["type"]) => void;
}) => {
  const iconsSize = 18;

  const summaryVault = useCloudStore((state) => state.summaryVault);
  const summaryCredential = summaryVault?.credentials.filter((x) => x.id === tempCredential.id)[0]

  const directories = summaryVault?.directories ?? [];

  const [autoFocusId, setAutoFocusId] = useState<string | null>(isEditFromAudit ? "password" : null);

  const handleEditClick = (focusId: string = "title") => {
    setTempCredential(credential || null);
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
    setTempCredential(null);
    setCredential(null);
    setSelectedSideCredential(null);
  };

  return (
    <section className="flex flex-col h-full w-full">
      <Header
        originalCredential={credential}
        tempCredential={tempCredential}
        setTempCredential={setTempCredential}
        summaryCredential={summaryCredential}
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
        {tempCredential?.type === "login" && (
          <Login
            key={isCreate ? "new" : tempCredential.id}
            directories={directories}
            isEdit={isEditable}
            setIsEdit={setIsEdit}
            isCreate={isCreate}
            credential={tempCredential}
            setCredential={setTempCredential}
            autoFocusId={autoFocusId}
            setAutoFocusId={setAutoFocusId}
          />
        )}
        {tempCredential?.type === "card" && (
          <Card
            key={isCreate ? "new" : tempCredential.id}
            directories={directories}
            isEdit={isEditable}
            setIsEdit={setIsEdit}
            isCreate={isCreate}
            credential={tempCredential}
            setCredential={setTempCredential}
            autoFocusId={autoFocusId}
            setAutoFocusId={setAutoFocusId}
          />
        )}
        {tempCredential?.type === "note" && (
          <Note
            key={isCreate ? "new" : tempCredential.id}
            directories={directories}
            isEdit={isEditable}
            setIsEdit={setIsEdit}
            credential={tempCredential}
            setCredential={setTempCredential}
            autoFocusId={autoFocusId}
            setAutoFocusId={setAutoFocusId}
          />
        )}
      </div>
      <Footer
        isCreate={isCreate}
        tempCredential={tempCredential}
        summaryCredential={summaryCredential}
        handleStartCreate={handleStartCreate}
      />
    </section>
  );
};
