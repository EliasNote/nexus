type CredentialProps = {
  selected: boolean;
  setSelectedCredential: (id: number | null) => void;
  credential: {
    id: number;
    name: string;
    user: string;
  };
};

const Credential = ({
  selected,
  setSelectedCredential,
  credential,
}: CredentialProps) => {
  return (
    <button
      key={credential.id}
      className={`flex gap-[14px] bg-transparent p-[14px] w-full max-h-[63px] border-b border-b-zinc-800 cursor-pointer hover:bg-[#111113] ${selected ? "bg-zinc-900" : ""}`}
      onClick={() => setSelectedCredential(credential.id)}
    >
      <div className="w-[35px] h-[35px] flex items-center justify-center text-[20px] bg-zinc-900 border border-zinc-800 text-zinc-300">
        {credential.name[0].toUpperCase()}
      </div>
      <div className="flex flex-col justify-center items-start">
        <span className="text-white text-[14px]">{credential.name}</span>
        <span className="text-zinc-400 text-[12px]">{credential.user}</span>
      </div>
    </button>
  );
};

export default Credential;
