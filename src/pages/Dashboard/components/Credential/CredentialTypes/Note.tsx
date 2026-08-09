import { Folder, NotepadText } from "lucide-react";
import { DirectorySelect } from "./../components/DirectorySelect";
import { TextArea } from "./../components/TextArea";
import type {
  Directory as DirectoryType,
  Credential,
  NoteCredential,
} from "@/types/vault";

export const Note = ({
  directories,
  isEdit,
  setIsEdit,
  credential,
  setCredential,
  autoFocusId,
  setAutoFocusId,
}: {
  directories: DirectoryType[];
  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
  credential: NoteCredential;
  setCredential: React.Dispatch<React.SetStateAction<Credential | null>>;
  autoFocusId: string | null;
  setAutoFocusId: (id: string | null) => void;
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
    <section className="flex flex-1 min-h-full flex-col w-full gap-4 items-center py-10 overflow-y-auto">
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
