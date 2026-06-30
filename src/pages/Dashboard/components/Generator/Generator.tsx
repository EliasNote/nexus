import { Binary, Copy, User } from "lucide-react";
import { Input } from "../Credential/components/Input";

export const Generator = () => {
  return (
    <section className="flex items-center flex-col h-screen w-full">
      <div className="flex items-center justify-center">
        <Binary size={32} className="text-brand" />
        <h2 className="text-[24px] text-white font-bold">GERADOR DE SENHAS</h2>
      </div>
      <Input
        placeholder=""
        iconTop={User}
        topName=""
        iconsInput={[
          {
            id: "copy",
            icon: Copy,
          },
        ]}
        value={""}
      />
    </section>
  );
};

// {
//   credential,
//   setSelectedSideCredential,
//   tempVault,
//   setTempVault,
//   isEdit,
//   setIsEdit,
//   isCreate,
//   setIsCreate,
//   isLoadingCredential,
//   handleStartCreate,
// }: {
//   credential: CredentialType;
//   setSelectedSideCredential: (id: string | null) => void;
//   tempVault: CredentialType;
//   setTempVault: React.Dispatch<React.SetStateAction<CredentialType | null>>;
//   isEdit: boolean;
//   setIsEdit: (isEdit: boolean) => void;
//   isCreate: CredentialType["type"] | null;
//   setIsCreate: (isCreate: CredentialType["type"] | null) => void;
//   isLoadingCredential: boolean;
//   handleStartCreate: (type: CredentialType["type"]) => void;
// }
