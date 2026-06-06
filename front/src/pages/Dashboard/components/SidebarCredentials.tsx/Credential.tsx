import type { VaultEntry } from "@/types/vault";

type CredentialProps = {
  selected: boolean;
  setSelectedCredential: (id: string | null) => void;
  credential: VaultEntry;
};

const Credential = ({
  selected,
  setSelectedCredential,
  credential,
}: CredentialProps) => {
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

  return (
    <button
      key={credential.id}
      className={`flex gap-[14px] bg-transparent p-[14px] w-full max-h-[63px] border-b border-b-zinc-800 cursor-pointer hover:bg-[#111113] ${selected ? "bg-zinc-900" : ""}`}
      onClick={() => setSelectedCredential(credential.id)}
    >
      <div className="w-[35px] h-[35px] flex items-center justify-center text-[20px] bg-zinc-900 border border-zinc-800 text-zinc-300">
        {credential.title[0].toUpperCase()}
      </div>
      <div className="flex flex-col justify-center items-start">
        <span className="text-white text-[14px]">{credential.title}</span>
        <span className="text-zinc-400 text-[12px]">{getSubtitle()}</span>
      </div>
    </button>
  );
};

export default Credential;
