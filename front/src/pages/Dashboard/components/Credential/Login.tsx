import { Copy, User, Eye, Key, Globe, Folder, NotepadText } from "lucide-react";
import { Input } from "./components/Input";
import { DirectorySelect } from "./components/DirectorySelect";
import { TextArea } from "./components/TextArea";
import type {
  Folder as FolderType,
  LoginCredential,
  VaultEntry,
} from "@/types/vault";

export const Login = ({
  folders,
  isEdit,
  credential,
  setCredential,
}: {
  folders: FolderType[];
  isEdit: boolean;
  credential: LoginCredential;
  setCredential: React.Dispatch<React.SetStateAction<VaultEntry | null>>;
}) => {
  const handleChange = (
    field: keyof LoginCredential,
    value: string | string[],
  ) => {
    setCredential({ ...credential, [field]: value });
  };

  return (
    <section className="flex flex-1 h-full flex-col gap-4 w-full items-center justify-center py-10 overflow-y-auto no-scrollbar">
      <Input
        disabled={!isEdit}
        placeholder="Usuário/email"
        iconTop={User}
        topName="USUÁRIO"
        iconsInput={[
          {
            id: "copy",
            icon: Copy,
          },
        ]}
        value={credential.username!}
        onChange={(val) => handleChange("username", val)}
      />
      <Input
        disabled={!isEdit}
        placeholder="Senha"
        isPassword={true}
        iconTop={Key}
        topName="SENHA"
        iconsInput={[
          {
            id: "password",
            icon: Eye,
          },
          {
            id: "copy",
            icon: Copy,
          },
        ]}
        value={credential.password}
        onChange={(val) => handleChange("password", val)}
      />
      <Input
        disabled={!isEdit}
        placeholder="https://exemplo.com.br"
        iconTop={Globe}
        topName="URL"
        iconsInput={[
          {
            id: "copy",
            icon: Copy,
          },
        ]}
        value={credential.url}
        onChange={(val) => handleChange("url", val)}
      />
      <DirectorySelect
        disabled={!isEdit}
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
