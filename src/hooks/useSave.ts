import { useEffect, useRef } from "react";
import { useStorageSync } from "./useStorageSync";
import { cryptoService, useCloudStore } from "./useCloudStore";

export const useAutoSave = () => {
  const autoSaveInterval = useCloudStore(
    (state) => state.autoSaveInterval,
  );

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

  useEffect(() => {
    const intervalMs = autoSaveInterval;

    const timer = window.setInterval(async () => {
      const state = useCloudStore.getState();
      const currentVault = state.vault;

      if (!state.isPendingSync || !currentVault) {
        return;
      }

      try {
        setIsSaving(true);

        const envelope = await cryptoService.sealVault(currentVault);
        await uploadRef.current(envelope);

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
    autoSaveInterval,
    setIsPendingSync,
    setIsSaving,
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

      const envelope = await cryptoService.sealVault(currentVault);
      await uploadRef.current(envelope);

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
