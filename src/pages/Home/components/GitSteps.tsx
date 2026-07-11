import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import {
  AlertCircle,
  Check,
  FolderOpen,
  Loader2,
  X,
} from "lucide-react";
import {
  checkGitExists,
  checkGitRepo,
} from "@/hooks/storage/adapters/git-repository/gitSync";
import { useGitRepository } from "@/hooks/storage/adapters/git-repository/useGitRepository";
import { formatGitHubRemoteUrl } from "@/utils/utils";

type GitStepsProps = {
  onClose?: () => void;
  onDirectorySelected?: (directory: string) => void;
};

type Step =
  | "select"
  | "github"
  | "loading"
  | "success"
  | "error";

export const GitSteps = ({
  onClose,
  onDirectorySelected,
}: GitStepsProps) => {
  const [step, setStep] = useState<Step>("select");
  const [directory, setDirectory] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [error, setError] = useState("");

  const gitRepository = useGitRepository(
    directory || null,
  );

  const selectDirectory = async () => {
    setError("");

    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (!selected || Array.isArray(selected)) {
        return;
      }

      if (!(await checkGitExists())) {
        throw new Error(
          "O Git não foi encontrado no seu computador.",
        );
      }

      setDirectory(selected);
      onDirectorySelected?.(selected);

      const repository = await checkGitRepo(selected);

      setStep(
        repository.isGitRepo
          ? "success"
          : "github",
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível selecionar a pasta.",
      );

      setStep("error");
    }
  };

  const connectRepository = async () => {
    if (!remoteUrl.trim()) {
      setError(
        "Informe o link do repositório do GitHub.",
      );

      return;
    }

    setStep("loading");
    setError("");

    try {
      const formattedRemoteUrl =
        formatGitHubRemoteUrl(remoteUrl);

      await gitRepository.initialize(
        formattedRemoteUrl,
      );

      setStep("success");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível configurar o repositório.",
      );

      setStep("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Sincronização com GitHub
          </h2>

          {step !== "loading" && (
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="text-zinc-500 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {step === "select" && (
          <div className="space-y-5">
            <p className="text-sm text-zinc-400">
              Selecione a pasta do repositório no seu
              computador.
            </p>

            <button
              onClick={selectDirectory}
              className="flex w-full cursor-pointer items-center justify-center gap-2 border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm hover:border-zinc-500"
            >
              <FolderOpen size={18} />
              Selecionar pasta
            </button>
          </div>
        )}

        {step === "github" && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">
              Essa pasta ainda não é um repositório Git.
              Crie um repositório no GitHub e cole o link
              abaixo.
            </p>

            <input
              value={remoteUrl}
              onChange={(event) =>
                setRemoteUrl(event.target.value)
              }
              placeholder="https://github.com/usuario/repositorio.git"
              className="w-full border border-zinc-700 bg-zinc-900 px-3 py-3 text-sm outline-none focus:border-zinc-500"
            />

            <button
              onClick={connectRepository}
              disabled={gitRepository.isLoading}
              className="w-full cursor-pointer bg-white px-4 py-3 text-sm font-bold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Configurar repositório
            </button>
          </div>
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center gap-3 py-8 text-sm text-zinc-300">
            <Loader2 className="animate-spin" />
            Configurando e sincronizando o
            repositório...
          </div>
        )}

        {step === "success" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-400">
              <Check size={20} />
              Repositório conectado.
            </div>

            <p className="break-all text-xs text-zinc-500">
              {directory}
            </p>

            <button
              onClick={onClose}
              className="w-full cursor-pointer bg-white px-4 py-3 text-sm font-bold text-black"
            >
              Continuar
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 text-red-400">
              <AlertCircle
                size={20}
                className="shrink-0"
              />

              <span>{error}</span>
            </div>

            <button
              onClick={() =>
                setStep(directory ? "github" : "select")
              }
              className="w-full cursor-pointer border border-zinc-700 px-4 py-3 text-sm hover:border-zinc-500"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
