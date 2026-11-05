import { getCryptoService, useCloudStore } from "@/hooks/useCloudStore";
import type { CredentialSummary } from "@/utils/vault";
import { copyToClipboard } from "@/utils/utils";
import { Copy, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const Credential = ({
  selected,
  setSelectedSideCredential,
  credential,
}: {
  selected: boolean;
  setSelectedSideCredential: (id: string | null) => void;
  credential: CredentialSummary;
}) => {
  const [copied, setCopied] = useState(false);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (copyTimeout.current !== null) clearTimeout(copyTimeout.current);
  }, []);

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

  const handleCopy = async () => {
    const vault = useCloudStore.getState().vault;
    if (credential.type !== "login" || !vault) return;

    try {
      const password = await getCryptoService().getPassword(vault, credential.id);
      await copyToClipboard(password || "");
      if (copyTimeout.current !== null) clearTimeout(copyTimeout.current);
      setCopied(true);
      copyTimeout.current = setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Falha ao copiar senha:", error);
    }
  };

  return (
    <div
      key={credential.id}
      className={`group flex items-center gap-[14px] p-[14px] w-full max-h-[63px] border-b border-b-line cursor-pointer ${selected ? "credential-selected bg-selected hover:bg-selected" : "bg-transparent hover:bg-surface-hover"}`}
      onClick={() => {
        setSelectedSideCredential(selected ? null : credential.id);
      }}
    >
      <div className="flex-shrink-0 min-w-[35px] min-h-[35px] flex items-center justify-center text-[20px] bg-surface border border-line text-secondary">
        {credential.title ? credential.title[0].toUpperCase() : "?"}
      </div>

      <div className="flex flex-col justify-center items-start flex-1 min-w-0">
        <span className="text-primary text-[14px] w-[90%] truncate">
          {credential.title}
        </span>
        <span className="text-muted text-[12px] w-[90%] truncate">
          {getSubtitle()}
        </span>
      </div>

      <button
        type="button"
        aria-label={copied ? "Senha copiada" : "Copiar senha"}
        className={`flex-shrink-0 flex text-transparent group-hover:text-muted justify-end items-center cursor-pointer ${selected ? "hover:text-primary" : "hover:text-brand"}`}
        onClick={(e) => {
          e.stopPropagation();
          handleCopy();
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={copied ? "copied" : "copy"}
            className={`flex items-center justify-center ${copied ? "text-success" : ""}`}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
          >
            {copied ? <Check size={20} strokeWidth={2.5} /> : <Copy size={18} strokeWidth={2} />}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
};

export default Credential;
