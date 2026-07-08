import { useEffect, useRef, useState } from "react";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";

export const Button = ({
  id,
  selectedId,
  title,
  setSelected,
  icon,
  onClick,
  isSyncButton,
  isSyncButtonAllowed,
  isFolder,
  onRenameFolder,
  onDeleteFolder,
}: {
  id: number | string;
  selectedId: number | string;
  title: string;
  setSelected: (id: number | string) => void;
  icon: React.ReactNode;
  onClick?: () => void;
  isSyncButton?: boolean;
  isSyncButtonAllowed?: boolean;
  isFolder?: boolean;
  onRenameFolder?: (name: string) => void | Promise<void>;
  onDeleteFolder?: () => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [titleText, setTitleText] = useState(title);
  const [isRenameFolder, setIsRenameFolder] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSelected = id === selectedId && !isSyncButton;
  const iconStyle = `font-medium ${isSelected ? "text-brand" : isSyncButtonAllowed ? "text-zinc-500 group-hover:text-brand" : "text-zinc-500 group-hover:text-zinc-400"}`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isRenameFolder) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenameFolder]);

  const handleSelect = () => {
    if (isRenameFolder) return;

    setSelected(id);
    onClick?.();
  };

  const cancelRename = () => {
    setTitleText(title);
    setIsRenameFolder(false);
  };

  const confirmRename = async () => {
    const trimmedTitle = titleText.trim();

    if (!trimmedTitle) {
      cancelRename();
      return;
    }

    if (trimmedTitle !== title) {
      await onRenameFolder?.(trimmedTitle);
    }

    setTitleText(trimmedTitle);
    setIsRenameFolder(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`group relative flex items-center justify-between px-3 py-[8px] w-[248px] h-fit text-[14px] ${isSyncButton && !isSyncButtonAllowed ? "cursor-default" : "cursor-pointer"} border-l-3 ${isSelected ? "border-l-brand bg-zinc-800" : isSyncButtonAllowed ? "border-l-transparent hover:border-l-brand" : "border-l-transparent hover:border-l-zinc-700 hover:bg-zinc-900"}`}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelect();
        }
      }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className={iconStyle}>{icon}</span>
        {isFolder && isRenameFolder ? (
          <input
            ref={inputRef}
            type="text"
            value={titleText}
            className="min-w-0 flex-1 bg-zinc-900 border border-zinc-700 px-1 py-0.5 font-medium text-zinc-100 outline-none focus:border-brand"
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => setTitleText(event.target.value)}
            onBlur={confirmRename}
            onKeyDown={(event) => {
              event.stopPropagation();

              if (event.key === "Enter") {
                event.preventDefault();
                confirmRename();
              }

              if (event.key === "Escape") {
                event.preventDefault();
                cancelRename();
              }
            }}
          />
        ) : (
          <span
            className={`font-medium truncate ${isSelected ? "text-white" : isSyncButtonAllowed ? "text-zinc-500 group-hover:text-brand" : "text-zinc-500 group-hover:text-zinc-400"}`}
          >
            {isFolder && `/`}
            {titleText}
          </span>
        )}
      </div>

      {isFolder && !isRenameFolder && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label={`Opcoes de ${title}`}
            className={`flex items-center justify-center opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-300 transition-opacity cursor-pointer ${isMenuOpen ? "opacity-100 text-zinc-300" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
          >
            <EllipsisVertical strokeWidth={2.5} size={18} />
          </button>

          {isMenuOpen && (
            <div
              className="absolute right-0 top-6 z-50 w-36 border border-zinc-700 bg-zinc-900 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsRenameFolder(true);
                }}
              >
                <Pencil size={14} />
                Renomear
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-red-alert hover:bg-red-alert hover:text-white cursor-pointer"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDeleteFolder?.();
                }}
              >
                <Trash2 size={14} />
                Excluir
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
