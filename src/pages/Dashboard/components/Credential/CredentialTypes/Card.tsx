import {
  Copy,
  User,
  Eye,
  Key,
  CreditCard,
  Calendar,
  Folder,
  NotepadText,
  RotateCcwKey,
} from "lucide-react";
import { Input } from "../components/Input";
import { DirectorySelect } from "../components/DirectorySelect";
import { TextArea } from "../components/TextArea";
import type {
  Folder as FolderType,
  Credential,
  CreditCardCredential,
} from "@/types/vault";
import { Date } from "../components/Date";

export const Card = ({
  folders,
  isEdit,
  isCreate,
  credential,
  setCredential,
}: {
  folders: FolderType[];
  isEdit: boolean;
  isCreate: Credential["type"] | null;
  credential: CreditCardCredential;
  setCredential: React.Dispatch<React.SetStateAction<Credential | null>>;
}) => {
  const handleChange = (
    field: keyof CreditCardCredential,
    value: string | string[],
  ) => {
    setCredential((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  return (
    <section className="flex flex-1 h-full flex-col gap-4 w-full items-center justify-center py-10 overflow-y-auto no-scrollbar">
      <Input
        disabled={!isEdit}
        placeholder="Nome do Titular"
        iconTop={User}
        topName="NOME DO TITULAR"
        iconsInput={[
          {
            id: "copy",
            icon: Copy,
          },
        ]}
        value={credential.holderName!}
        onChange={(val) => handleChange("holderName", val)}
      />
      <Input
        disabled={!isEdit}
        placeholder="Número do Cartão"
        isPassword={true}
        iconTop={CreditCard}
        topName="NÚMERO DO CARTÃO"
        iconsInput={[
          {
            id: "eye",
            icon: Eye,
          },
          {
            id: "copy",
            icon: Copy,
          },
        ]}
        value={credential.cardNumber}
        onChange={(val) => handleChange("cardNumber", val)}
      />
      <Date
        disabled={!isEdit}
        iconTop={Calendar}
        topName="DATA DE EXPIRACAO"
        value={credential.expirationDate}
        onChange={(val) => handleChange("expirationDate", val)}
      />
      <Input
        disabled={!isEdit}
        placeholder="CVV"
        isPassword={true}
        iconTop={Key}
        topName="CVV"
        iconsInput={[
          {
            id: "eye",
            icon: Eye,
          },
          {
            id: "copy",
            icon: Copy,
          },
        ]}
        value={credential.cvv}
        onChange={(val) => handleChange("cvv", val)}
      />
      <Input
        disabled={!isEdit}
        placeholder="Senha"
        isPassword={true}
        iconTop={Key}
        topName="SENHA"
        iconsInput={[
          {
            id: "eye",
            icon: Eye,
          },
          {
            id: "generate",
            icon: RotateCcwKey,
          },
          {
            id: "copy",
            icon: Copy,
          },
        ]}
        value={credential.password}
        isEdit={isEdit}
        isCreate={Boolean(isCreate)}
        onChange={(val) => handleChange("password", val)}
      />
      <DirectorySelect
        disabled={!isEdit}
        isEdit={isEdit}
        iconTop={Folder}
        topName="DIRETÓRIOS"
        selectedFoldersIds={credential.foldersIds ?? []}
        setSelectedFoldersIds={(ids) => handleChange("foldersIds", ids)}
        folders={folders}
      />
      <TextArea
        disabled={!isEdit}
        iconTop={NotepadText}
        topName="ANOTAÇÕES"
        placeholder="anotações"
        value={credential.notes}
        onChange={(val) => handleChange("notes", val)}
      />
    </section>
  );
};

