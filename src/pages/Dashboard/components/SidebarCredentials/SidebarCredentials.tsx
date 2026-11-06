import type { CredentialSummary } from "@/utils/vault";
import SideCredential from "./SideCredential";
import { useState, useMemo } from "react";

const SidebarCredentials = ({
  selectedSideCredential,
  setSelectedSideCredential,
  credentials,
  topTitle,
}: {
  selectedSideCredential: string | null;
  setSelectedSideCredential: (id: string | null) => void;
  credentials: CredentialSummary[] | undefined;
  topTitle: string;
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCredentials = useMemo(() => {
    if (!searchTerm.trim()) return credentials;

    const lowerTerm = searchTerm.toLowerCase();

    return credentials?.filter((c) => {
      return (
        c.title.toLowerCase().includes(lowerTerm) ||
        c.username?.toLowerCase().includes(lowerTerm)
      );
    });
  }, [searchTerm, credentials]);
  return (
    <section className="nexus-credentials-panel bg-list-panel flex flex-col items-start border-r border-line h-full max-w-[320px] w-full">
      <div className="flex flex-col w-full p-[14px] gap-[14px]">
        <span className="border-l-brand border-l-4 text-primary pl-3 text-[18px] font-bold truncate">
          {topTitle}
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-surface text-primary px-2 py-2 outline-none border border-line-strong focus:border-brand [[data-theme=light]_&]:focus:border-line-focus text-sm w-full"
          placeholder="Procurar título ou usuário..."
        />
      </div>
      <hr className="w-full text-line" />
      <div className="w-full h-full overflow-y-auto overflow-x-hidden">
        {credentials && filteredCredentials!.length > 0 ? (
          filteredCredentials!.map((credential) => (
            <SideCredential
              key={credential.id}
              selected={selectedSideCredential === credential.id}
              setSelectedSideCredential={setSelectedSideCredential}
              credential={credential}
            />
          ))
        ) : (
          <div className="p-4 text-muted text-center text-sm">
            Nenhum resultado encontrado.
          </div>
        )}
      </div>
    </section>
  );
};

export default SidebarCredentials;
