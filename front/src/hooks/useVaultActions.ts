import type { Credential, Folder, VaultSummarizedData } from "@/types/vault";
import { useCloudStore } from "./useCloudStore";
import { updateSummaryVaultCredential } from "@/utils/utils";
import { cryptoService } from "@/hooks/useCloudStore";

export const useVaultActions = () => {
  const vault = useCloudStore((s) => s.vault);
  const summaryVault = useCloudStore((s) => s.summaryVault);
  const setIsPendingSync = useCloudStore((s) => s.setIsPendingSync);

  const setVault = useCloudStore.getState().setVault;
  const setSummaryVault = useCloudStore.getState().setSummaryVault;

  const saveCredential = async (
    credentialData: Credential,
    isTrashed?: boolean,
    isRestore?: boolean,
    setIsLoading?: (isLoading: boolean) => void,
  ) => {
    if (!vault || !summaryVault) return;

    try {
      setIsLoading?.(true);
      const finalData: Credential = {
        ...credentialData,
        isDeleted: isTrashed ?? isRestore ?? false,
        updatedAt: new Date().toISOString(),
      };

      const newVault = await cryptoService.updateVaultFromCredential(
        vault,
        finalData,
      );

      setIsPendingSync(true);

      const updatedSummary = updateSummaryVaultCredential(
        summaryVault,
        finalData,
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

    await uploadVault(newVault);
    setVault(newVault);
    setSummaryVault(updatedSummaryVault);
  };

  const createFolder = async (folderName: string) => {
    if (!vault || !summaryVault) return;

    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: folderName.trim(),
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

  return { saveCredential, createFolder, deleteCredential };
};
