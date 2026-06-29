import { useEffect, useRef } from "react";
import { useCloudStore } from "./useCloudStore";
import { useCloudSync } from "./useCloudSync";

export const useAutoSave = () => {
  const setIsPendingSync = useCloudStore((s) => s.setIsPendingSync);
  const autoSaveInterval = useCloudStore((s) => s.autoSaveInterval);
  const setIsSaving = useCloudStore((s) => s.setIsSaving);

  const { uploadVault } = useCloudSync();

  const uploadRef = useRef(uploadVault);

  useEffect(() => {
    uploadRef.current = uploadVault;
  }, [uploadVault]);

  useEffect(() => {
    const intervalMs = autoSaveInterval * 60 * 1000;

    const timer = setInterval(async () => {
      const currentIsPendingSync = useCloudStore.getState().isPendingSync;
      const currentVault = useCloudStore.getState().vault;

      if (currentIsPendingSync && currentVault) {
        try {
          setIsSaving(true);
          console.log("Auto-save: Sincronizando modificações com a nuvem...");
          await uploadRef.current(currentVault);
          setIsPendingSync(false);
          console.log("Auto-save: Cofre salvo.");
          setIsSaving(false);
        } catch (error) {
          console.error("Auto-save: Falha ao salvar em background:", error);
        }
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoSaveInterval, setIsPendingSync, setIsSaving]);
};

export const useSaveNow = () => {
  const setIsPendingSync = useCloudStore((s) => s.setIsPendingSync);
  const setIsSaving = useCloudStore((s) => s.setIsSaving);
  const { uploadVault } = useCloudSync();

  return async () => {
    const currentIsPendingSync = useCloudStore.getState().isPendingSync;
    const currentVault = useCloudStore.getState().vault;

    if (currentIsPendingSync && currentVault) {
      try {
        setIsSaving(true);
        console.log("Save Manual: Sincronizando modificações com a nuvem...");
        await uploadVault(currentVault);
        setIsPendingSync(false);
        console.log("Save Manual: Cofre salvo.");
        setIsSaving(false);
      } catch (error) {
        console.error("Save Manual: Falha ao salvar em background:", error);
      }
    }
  };
};
