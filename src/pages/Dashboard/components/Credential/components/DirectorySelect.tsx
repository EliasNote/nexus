import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Folder } from "@/types/vault";

export const DirectorySelect = ({
  iconTop: Icontop,
  topName,
  isEdit,
  folders,
  disabled,
  selectedFoldersIds,
  setSelectedFoldersIds,
  autoFocus,
  onDoubleClick,
}: {
  iconTop: LucideIcon;
  topName: string;
  isEdit?: boolean;
  folders: Folder[];
  disabled?: boolean;
  selectedFoldersIds: string[];
  setSelectedFoldersIds: (ids: string[]) => void;
  autoFocus?: boolean;
  onDoubleClick?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (autoFocus && !disabled) {
      dropdownRef.current?.focus();
    }
  }, [autoFocus, disabled]);

  const toggleFolder = (id: string) => {
    const newIds = selectedFoldersIds.includes(id)
      ? selectedFoldersIds.filter((i) => i !== id)
      : [...selectedFoldersIds, id];

    setSelectedFoldersIds(newIds);
  };

  const safeFolders = Array.isArray(folders) ? folders : [];

  const selectedFolders = safeFolders.filter((f) =>
    selectedFoldersIds.includes(f.id),
  );

  return (
    <div
      className="flex flex-col gap-0.5 w-full max-w-[760px] outline-none"
      ref={dropdownRef}
      onDoubleClick={() => {
        onDoubleClick?.()
        setIsOpen(true)
      }}
      tabIndex={-1}
    >
      <span className="text-[12px] text-zinc-400 font-medium flex items-start gap-1">
        <Icontop size={16} strokeWidth={1.5} />
        <span>{topName}</span>
      </span>

      <div className="relative">
        <button
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between bg-zinc-900 border ${isOpen ? "border-zinc-600" : "border-zinc-800"} h-[45px] w-full px-3 ${disabled ? "pointer-events-none" : "cursor-pointer"} transition-colors`}
        >
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {selectedFolders.length > 0 ? (
              selectedFolders.map((f) => (
                <span
                  key={f.id}
                  className="flex items-center gap-1 bg-zinc-800 text-white text-[12px] px-2 py-0.5 whitespace-nowrap border border-zinc-700"
                >
                  {f.name}
                  <X
                    size={14}
                    className={`${isEdit && "hover:text-red-500 cursor-pointer"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFolder(f.id);
                    }}
                  />
                </span>
              ))
            ) : (
              <span className="text-zinc-500 text-sm">
                Nenhum diretório selecionado
              </span>
            )}
          </div>
          <ChevronDown
            size={18}
            className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-[50px] left-0 w-full bg-zinc-900 border border-zinc-700 z-50 shadow-2xl max-h-[200px] overflow-y-auto">
            {folders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => toggleFolder(folder.id)}
                className="flex items-center justify-between px-4 py-2 hover:bg-zinc-800 cursor-pointer text-sm text-zinc-300 transition-colors"
              >
                <span>{folder.name}</span>
                {selectedFoldersIds.includes(folder.id) && (
                  <Check size={16} className="text-brand" />
                )}
              </div>
            ))}
            {folders.length === 0 && (
              <div className="p-4 text-zinc-500 text-center text-sm">
                Crie um diretório na barra lateral primeiro.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
