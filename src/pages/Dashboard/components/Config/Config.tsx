import { cryptoService, useCloudStore } from "@/hooks/useCloudStore";
import { AUTO_SAVE_INTERVAL_OPTIONS } from "@/utils/constants";
import { Check, ChevronDown, Download, Save, Settings, Trash2, Upload } from "lucide-react";
import { save, open } from "@tauri-apps/plugin-dialog";
import { useState, useRef } from "react";
import { Button } from "../Credential/components/Header/components/Button";
import type { EncryptedVault, VaultSummarizedData } from "@/types/vault";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { isTauri } from "@tauri-apps/api/core";
import { useStorageSync } from "@/hooks/useStorageSync";
import { Input } from "../Credential/components/Input";
import { motion } from "framer-motion";
import { BlueButton } from "@/pages/Home/components/BlueButton";
import { GrayButton } from "@/pages/Home/components/GrayButton";
import { Loading } from "@/components/Loading";
import { Step } from "./components/Step";

export const Config = () => {
  const { summaryVault, setSummaryVault, vault, setVault, setIsPendingSync, encryptedVault, setEncryptedVault } = useCloudStore.getState();
  const { remove, disconnect } = useStorageSync();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number>(
    AUTO_SAVE_INTERVAL_OPTIONS.findIndex((x) => x.value == summaryVault?.autoSaveInterval)
  );
  const [isImportPasswordOpen, setIsImportPasswordOpen] = useState(false);
  const [passwordImport, setPasswordImport] = useState("");
  const [passwordDelete, setPasswordDelete] = useState("");
  const [errorContent, setErrorContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { upload } = useStorageSync();
  const [tempEncryptedVault, setTempEncryptedVault] = useState<EncryptedVault | null>(null);
  const [importVaultStep, setImportVaultStep] = useState<boolean>(false);
  const [deleteVaultStep, setDeleteVaultStep] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMouseDownOnBackdrop = useRef(false);

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

  const handleConfirmar = async () => {
    if (!passwordImport) {
      setErrorContent("Digite a senha do cofre");
      return;
    }

    setErrorContent(null);
    setIsLoading(true);
    try {
      console.log("ENCRYPTED VAULT: ", tempEncryptedVault!);
      console.log("PASSWORD: ", passwordImport);

      const decryptedVault = await cryptoService.decryptVault(tempEncryptedVault!, passwordImport);

      setVault(decryptedVault);
      setSummaryVault(await cryptoService.getInitialData(decryptedVault));
      await upload(tempEncryptedVault!);
      setEncryptedVault(tempEncryptedVault!);

      console.log("Vault importado com sucesso!");
      setIsLoading(false);
      setIsModalOpen(false);
      setIsImportPasswordOpen(false);
      setPasswordImport("");
      setTempEncryptedVault(null);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      setIsModalOpen(true);
      setIsImportPasswordOpen(true);
      setErrorContent("Senha incorreta");
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

    try {
      const encryptedVault: EncryptedVault = JSON.parse(content);
      setTempEncryptedVault(encryptedVault);
      setPasswordImport("");
      setErrorContent(null);
      setIsImportPasswordOpen(true);
      setIsModalOpen(true);
    } catch (e) {
      console.error("Erro ao ler arquivo do cofre:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!passwordDelete) {
      setErrorContent("Digite a senha do cofre");
      return;
    }

    setIsLoading(true);
    setIsDelete(false);

    try {
      await cryptoService.decryptVault(encryptedVault!, passwordDelete);
      await remove();
      setVault(null);
      setSummaryVault(null);
      setEncryptedVault(null);
      disconnect();
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      setIsModalOpen(true);
      setIsDelete(true);
      setErrorContent("Senha incorreta");
    } finally {
      setIsLoading(false);
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
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="bg-zinc-900 border border-zinc-800 font-medium cursor-pointer py-5 flex-1 flex items-center justify-center gap-2 hover:border-zinc-700 hover:bg-zinc-800 active:bg-zinc-700 select-none"
              onClick={onExport}
            >
              <Download /> EXPORTAR
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              className="bg-zinc-900 border border-zinc-800 font-medium cursor-pointer py-5 flex-1 flex items-center justify-center gap-2 hover:border-zinc-700 hover:bg-zinc-800 active:bg-zinc-700 select-none"
              onClick={() => setImportVaultStep(true)}
            >
              <Upload /> IMPORTAR
            </motion.button>
          </div>
          {importVaultStep && (
            <Step
              setImportVaultStep={setImportVaultStep}
              title={"Substituir Cofre Atual?"}
              onClickGrayButton={() => setImportVaultStep(false)}
              onClickBlueButton={async () => {
                setImportVaultStep(false);
                await onImport();
              }}
            >
              Esta ação irá <strong className="text-red-500">sobrescrever todos os dados</strong> do seu cofre atual pelo arquivo importado. Deseja continuar?
            </Step>

          )}
        </div>
        <div className="flex flex-col w-full gap-2">
          <h3 className="font-bold border-l-4 border-red-alert pl-2">DELETAR COFRE</h3>
          <Button
            iconsSize={18}
            icon={Trash2}
            onClick={() => {
              setDeleteVaultStep(true);
            }}
            color="border-red-alert text-red-alert hover:bg-red-alert w-fit m-auto"
            label={"DELETAR"}
          />
          {deleteVaultStep && (
            <Step
              setImportVaultStep={setDeleteVaultStep}
              title="Deletar o cofre permanentemente?"
              onClickGrayButton={() => setDeleteVaultStep(false)}
              onClickBlueButton={() => {
                setDeleteVaultStep(false);
                setIsDelete(true);
                setIsModalOpen(true);
              }}
            >
              Esta ação irá <strong className="text-red-500">apagar permanentemente</strong> seu cofre. Deseja continuar?
            </Step>
          )}
        </div>
      </div>
      {isModalOpen && (
        <div className="absolute top-0 left-0 w-screen h-screen backdrop-blur-xs bg-black/75 flex items-center justify-center"
          onMouseDown={(e) => {
            isMouseDownOnBackdrop.current = e.target === e.currentTarget;
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && isMouseDownOnBackdrop.current) {
              setIsModalOpen(false);
              setIsImportPasswordOpen(false);
              setIsDelete(false);
              setPasswordImport("");
              setPasswordDelete("");
              setErrorContent(null);
              setTempEncryptedVault(null);
            }
            isMouseDownOnBackdrop.current = false;
          }}>
          {isLoading && (
            <Loading text="Abrindo o cofre importado..." />
          )}
          {!isLoading && isImportPasswordOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col max-w-90 w-full items-center gap-2">
              <p className="font-medium whitespace-nowrap">Digite a senha de acesso do cofre importado</p>
              <Input
                autoFocus={true}
                isPasswordIcon={true}
                value={passwordImport}
                onChange={(val) => {
                  setPasswordImport(val);
                  if (errorContent) setErrorContent(null);
                }}
                errorContent={errorContent}
              />
              <div className="flex w-full gap-2">
                <GrayButton
                  text="Voltar"
                  className="flex-1 py-2.5"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsImportPasswordOpen(false);
                    setIsLoading(false);
                    setPasswordImport("");
                    setErrorContent(null);
                    setTempEncryptedVault(null);
                  }}
                />
                <BlueButton
                  className="flex-1"
                  text="Concluir"
                  onClick={async () => {
                    await handleConfirmar();
                  }}
                />
              </div>
            </div>
          )}
          {!isLoading && isDelete && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col max-w-90 w-full items-center gap-2">
              <p className="font-medium whitespace-nowrap">Digite a senha do seu cofre para confirmar a exclusão</p>
              <Input
                autoFocus={true}
                isPasswordIcon={true}
                value={passwordDelete}
                onChange={(val) => {
                  setPasswordDelete(val);
                  if (errorContent) setErrorContent(null);
                }}
                errorContent={errorContent}
              />
              <div className="flex w-full gap-2">
                <GrayButton
                  text="Voltar"
                  className="flex-1 py-2.5"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsDelete(false);
                    setPasswordDelete("");
                    setErrorContent(null);
                  }}
                />
                <BlueButton
                  className="flex-1 bg-red-alert hover:bg-red-alert/90 active:bg-red-alert/95 border-none"
                  text="DELETAR"
                  onClick={async () => {
                    await handleDelete();
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
