import type { EntrySummary } from "@/types/vault";
import Credential from "./Credential";
import { useState, useMemo } from "react";

const SidebarCredentials = ({
  selectedSideCredential,
  setSelectedSideCredential,
  credentials,
}: {
  selectedSideCredential: string | null;
  setSelectedSideCredential: (id: string | null) => void;
  credentials: EntrySummary[] | undefined;
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
    <section className="flex flex-col items-start border-r border-zinc-800 h-screen max-w-[320px] w-full">
      <div className="flex flex-col w-full p-[14px] gap-[14px]">
        <span className="border-l-brand border-l-4 text-white pl-3 text-[18px] font-bold">
          TODOS OS ITENS
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-zinc-900 text-white px-2 py-2 outline-none border border-zinc-700 focus:border-brand text-sm w-full"
          placeholder="Procurar título ou usuário..."
        />
      </div>
      <hr className="w-full text-zinc-800" />
      <div className="w-full h-full overflow-y-auto overflow-x-hidden">
        {credentials && filteredCredentials!.length > 0 ? (
          filteredCredentials!.map((credential) => (
            <Credential
              key={credential.id}
              selected={selectedSideCredential === credential.id}
              setSelectedSideCredential={setSelectedSideCredential}
              credential={credential}
            />
          ))
        ) : (
          <div className="p-4 text-zinc-500 text-center text-sm">
            Nenhum resultado encontrado.
          </div>
        )}
      </div>
    </section>
  );
};

export default SidebarCredentials;
