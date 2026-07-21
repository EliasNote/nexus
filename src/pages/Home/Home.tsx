import { isTauri } from "@tauri-apps/api/core";
import { Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardRoute, manualRoute } from "@/App";
import { useStorageSync } from "@/hooks/storage/useStorageSync";
import { cryptoService, useCloudStore } from "@/hooks/useCloudStore";
import { motion } from "framer-motion";

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
  const [isLoading, setIsLoading] = useState(false);
  const [errorContent, setErrorContent] = useState<string | null>(null);

  const isTokenValid = useCloudStore((state) => state.isTokenValid);
  const activeProvider = useCloudStore((state) => state.activeProvider);
  const vaultPath = useCloudStore((state) => state.vaultPath);
  const setVault = useCloudStore((state) => state.setVault);
  const setSummaryVault = useCloudStore((state) => state.setSummaryVault);
  const setVaultPath = useCloudStore((state) => state.setVaultPath);
  const setActiveProvider = useCloudStore((state) => state.setActiveProvider);

  useEffect(() => {
    const init = async () => {
      const settings = await loadSettings();

      if (settings) {
        setVaultPath(settings.vaultPath);
        setActiveProvider(settings.provider);
      }
      setIsConfigLoaded(true);
      console.log("isConfigLoaded", isConfigLoaded);
    };
    if (isDesktop) init();
  }, [setActiveProvider, setVaultPath]);

  const nextStep = () => {
    setDirection(1);
    setCurrentStep((prev) => prev + 1);
  };

  useEffect(() => {
    const image = new Image();
    image.src = "/loading.webp";
    image.decode().catch(() => {});
  }, []);

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => prev - 1);
  };

  const handleConcluir = async () => {
    try {
      const masterPassword = password;

      if (!masterPassword) {
        setErrorContent("Digite sua senha mestra para continuar.");
        return;
      }

      const data = await exists();

      if (data) {
        console.log("Vault existe");
        const encryptedVault = await download();
        if (!encryptedVault) return;
        const salt = encryptedVault.kdf.salt;

        let unlocked = false;
        try {
          unlocked = await cryptoService.verifyUnlockVaultKeys(
            masterPassword,
            salt,
            encryptedVault.encrypted_dek,
          );
        } catch (error) {
          setErrorContent("Senha mestra incorreta. Tente novamente.");
          console.error("Erro: ", error);
          return;
        }

        if (unlocked) {
          setErrorContent(null);
          const summaryVault =
            await cryptoService.getInitialData(encryptedVault);

          console.log("Cofre: ", summaryVault);

          const interval = encryptedVault.autoSaveInterval ?? 1;
          useCloudStore.getState().setAutoSaveInterval(interval);

          setSummaryVault(summaryVault);
          setVault(encryptedVault);
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

      setIsLoading(false);
      navigate(dashboardRoute);
    } catch (error) {
      console.error("Erro: ", error);
      setIsLoading(false);
    }
  };

  const nextButtonStyle =
    "px-7 py-2.5 text-base bg-brand border font-bold border-[#5C8FFF] text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const prevButtonStyle =
    "px-7 text-base py-2.5 bg-zinc-800 border font-bold border-zinc-600 text-white shadow-lg cursor-pointer";

  const canContinue =
    (isConfigLoaded && activeProvider === "local" && vaultPath !== null) ||
    (isConfigLoaded && activeProvider === "git" && vaultPath !== null) ||
    (activeProvider === "google" && isTokenValid);

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
                <button className={prevButtonStyle} onClick={() => navigate(manualRoute)}>Manual</button>
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
                  disabled={!canContinue}
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
        {currentStep === 2 && !isLoading && (
          <Step key="step2" direction={direction}>
            <div className="flex w-[min(384px,calc(100vw-32px))] flex-col items-center gap-4">
              <div className="flex w-full flex-col items-start">
                <p className="mb-1.5 text-sm font-bold">SENHA MESTRA</p>
                <Input
                  isPassword={true}
                  value={password}
                  onChange={(val) => {
                    setPassword(val);
                    if (errorContent) setErrorContent(null);
                  }}
                  errorContent={errorContent}
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
                  onClick={async () => {
                    setIsLoading(true);
                    await handleConcluir();
                    setIsLoading(false);
                  }}
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
        {currentStep === 2 && isLoading && (
          <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
            <img src="/loading.webp" className="h-18 w-18 object-contain" alt="" />
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-zinc-300">Abrindo seu cofre...</motion.p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
