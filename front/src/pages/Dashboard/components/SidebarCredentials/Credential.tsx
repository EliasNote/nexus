import { useCloudStore } from "@/hooks/useCloudStore";
import type { EntrySummary } from "@/types/vault";
import { copyToClipboard } from "@/utils/utils";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

const Credential = ({
  selected,
  setSelectedSideCredential,
  credential,
}: {
  selected: boolean;
  setSelectedSideCredential: (id: string | null) => void;
  credential: EntrySummary;
}) => {
  const [copied, setCopied] = useState(false);
  const cryptoService = useCloudStore.getState().cryptoService;
  const vault = useCloudStore.getState().vault;

  const getSubtitle = () => {
    switch (credential.type) {
      case "login":
        return credential.username || "Sem usuário";
      case "card":
        return credential.holderName;
      case "note":
        return credential.name;
      default:
        return "";
    }
  };

  const handleCopy = () => {
    switch (credential.type) {
      case "login":
        cryptoService
          .getPassword(vault!, credential.id)
          .then((password) => {
            copyToClipboard(password || "");
          })
          .finally(() => {
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 1000);
          });
        break;
      case "card":
      case "note":
    }
  };

  return (
    <div
      key={credential.id}
      className={`group flex items-center gap-[14px] bg-transparent p-[14px] w-full max-h-[63px] border-b border-b-zinc-800 cursor-pointer hover:bg-[#111113] ${selected ? "bg-zinc-900" : ""}`}
      onClick={() => {
        setSelectedSideCredential(selected ? null : credential.id);
      }}
    >
      <div className="flex-shrink-0 min-w-[35px] min-h-[35px] flex items-center justify-center text-[20px] bg-zinc-900 border border-zinc-800 text-zinc-300">
        {credential.title ? credential.title[0].toUpperCase() : "?"}
      </div>

      <div className="flex flex-col justify-center items-start flex-1 min-w-0">
        <span className="text-white text-[14px] w-[90%] truncate">
          {credential.title}
        </span>
        <span className="text-zinc-400 text-[12px] w-[90%] truncate">
          {getSubtitle()}
        </span>
      </div>

      <button
        className="flex-shrink-0 flex text-transparent group-hover:text-zinc-500 justify-end items-center cursor-pointer hover:text-brand"
        onClick={(e) => {
          e.stopPropagation();
          handleCopy();
        }}
      >
        {copied ? (
          <Check className="text-green-500" size={20} strokeWidth={2.5} />
        ) : (
          <Copy size={18} strokeWidth={2} />
        )}
      </button>
    </div>
  );
};

export default Credential;
