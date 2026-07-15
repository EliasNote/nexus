import { isTauri } from "@tauri-apps/api/core";
import { Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardRoute } from "@/App";
import { useStorageSync } from "@/hooks/storage/useStorageSync";
import { cryptoService, useCloudStore } from "@/hooks/useCloudStore";

import { CLOUD_OPTIONS } from "@/types/constants";
import type { EncryptedVault } from "@/types/vault";
import { createInitialVault } from "@/utils/initialVault";
import { uint8ArrayToBase64 } from "@/utils/worker";
import { Input } from "../Dashboard/components/Credential/components/Input";
import LetterGlitch from "./components/LetterGlitch";
import { IconButton } from "./components/IconButton";
import { Step } from "./components/Step";
import { loadSettings } from "@/config/settingsStore";

export const Home = () => {
  const { upload, download, exists } = useStorageSync();
  const isDesktop = isTauri();

  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [tempVaultPath, setTempVaultPath] = useState<string | null>(null);

  const isTokenValid = useCloudStore((state) => state.isTokenValid);
  const setVault = useCloudStore((state) => state.setVault);
  const setSummaryVault = useCloudStore((state) => state.setSummaryVault);
  const setVaultPath = useCloudStore((state) => state.setVaultPath);

  useEffect(() => {
    const init = async () => {
      const savedPath = await loadSettings();
      setVaultPath(savedPath);
      setTempVaultPath(savedPath);
      setIsConfigLoaded(true);
    };
    init();
  }, [setVaultPath, setTempVaultPath]);

  const nextStep = () => {
    setDirection(1);
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => prev - 1);
  };

  const handleConcluir = async () => {
    try {
      const masterPassword = password;

      if (!masterPassword) {
        alert("Por favor, digite a senha mestra.");
        return;
      }

      const data = await exists();

      if (data) {
        console.log("Vault existe");
        const encryptedVault = await download();
        if (!encryptedVault) return;
        const salt = encryptedVault.kdf.salt;

        const unlocked = await cryptoService.verifyUnlockVaultKeys(
          masterPassword,
          salt,
          encryptedVault.encrypted_dek,
        );

        if (unlocked) {
          const summaryVault =
            await cryptoService.getInitialData(encryptedVault);

          console.log("Cofre: ", summaryVault);

          const interval = encryptedVault.autoSaveInterval ?? 1;
          useCloudStore.getState().setAutoSaveInterval(interval);

          setSummaryVault(summaryVault);
          setVault(encryptedVault);
        } else {
          throw new Error("Senha mestra incorreta.");
        }
      } else {
        console.log("Vault não existe, fazendo upload");

        const vault = await createInitialVault();
        const saltBytes = crypto.getRandomValues(new Uint8Array(16));
        const salt = uint8ArrayToBase64(saltBytes);

        const encryptedDek = await cryptoService.setupVaultKeys(password, salt);

        const encryptedContent = await cryptoService.encryptVault(
          vault.entries,
          vault.folders,
        );

        const cofreFinal: EncryptedVault = {
          version: "1.0",
          autoSaveInterval: 1,
          kdf: { salt, memory: 65536, iterations: 3, parallelism: 1 },
          encrypted_dek: encryptedDek,
          folders: encryptedContent.folders,
          entries: encryptedContent.entries,
        };

        await upload(cofreFinal);

        useCloudStore.getState().setAutoSaveInterval(1);
        setVault(cofreFinal);
        setSummaryVault(await cryptoService.getFolderAndEntryData(vault));
      }

      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setPassword("");

      navigate(dashboardRoute);
    } catch (error) {
      console.error("Erro: ", error);
      alert("Falha ao abrir cofre. Senha incorreta?");
    }
  };

  const nextButtonStyle =
    "px-7 py-2.5 text-base bg-brand border font-bold border-[#5C8FFF] text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const prevButtonStyle =
    "px-7 text-base py-2.5 bg-zinc-800 border font-bold border-zinc-600 text-white shadow-lg cursor-pointer";

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      <LetterGlitch
        glitchSpeed={25}
        centerVignette={true}
        outerVignette={false}
        smooth={false}
        classname="fixed inset-0 z-0 pointer-events-none"
      />
      <section className="relative z-10 flex min-h-screen items-center justify-center">
        {currentStep === 0 && (
          <Step key="step0" direction={direction}>
            <div className="flex flex-col items-center justify-center gap-[20px]">
              <div className="flex flex-row items-center justify-center gap-[10px] text-[64px]">
                <img src="/logo.svg" alt="Logo" className="w-[124px]" />
                <h1 className="font-medium">Nexus</h1>
              </div>
              <div className="flex gap-3">
                <button className={nextButtonStyle} onClick={nextStep}>
                  Começar
                </button>
                <button className={prevButtonStyle}>Como usar</button>
              </div>
            </div>
          </Step>
        )}

        {currentStep === 1 && (
          <Step key="step1" direction={direction}>
            <div className="flex flex-col items-center gap-[10px]">
              <div className="w-full max-w-[384px] flex flex-col gap-[10px] items-start">
                {CLOUD_OPTIONS.map((option) => {
                  const platform = isDesktop ? "desktop" : "web";

                  if (!option.type.includes(platform)) {
                    return null;
                  }

                  return (
                    <IconButton
                      id={option.id}
                      key={option.id}
                      icon={
                        <option.icon
                          width={22}
                          height={22}
                          strokeWidth={1.5}
                          className="text-zinc-400"
                        />
                      }
                      title={option.title}
                      subtitle={option.subtitle}
                    />
                  );
                })}
              </div>
              <div className="flex gap-3 items-start">
                <button
                  className={nextButtonStyle}
                  onClick={nextStep}
                  disabled={tempVaultPath !== null ? false : !isTokenValid}
                >
                  Próximo
                </button>
                <button className={prevButtonStyle} onClick={prevStep}>
                  Anterior
                </button>
              </div>
            </div>
          </Step>
        )}
        {currentStep === 2 && (
          <Step key="step2" direction={direction}>
            <div className="flex flex-col gap-2 items-center">
              <div className="w-full flex flex-col items-start">
                <p className="text-sm font-bold">SENHA MESTRA</p>
                <Input
                  isPassword={true}
                  value={password}
                  onChange={(val) => setPassword(val)}
                  iconsInput={[
                    {
                      id: "eye",
                      icon: Eye,
                    },
                  ]}
                />
              </div>
              <div className="flex gap-3">
                <button
                  className={nextButtonStyle}
                  onClick={async () => await handleConcluir()}
                >
                  Concluir
                </button>
                <button className={prevButtonStyle} onClick={prevStep}>
                  Anterior
                </button>
              </div>
            </div>
          </Step>
        )}
      </section>
    </div>
  );
};

export default Home;
