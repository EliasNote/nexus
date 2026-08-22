import { cryptoService, useCloudStore } from "@/hooks/useCloudStore";
import { AUTO_SAVE_INTERVAL_OPTIONS } from "@/utils/constants";
import { Check, ChevronDown, Download, Save, Settings, Upload } from "lucide-react";
import { save, open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import { Button } from "../Credential/components/Header/components/Button";
import type { VaultSummarizedData } from "@/types/vault";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { isTauri } from "@tauri-apps/api/core";
import { useStorageSync } from "@/hooks/useStorageSync";
import { Input } from "../Credential/components/Input";
import { motion } from "framer-motion";

export const Config = () => {
  const { summaryVault, setSummaryVault, vault, setVault, setIsPendingSync } = useCloudStore.getState();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number>(
    AUTO_SAVE_INTERVAL_OPTIONS.findIndex((x) => x.value == summaryVault?.autoSaveInterval)
  );
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [errorContent, setErrorContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { upload } = useStorageSync();
  const [tempEncryptedVault, setTempEncryptedVault] = useState("");

  const toggleOption = (id: number) => setSelectedOptionId(id);
  const onSave = async () => {
    console.log("AUTO SAVE DO VAULT: ", vault?.autoSaveInterval)
    setIsSaving(true);
    console.log("AUTO SAVE INTERVALO: ", summaryVault?.autoSaveInterval)
    const selectedOption = AUTO_SAVE_INTERVAL_OPTIONS[selectedOptionId];
    const updatedSummaryVault: VaultSummarizedData = { ...summaryVault!, autoSaveInterval: selectedOption.value };
    setSummaryVault(updatedSummaryVault);
    setVault(await cryptoService.updateVaultFromSummary(vault!, updatedSummaryVault))
    console.log("INTERVALO DO VAULT: ", vault?.autoSaveInterval)
    console.log("AUTO SAVE INTERVALO: ", updatedSummaryVault.autoSaveInterval)
    setIsSaving(false);
    setIsPendingSync(true);
  };

  const handleInputFocus = () => {
    setErrorContent(null);
  };

  const handleConfirmar = async () => {
    if (!password) {
      setErrorContent("Digite a senha do cofre");
      return;
    }

    setIsLoading(true);
    try {
      const encryptedVault = JSON.parse(tempEncryptedVault);
      const decryptedVault = await cryptoService.decryptVault(encryptedVault, password);

      setVault(decryptedVault);
      setSummaryVault(await cryptoService.getInitialData(decryptedVault));
      await upload(encryptedVault);

      console.log("Vault importado com sucesso!");
      setIsLoading(false);
      setIsWrongPassword(false);
      setPassword("");
      setTempEncryptedVault("");
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      setIsWrongPassword(true);
      setErrorContent("Senha incorreta")
    }
  };

  const onExport = async () => {
    const encryptedData = await cryptoService.encryptVault(vault!);

    if (isTauri()) {
      const filePath = await save({
        filters: [{
          name: 'Nexus Vault',
          extensions: ['json']
        }],
        defaultPath: 'nexus-vault.json'
      });
      if (!filePath) return;

      await writeTextFile(filePath, JSON.stringify(encryptedData));
    } else {
      const blob = new Blob([JSON.stringify(encryptedData)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nexus-vault.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const onImport = async () => {
    setErrorContent(null);

    let content;
    if (isTauri()) {
      setIsLoading(true);
      const filePath = await open({
        multiple: false,
        directory: false,
        filters: [{
          name: 'Nexus Vault',
          extensions: ['json']
        }]
      });

      if (!filePath) {
        setIsLoading(false);
        return;
      }

      content = await readTextFile(filePath as string);
    } else {
      content = await new Promise<string>((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
          setIsLoading(true);
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) {
            setIsLoading(false);
            return;
          }

          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        };

        input.click();
      });
    }

    const encryptedVault = JSON.parse(content);

    try {
      const decryptedVault = await cryptoService.decryptVault(encryptedVault);

      setVault(decryptedVault);
      setSummaryVault(await cryptoService.getInitialData(decryptedVault));
      await upload(encryptedVault);

      console.log("Vault importado com sucesso!");
      setIsLoading(false)
    } catch (e) {
      console.error(e);
      setTempEncryptedVault(encryptedVault);
      setIsLoading(false);
      setIsWrongPassword(true);
      setErrorContent("Senha incorreta")
    }
  };

  return (
    <section className="flex flex-col items-center w-full p-7 text-white">
      <div className="flex items-center flex-col max-w-[700px] w-full gap-10">
        <div className="flex gap-1 items-center justify-center mb-[-20px]">
          <Settings size={32} className="text-brand" />
          <h2 className="text-[24px] font-bold">
            CONFIGURAÇÕES
          </h2>
        </div>
        <div className="flex flex-col gap-4 w-full items-center">
          <div className="w-full">
            <div className="relative flex flex-col w-full gap-2">
              <h3 className="font-bold border-l-4 border-brand pl-2">SALVAMENTO AUTOMÁTICO</h3>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between bg-zinc-900 border ${isOpen ? "border-zinc-600" : "border-zinc-800"} h-[45px] w-full px-3 cursor-pointer transition-colors`}
              >
                <span>{AUTO_SAVE_INTERVAL_OPTIONS[selectedOptionId]?.title}</span>
                <ChevronDown
                  size={18}
                  className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="absolute top-[70px] left-0 w-full bg-zinc-900 border border-zinc-700 z-50 shadow-2xl max-h-[200px] overflow-y-auto">
                  {AUTO_SAVE_INTERVAL_OPTIONS.map((option, index) => (
                    <div
                      key={option.value}
                      onClick={() => {
                        toggleOption(index)
                        setIsOpen(false);

                      }}
                      className="flex items-center justify-between px-4 py-2 hover:bg-zinc-800 cursor-pointer text-sm text-zinc-300 transition-colors"
                    >
                      <span>{option.title}</span>
                      {selectedOptionId === option.value && (
                        <Check size={16} className="text-brand" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {isSaving ?
            <Button
              iconsSize={18}
              icon={Save}
              disabled={true}
              color="border-brand text-brand hover:bg-brand w-fit"
              label={"SALVANDO..."}
            />
            :
            <Button
              iconsSize={18}
              icon={Save}
              onClick={onSave}
              color="border-brand text-brand hover:bg-brand w-fit"
              label={"SALVAR"}
            />
          }
        </div>
        <div className="w-full flex flex-col gap-2">
          <h3 className="font-bold border-l-4 border-brand pl-2">EXPORTAR/IMPORTAR</h3>
          <div className="flex gap-2">
            <button className="bg-zinc-900 border border-zinc-800 font-medium cursor-pointer py-4 flex-1 flex items-center justify-center gap-2 hover:border-zinc-700 hover:bg-zinc-800" onClick={onExport}><Download/> EXPORTAR</button>
            <button className="bg-zinc-900 border border-zinc-800 font-medium cursor-pointer py-4 flex-1 flex items-center justify-center gap-2 hover:border-zinc-700 hover:bg-zinc-800" onClick={onImport}><Upload/> IMPORTAR</button>
          </div>
          {(isWrongPassword || isLoading) &&
            <div className="absolute top-0 left-0 w-screen h-screen backdrop-blur-xs bg-black/80 flex items-center justify-center"
              onClick={() => setIsWrongPassword(false)}>
              {isLoading &&
                <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
                  <img src="/loading.webp" className="h-18 w-18 object-contain" alt="" />
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-zinc-300">Abrindo seu cofre...</motion.p>
                </div>
              }
              {isWrongPassword &&
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-col max-w-100 w-full items-center gap-2">
                    <Input
                      autoFocus={true}
                      handleInputFocus={handleInputFocus}
                      isPasswordIcon={true}
                      value={password}
                      onChange={(val) => {
                        setPassword(val);
                        if (errorContent) setErrorContent("Senha Incorreta");
                      }}
                      errorContent={errorContent}
                    />
                  <button
                    className="px-7 py-2.5 text-base bg-brand border font-bold border-[#5C8FFF] text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                    onClick={async () => {
                      await handleConfirmar();
                    }}
                  >
                    Confirmar
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </section>
  );
};
