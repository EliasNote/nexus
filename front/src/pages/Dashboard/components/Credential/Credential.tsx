import { type Credential as CredentialType } from "@/types/vault";
import { Login } from "./Login";
import { useCloudStore } from "@/hooks/useCloudStore";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header/Header";

export const Credential = ({
  credential,
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

  const handleEditClick = () => {
    setTempVault(credential || null);
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

  return (
    <section className="flex flex-col h-screen w-full">
      <Header
        tempVault={tempVault}
        setTempVault={setTempVault}
        iconsSize={iconsSize}
        isLoadingCredential={isLoadingCredential}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        isCreate={isCreate}
        setIsCreate={setIsCreate}
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
