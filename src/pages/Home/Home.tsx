import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LetterGlitch from "./components/LetterGlitch";
import { FileUp } from "lucide-react";
import { Step } from "./components/Step";
import { IconButton } from "./components/IconButton";
import { useGoogleDrive } from "@/hooks/useGoogleDrive";

const TextsButtonsArchives = [
  {
    id: "select",
    title: "SELECIONAR ARQUIVO",
    subtitle: "Carregar cofre existente",
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
    id: "create",
    title: "CRIAR COFRE",
    subtitle: "Criar cofre de segurança menu",
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
    id: "previous",
    title: "SELECIONAR ARQUIVO ANTERIOR",
    subtitle: "Usar cofre da sessão anterior",
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
  const { uploadVault, token } = useGoogleDrive();
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");

  const [step0, setStep0] = useState(true);
  const [hideStep0, setHideStep0] = useState(false);

  const [step1, setStep1] = useState(false);
  const [hideStep1, setHideStep1] = useState(true);

  const [step2, setStep2] = useState(false);
  const [hideStep2, setHideStep2] = useState(true);

  const [invertido, setInvertido] = useState(false);

  const handleStep0 = () => {
    setHideStep1(false);
    setHideStep0(true);
  };

  const handleStep1 = () => {
    if (invertido) {
      setHideStep0(false);
      setHideStep1(true);
    } else {
      setHideStep2(false);
      setHideStep1(true);
    }
  };

  const handleStep2 = () => {
    if (invertido) {
      setHideStep1(false);
      setHideStep2(true);
    } else {
      setHideStep2(true);
    }
  };

  const handleConcluir = async () => {
    try {
      await uploadVault(JSON.stringify({ teste: "teste" }));
      navigate("/principal", { state: { texto: password } });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload do cofre");
    }
  };

  const handlePasswordChange = () => {
    setPassword(inputRef.current!.value);
  };

  const nextButtonStyle =
    "px-7 py-2.5 text-base bg-brand border font-bold border-[#5C8FFF] text-white shadow-lg cursor-pointer";

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
        <Step
          id={0}
          step0={step0}
          hideStep0={hideStep0}
          handleStep={handleStep0}
          x0={invertido ? -1200 : 0}
          x1={0}
          x2={-1200}
        >
          <div className="flex flex-col items-center justify-center gap-[20px]">
            <div className="flex flex-row items-center justify-center gap-[10px] text-[64px]">
              <img src="/logo.svg" alt="Logo" className="w-[124px]" />
              <h1 className="font-medium">Nexus</h1>
            </div>
            <div className="flex gap-3">
              <button
                className={nextButtonStyle}
                onClick={() => {
                  setInvertido(false);
                  setStep1(true);
                  setStep0(false);
                }}
              >
                Começar
              </button>
              <button className={prevButtonStyle}>Como usar</button>
            </div>
          </div>
        </Step>
        <Step
          id={1}
          step0={step1}
          hideStep0={hideStep1}
          handleStep={handleStep1}
          x0={invertido ? -1200 : 1200}
          x1={0}
          x2={invertido ? 1200 : -1200}
        >
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
                onClick={() => {
                  setInvertido(false);
                  setStep2(true);
                  setStep1(false);
                  handlePasswordChange();
                }}
              >
                Próximo
              </button>
              <button
                className={prevButtonStyle}
                onClick={() => {
                  setInvertido(true);
                  setStep0(true);
                  setStep1(false);
                }}
              >
                Anterior
              </button>
            </div>
          </div>
        </Step>
        <Step
          id={2}
          step0={step2}
          hideStep0={hideStep2}
          handleStep={handleStep2}
          x0={invertido ? -1200 : 1200}
          x1={0}
          x2={invertido ? 1200 : -1200}
        >
          <div className="flex flex-col items-center gap-[10px]">
            <div className="w-full max-w-[384px] flex flex-col gap-[10px] items-start">
              {TextsButtonsArchives.map((text, index) => {
                const verify = text.id === "google" && token != null;
                return (
                  <IconButton
                    id={text.id}
                    key={index}
                    icon={text.icon}
                    title={text.title}
                    subtitle={text.subtitle}
                    synced={verify}
                  />
                );
              })}
            </div>
            <div className="flex gap-3 items-start">
              <button
                className={nextButtonStyle}
                onClick={async () => await handleConcluir()}
              >
                Concluir
              </button>
              <button
                className={prevButtonStyle}
                onClick={() => {
                  setInvertido(true);
                  setStep1(true);
                  setStep2(false);
                }}
              >
                Anterior
              </button>
            </div>
          </div>
        </Step>
      </section>
    </div>
  );
};

export default Home;
