import { Copy } from "lucide-react";

export const Login = () => {
  return (
    <section className="flex flex-1 h-full flex-col gap-4 w-full items-center justify-center">
      <div className="group flex items-center focus-within:border-zinc-600 bg-zinc-900 border border-zinc-800 h-[45px] w-full max-w-[760px]">
        <input
          className="flex-1 bg-transparent px-3 text-white outline-none placeholder:text-zinc-500"
          type="text"
          placeholder="Usuário/email"
        />
        <button className="flex items-center justify-center border-l border-zinc-800 group-focus-within:border-zinc-600 h-full w-12 hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-600 hover:text-brand">
          <Copy strokeWidth={2.5} size={22} />
        </button>
      </div>
    </section>
  );
};
