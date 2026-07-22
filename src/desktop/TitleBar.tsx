import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";

export function TitleBar() {
  const appWindow = getCurrentWindow();
  return (
    <header
        data-tauri-drag-region
        className="relative z-50 flex h-9 shrink-0 select-none items-center justify-between border-b border-zinc-800 bg-dark-background"
      >
        <div
          data-tauri-drag-region
          onDoubleClick={() => appWindow.toggleMaximize()}
          className="flex h-full flex-1 items-center gap-2 px-3"
        >
        <img
          data-tauri-drag-region
          src="/logo.svg"
          className="h-5 w-5"
          alt=""
        />

        <span
          data-tauri-drag-region
          className="text-xs text-white font-bold"
        >
          Nexus
        </span>
      </div>

      <div className="flex h-full">
        <button
          onClick={() => appWindow.minimize()}
          className="flex w-12 items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white"
          aria-label="Minimizar"
        >
          <Minus size={16} />
        </button>

        <button
          onClick={() => appWindow.toggleMaximize()}
          className="flex w-12 items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white"
          aria-label="Maximizar"
        >
          <Square size={13} />
        </button>

        <button
          onClick={() => appWindow.close()}
          className="flex w-12 items-center justify-center text-zinc-400 hover:bg-red-600 hover:text-white"
          aria-label="Fechar"
        >
          <X size={17} />
        </button>
      </div>
    </header>
  );
}
