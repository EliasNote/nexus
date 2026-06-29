import { Folder, NotepadText } from "lucide-react";
import { DirectorySelect } from "./../components/DirectorySelect";
import { TextArea } from "./../components/TextArea";
import type {
  Folder as FolderType,
  LoginCredential,
  Credential,
  NoteCredential,
} from "@/types/vault";

export const Note = ({
  folders,
  isEdit,
  credential,
  setCredential,
}: {
  folders: FolderType[];
  isEdit: boolean;
  credential: NoteCredential;
  setCredential: React.Dispatch<React.SetStateAction<Credential | null>>;
}) => {
  const handleChange = (
    field: keyof NoteCredential,
    value: string | string[],
  ) => {
    setCredential((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  return (
    <section className="flex flex-1 h-full flex-col gap-4 w-full items-center justify-center py-10 overflow-y-auto no-scrollbar">
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
