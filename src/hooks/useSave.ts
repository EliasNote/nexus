import { useEffect, useRef } from "react";
import { useStorageSync } from "./useStorageSync";
import { cryptoService, useCloudStore } from "./useCloudStore";
import { AUTO_SAVE_INTERVAL_OPTIONS } from "@/utils/constants";

export const useAutoSave = () => {
  const { setIsPendingSync, setIsSaving, summaryVault } = useCloudStore();

  const { upload } = useStorageSync();
  const uploadRef = useRef(upload);

  useEffect(() => {
    uploadRef.current = upload;
  }, [upload]);

  useEffect(() => {
    const autoSaveInterval = summaryVault?.autoSaveInterval;
    const minInterval = AUTO_SAVE_INTERVAL_OPTIONS[0].value;
    const intervalMs = autoSaveInterval ? autoSaveInterval < minInterval ? minInterval : autoSaveInterval : minInterval;

    const timer = window.setInterval(async () => {
      const state = useCloudStore.getState();
      const currentVault = state.vault;

      if (!state.isPendingSync || !currentVault) return;

      try {
        setIsSaving(true);

        const vault = await cryptoService.encryptVault(currentVault);
        await uploadRef.current(vault);

        setIsPendingSync(false);
      } catch (error) {
        console.error(
          "Falha ao salvar automaticamente:",
          error,
        );
      } finally {
        setIsSaving(false);
      }
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    setIsPendingSync,
    setIsSaving,
    summaryVault
  ]);
};

export const useSaveNow = () => {
  const setIsPendingSync = useCloudStore(
    (state) => state.setIsPendingSync,
  );

  const setIsSaving = useCloudStore(
    (state) => state.setIsSaving,
  );

  const { upload } = useStorageSync();
  const uploadRef = useRef(upload);

  useEffect(() => {
    uploadRef.current = upload;
  }, [upload]);

  return async () => {
    const state = useCloudStore.getState();
    const currentVault = state.vault;

    if (!state.isPendingSync || !currentVault) {
      return;
    }

    try {
      setIsSaving(true);

      const vault = await cryptoService.encryptVault(currentVault);
      await uploadRef.current(vault);

      setIsPendingSync(false);
    } catch (error) {
      console.error(
        "Falha ao salvar o cofre:",
        error,
      );

      throw error;
    } finally {
      setIsSaving(false);
    }
  };
};
