import Credential from "./Credential";
import { useState } from "react";

const SidebarCredentials = () => {
  const credentials = [
    { id: 1, name: "Github", user: "EliasNote" },
    { id: 2, name: "Youtube", user: "Nome" },
  ];
  const [selectedCredential, setSelectedCredential] = useState<number | null>(
    null,
  );

  return (
    <section className="flex flex-col items-start border-r border-zinc-800 h-screen max-w-[280px] w-full">
      <div className="flex flex-col w-full p-[14px] gap-[14px]">
        <span className="border-l-brand border-l-4 text-white pl-3 text-[16px] font-bold">
          TODOS OS ITENS
        </span>
        <input
          type="text"
          className="bg-zinc-900 text-white px-2 py-2 outline-none border border-zinc-700 focus:border-brand text-sm w-full"
          placeholder="Procurar..."
        />
      </div>
      <hr className="w-full text-zinc-800" />
      <div className="w-full h-full">
        {credentials.map((credential) => (
          <Credential
            selected={selectedCredential === credential.id}
            setSelectedCredential={setSelectedCredential}
            credential={credential}
          />
        ))}
      </div>
    </section>
  );
};

export default SidebarCredentials;
