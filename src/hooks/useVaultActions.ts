import type {
  Credential,
  Folder,
  VaultSummarizedData,
} from "@/types/vault";
import { useCloudStore } from "./useCloudStore";
import { useStorageSync } from "./storage/useStorageSync";
import { updateSummaryVaultCredential } from "@/utils/utils";

export const useVaultActions = () => {
  const vault = useCloudStore((state) => state.vault);
  const summaryVault = useCloudStore(
    (state) => state.summaryVault,
  );

  const setSummaryVault = useCloudStore(
    (state) => state.setSummaryVault,
  );

  const setIsPendingSync = useCloudStore(
    (state) => state.setIsPendingSync,
  );

  const { upload } = useStorageSync();

  const saveVault = async () => {
    if (!vault) {
      return;
    }

    await upload(vault);
    setIsPendingSync(false);
  };

  const updateCredential = async (
    credential: Credential,
  ) => {
    if (!summaryVault) {
      return;
    }

    const updatedSummary =
      updateSummaryVaultCredential(
        summaryVault,
        credential,
      );

    setSummaryVault(updatedSummary);
    setIsPendingSync(true);
  };

  const createFolder = async (
    folder: Folder,
  ) => {
    if (!summaryVault) {
      return;
    }

    const updatedVault: VaultSummarizedData = {
      ...summaryVault,
      folders: [
        ...summaryVault.folders,
        folder,
      ],
    };

    setSummaryVault(updatedVault);
    setIsPendingSync(true);
  };

  return {
    saveVault,
    updateCredential,
    createFolder,
  };
};
