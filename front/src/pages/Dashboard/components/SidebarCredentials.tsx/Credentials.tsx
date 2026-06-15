import type { VaultEntry } from "@/types/vault";
import { copyToClipboard } from "@/utils/utils";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

const Credentials = ({
  selected,
  setSelectedSideCredential,
  credential,
}: {
  selected: boolean;
  setSelectedSideCredential: (id: string | null) => void;
  credential: VaultEntry;
}) => {
  const [copied, setCopied] = useState(false);

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

  const handleCopy = (value: string) => {
    copyToClipboard(value);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <div
      key={credential.id}
      className={`group flex gap-[14px] bg-transparent p-[14px] w-full max-h-[63px] border-b border-b-zinc-800 cursor-pointer hover:bg-[#111113] ${selected ? "bg-zinc-900" : ""}`}
      onClick={() => setSelectedSideCredential(credential.id)}
    >
      <div className="min-w-[35px] min-h-[35px] flex items-center justify-center text-[20px] bg-zinc-900 border border-zinc-800 text-zinc-300">
        {credential.title[0].toUpperCase()}
      </div>
      <div className="flex w-full flex-col justify-center items-start">
        <span className="text-white text-[14px]">{credential.title}</span>
        <span className="text-zinc-400 text-[12px]">{getSubtitle()}</span>
      </div>
      <button
        className="flex text-transparent group-hover:text-zinc-500 justify-end items-center cursor-pointer hover:text-brand"
        onClick={(e) => {
          e.stopPropagation();
          handleCopy(
            credential.type === "login" ? (credential.password ?? "") : "",
          );
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

export default Credentials;
