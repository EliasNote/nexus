import { type Credential as CredentialType } from "@/types/vault";
import { Login } from "./Login";
import { useCloudStore } from "@/hooks/useCloudStore";
import { useState } from "react";
import { useCloudSync } from "@/hooks/useCloudSync";
import { updateSummaryVaultCredential } from "@/utils/utils";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";

export const Credential = ({
  credential,
  setSelectedSideCredential,
  tempVault,
  setTempVault,
  isEdit,
  setIsEdit,
  isCreate,
  setIsCreate,
  handleStartCreate,
}: {
  credential: CredentialType;
  setSelectedSideCredential: (id: string | null) => void;
  tempVault: CredentialType;
  setTempVault: React.Dispatch<React.SetStateAction<CredentialType | null>>;
  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
  isCreate: CredentialType["type"] | null;
  setIsCreate: (isCreate: CredentialType["type"] | null) => void;
  handleStartCreate: (type: CredentialType["type"]) => void;
}) => {
  const iconsSize = 18;
  const vault = useCloudStore((state) => state.vault);
  const setSummaryVault = useCloudStore((state) => state.setSummaryVault);

  const summaryVault = useCloudStore((state) => state.summaryVault);
  const setVault = useCloudStore((state) => state.setVault);
  const { uploadVault } = useCloudSync();
  const cryptoService = useCloudStore.getState().cryptoService;

  const folders = summaryVault?.folders ?? [];
  const [isLoading, setIsLoading] = useState(false);

  const handleEditClick = () => {
    setTempVault(credential || null);
    setIsEdit(true);
  };

  const isEditable = isEdit || isCreate !== null;

  const handleSaveAndDelete = async () => {
    const baseData = isEdit || isCreate ? tempVault : credential;

    if (!baseData || !vault) return;

    const updatedCredential = {
      ...baseData,
      isDeleted: isEdit || isCreate ? false : true,
      updatedAt: new Date().toISOString(),
    };

    try {
      try {
        const newVault = await cryptoService.updateVaultFromCredential(
          vault,
          updatedCredential,
        );
        setIsLoading(true);
        await uploadVault(newVault);

        const updatedSummaryVault = updateSummaryVaultCredential(
          summaryVault!,
          updatedCredential,
        );

        setSummaryVault(updatedSummaryVault);
        setVault(newVault);
      } catch (error) {
        console.error("Erro ao sincronizar com a nuvem.", error);
      } finally {
        setIsLoading(false);
      }

      if (isCreate) {
        setIsCreate(null);
        setSelectedSideCredential(null);
      } else if (isEdit) {
        setIsEdit(false);
      } else {
        setSelectedSideCredential(null);
      }
      console.log("Salvo com sucesso na nuvem e localmente!");
    } catch (error) {
      console.error("Erro ao salvar. Tentando recuperar...", error);
      alert(
        "Erro ao sincronizar. Verifique sua conexão ou tente salvar novamente.",
      );
    }
  };

  const handleCancel = () => {
    if (isCreate) {
      setIsCreate(null);
      setSelectedSideCredential(null);
    } else {
      setIsEdit(false);
    }
  };

  return (
    <section className="flex flex-col h-screen w-full">
      <Header
        tempVault={tempVault}
        setTempVault={setTempVault}
        iconsSize={iconsSize}
        handleSaveAndDelete={handleSaveAndDelete}
        isLoading={isLoading}
        isEdit={isEdit}
        isCreate={isCreate}
        handleEditClick={handleEditClick}
        handleCancel={handleCancel}
      />
      <div className="flex-1 h-full w-full flex flex-col">
        {tempVault?.type === "login" && (
          <Login
            key={isCreate ? "new" : tempVault.id}
            folders={folders}
            isEdit={isEditable}
            credential={tempVault}
            setCredential={setTempVault}
          />
        )}
      </div>
      <Footer
        isCreate={isCreate}
        tempVault={tempVault}
        handleStartCreate={handleStartCreate}
      />
    </section>
  );
};
