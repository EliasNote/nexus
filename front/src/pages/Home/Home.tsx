import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LetterGlitch from "./components/LetterGlitch";
import { FileUp } from "lucide-react";
import { Step } from "./components/Step";
import { IconButton } from "./components/IconButton";
import { useCloudSync } from "@/hooks/useCloudSync";
import { useCloudStore } from "@/hooks/useCloudStore";
import { dashboardRoute } from "@/App";
import { createInitialVault } from "@/utils/crypto";

const TextsButtonsArchives = [
  {
    id: "github",
    title: "GITHUB",
    subtitle: "Usar GitHub como cofre",
    icon: (
      <FileUp
        width={22}
        height={22}
        strokeWidth={1.5}
        className="text-zinc-400"
      />
    ),
  },
  {
    id: "google",
    title: "GOOGLE DRIVE",
    subtitle: "Usar cofre do Google Drive",
    icon: (
      <FileUp
        width={22}
        height={22}
        strokeWidth={1.5}
        className="text-zinc-400"
      />
    ),
  },
];

export const Home = () => {
  const { uploadVault, download, find } = useCloudSync();

  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const isTokenValid = useCloudStore((state) => state.isTokenValid);
  const setToken = useCloudStore((state) => state.setAccessToken);
  const setExpiresIn = useCloudStore((state) => state.setExpiresIn);
  const setVault = useCloudStore((state) => state.setVault);

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
      const data = await find();

      if (data && (data.id || data.sha)) {
        console.log("Vault existe");
      } else {
        console.log("Vault não existe, fazendo upload");
        // COLOCAR VAULT PADRÃO
        const vault = await createInitialVault(password);
        await uploadVault(JSON.stringify(vault));
      }

      navigate(dashboardRoute, { state: { texto: password } });
    } catch (error) {
      console.error("Erro: ", error);
    }
  };

  const handlePasswordChange = () => {
    setPassword(inputRef.current!.value);
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
        <button
          className="mb-100"
          onClick={() => setExpiresIn(Date.now() - 1000)}
        >
          Expirar ExpireIn
        </button>
        <button className="mb-100" onClick={() => setToken(null)}>
          Remover Token
        </button>
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
                {TextsButtonsArchives.map((text, index) => {
                  return (
                    <IconButton
                      id={text.id}
                      key={index}
                      icon={text.icon}
                      title={text.title}
                      subtitle={text.subtitle}
                    />
                  );
                })}
              </div>
              <div className="flex gap-3 items-start">
                <button
                  className={nextButtonStyle}
                  onClick={nextStep}
                  disabled={!isTokenValid}
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
                <input
                  className="bg-zinc-900 text-[16px] h-[40px] w-[384px] border border-zinc-800 px-2"
                  ref={inputRef}
                  type="password"
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
