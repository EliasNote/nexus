import type {
  Credential,
  Folder,
  VaultSummarizedData,
} from "@/types/vault";
import { cryptoService, useCloudStore } from "./useCloudStore";
import { useStorageSync } from "./storage/useStorageSync";
import { updateSummaryVaultCredential } from "@/utils/utils";

export const useVaultActions = () => {
  const vault = useCloudStore((state) => state.vault);
  const setVault = useCloudStore((state) => state.setVault);
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

    await upload(await cryptoService.sealVault(vault));
    setIsPendingSync(false);
  };

  const saveCredential = async (
    credentialData: Credential,
    isTrashed?: boolean,
    isRestore?: boolean,
    setIsLoading?: (isLoading: boolean) => void,
  ) => {
    if (!vault || !summaryVault) return;

    try {
      setIsLoading?.(true);
      const credentialToSave: Credential = {
        ...credentialData,
        isDeleted: isTrashed ?? isRestore ?? false,
      };

      const newVault =
        await cryptoService.updateVaultFromCredentialAndTrackPasswordChange(
          vault,
          credentialToSave,
        );

      setIsPendingSync(true);

      const updatedSummary = updateSummaryVaultCredential(
        summaryVault,
        credentialToSave,
      );

      setVault(newVault);
      setSummaryVault(updatedSummary);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading?.(false);
    }
  };

  const deleteCredential = async (credentialId: string) => {
    if (!vault || !summaryVault) return;

    const updatedSummaryVault: VaultSummarizedData = {
      ...summaryVault,
      entries: summaryVault.entries.filter((e) => e.id !== credentialId),
    };

    const newVault = await cryptoService.updateVaultFromSummary(
      vault,
      updatedSummaryVault,
    );

    setIsPendingSync(true);
    setVault(newVault);
    setSummaryVault(updatedSummaryVault);
  };

  const createFolder = async (folderName: string) => {
    if (!vault || !summaryVault) return;

    const trimmedName = folderName.trim();
    if (!trimmedName) return;

    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: trimmedName,
    };

    const updatedSummaryVault: VaultSummarizedData = {
      ...summaryVault,
      folders: [...summaryVault.folders, newFolder],
    };

    const newVault = await cryptoService.updateVaultFromSummary(
      vault,
      updatedSummaryVault,
    );

    setIsPendingSync(true);
    setVault(newVault);
    setSummaryVault(updatedSummaryVault);

    return newFolder;
  };

  const renameFolder = async (folderId: string, folderName: string) => {
    if (!vault || !summaryVault) return;

    const trimmedName = folderName.trim();
    if (!trimmedName) return;

    const updatedSummaryVault: VaultSummarizedData = {
      ...summaryVault,
      folders: summaryVault.folders.map((folder) =>
        folder.id === folderId ? { ...folder, name: trimmedName } : folder,
      ),
    };

    const newVault = await cryptoService.updateVaultFromSummary(
      vault,
      updatedSummaryVault,
    );

    setIsPendingSync(true);
    setVault(newVault);
    setSummaryVault(updatedSummaryVault);
  };

  const deleteFolder = async (folderId: string) => {
    if (!vault || !summaryVault) return;

    const updatedSummaryVault: VaultSummarizedData = {
      ...summaryVault,
      folders: summaryVault.folders.filter((folder) => folder.id !== folderId),
      entries: summaryVault.entries.map((entry) => ({
        ...entry,
        foldersIds: entry.foldersIds?.filter((id) => id !== folderId),
      })),
    };

    const newVault = await cryptoService.updateVaultFromSummary(
      vault,
      updatedSummaryVault,
    );

    setIsPendingSync(true);
    setVault(newVault);
    setSummaryVault(updatedSummaryVault);
  };

  return {
    saveCredential,
    deleteCredential,
    createFolder,
    renameFolder,
    deleteFolder,
    saveVault,
  };
};
