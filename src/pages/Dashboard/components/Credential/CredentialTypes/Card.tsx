import {
  User,
  Key,
  CreditCard,
  Calendar,
  Folder,
  NotepadText,
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
  setIsEdit,
  isCreate,
  credential,
  setCredential,
  autoFocusId,
  setAutoFocusId,
}: {
  folders: FolderType[];
  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
  isCreate: Credential["type"] | null;
  credential: CreditCardCredential;
  setCredential: React.Dispatch<React.SetStateAction<Credential | null>>;
  autoFocusId: string | null;
  setAutoFocusId: (id: string | null) => void;
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
    <section className="flex flex-1 min-h-full flex-col w-full gap-4 items-center py-10 overflow-y-auto">
      <Input
        disabled={!isEdit}
        placeholder="Nome do Titular"
        iconTop={User}
        isCopyIcon={true}
        topName="NOME DO TITULAR"
        value={credential.holderName!}
        onChange={(val) => handleChange("holderName", val)}
        autoFocus={autoFocusId === "holderName"}
        onDoubleClick={() => {
          setAutoFocusId("holderName");
          setIsEdit(true);
        }}
      />
      <Input
        disabled={!isEdit}
        placeholder="Número do Cartão"
        isPasswordIcon={true}
        isCopyIcon={true}
        iconTop={CreditCard}
        topName="NÚMERO DO CARTÃO"
        value={credential.cardNumber}
        onChange={(val) => handleChange("cardNumber", val)}
        autoFocus={autoFocusId === "cardNumber"}
        onDoubleClick={() => {
          setAutoFocusId("cardNumber");
          setIsEdit(true);
        }}
      />
      <Date
        disabled={!isEdit}
        iconTop={Calendar}
        topName="DATA DE EXPIRACAO"
        value={credential.expirationDate}
        onChange={(val) => handleChange("expirationDate", val)}
        onDoubleClick={() => {
          setAutoFocusId("expirationDate");
          setIsEdit(true);
        }}
      />
      <Input
        disabled={!isEdit}
        placeholder="CVV"
        isPasswordIcon={true}
        isCopyIcon={true}
        iconTop={Key}
        topName="CVV"
        value={credential.cvv}
        onChange={(val) => handleChange("cvv", val)}
        autoFocus={autoFocusId === "cvv"}
        onDoubleClick={() => {
          setAutoFocusId("cvv");
          setIsEdit(true);
        }}
      />
      <Input
        disabled={!isEdit}
        placeholder="Senha"
        isPasswordIcon={true}
        isCopyIcon={true}
        isGenerateIcon={true}
        iconTop={Key}
        topName="SENHA"
        value={credential.password}
        isEdit={isEdit}
        isCreate={Boolean(isCreate)}
        onChange={(val) => handleChange("password", val)}
        autoFocus={autoFocusId === "password"}
        onDoubleClick={() => {
          setAutoFocusId("password");
          setIsEdit(true);
        }}
      />
      <DirectorySelect
        disabled={!isEdit}
        isEdit={isEdit}
        iconTop={Folder}
        topName="DIRETÓRIOS"
        selectedFoldersIds={credential.foldersIds ?? []}
        setSelectedFoldersIds={(ids) => handleChange("foldersIds", ids)}
        folders={folders}
        autoFocus={autoFocusId === "foldersIds"}
        onDoubleClick={() => {
          setAutoFocusId("foldersIds");
          setIsEdit(true);
        }}
      />
      <TextArea
        disabled={!isEdit}
        iconTop={NotepadText}
        topName="ANOTAÇÕES"
        placeholder="anotações"
        value={credential.notes}
        onChange={(val) => handleChange("notes", val)}
        autoFocus={autoFocusId === "notes"}
        onDoubleClick={() => {
          setAutoFocusId("notes");
          setIsEdit(true);
        }}
      />
    </section>
  );
};
