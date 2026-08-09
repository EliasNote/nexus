import {
  User,
  Key,
  Globe,
  Folder,
  NotepadText,
} from "lucide-react";
import { Input } from "./../components/Input";
import { DirectorySelect } from "./../components/DirectorySelect";
import { TextArea } from "./../components/TextArea";
import type {
  Directory as DirectoryType,
  LoginCredential,
  Credential,
} from "@/types/vault";

export const Login = ({
  directories,
  isEdit,
  setIsEdit,
  isCreate,
  credential,
  setCredential,
  autoFocusId,
  setAutoFocusId,

}: {
  directories: DirectoryType[];
  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
  isCreate: Credential["type"] | null;
  credential: LoginCredential;
  setCredential: React.Dispatch<React.SetStateAction<Credential | null>>;
  autoFocusId: string | null;
  setAutoFocusId: (id: string | null) => void;
}) => {
  const handleChange = (
    field: keyof LoginCredential,
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
        placeholder="Usuário/email"
        iconTop={User}
        topName="USUÁRIO"
        isCopyIcon={true}
        value={credential.username!}
        autoFocus={autoFocusId === "username"}
        onChange={(val) => handleChange("username", val)}
        onDoubleClick={() => {
          setAutoFocusId("username");
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
        autoFocus={autoFocusId === "password"}
        isEdit={isEdit}
        isCreate={Boolean(isCreate)}
        onChange={(val) => handleChange("password", val)}
        onDoubleClick={() => {
          setAutoFocusId("password");
          setIsEdit(true);
        }}
      />
      <Input
        disabled={!isEdit}
        placeholder="https://exemplo.com.br"
        iconTop={Globe}
        topName="URL"
        isCopyIcon={true}
        value={credential.url}
        autoFocus={autoFocusId === "url"}
        onChange={(val) => handleChange("url", val)}
        onDoubleClick={() => {
          setAutoFocusId("url");
          setIsEdit(true);
        }}
      />
      <DirectorySelect
        disabled={!isEdit}
        isEdit={isEdit}
        iconTop={Folder}
        topName="DIRETÓRIOS"
        selectedDirectoriesIds={credential.directoriesIds ?? []}
        setSelectedDirectoriesIds={(ids) => handleChange("directoriesIds", ids)}
        directories={directories}
        autoFocus={autoFocusId === "directoriesIds"}
        onDoubleClick={() => {
          setAutoFocusId("directoriesIds");
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
