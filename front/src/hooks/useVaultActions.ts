import type { Credential, Folder, VaultSummarizedData } from "@/types/vault";
import { useCloudStore } from "./useCloudStore";
import { useCloudSync } from "./useCloudSync";
import { updateSummaryVaultCredential } from "@/utils/utils";

export const useVaultActions = () => {
  const vault = useCloudStore((s) => s.vault);
  const summaryVault = useCloudStore((s) => s.summaryVault);
  const { uploadVault } = useCloudSync();
  const cryptoService = useCloudStore.getState().cryptoService;

  const setVault = useCloudStore.getState().setVault;
  const setSummaryVault = useCloudStore.getState().setSummaryVault;

  const saveCredential = async (
    credentialData: Credential,
    isEdit: boolean,
    isCreate: boolean,
    setIsLoading?: (isLoading: boolean) => void,
  ) => {
    if (!vault || !summaryVault) return;

    try {
      setIsLoading?.(true);
      const finalData: Credential = {
        ...credentialData,
        isDeleted: isEdit || isCreate ? false : true,
        updatedAt: new Date().toISOString(),
      };

      const newVault = await cryptoService.updateVaultFromCredential(
        vault,
        finalData,
      );
      await uploadVault(newVault);

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

    await uploadVault(newVault);
    setVault(newVault);
    setSummaryVault(updatedSummaryVault);

    return newFolder;
  };

  return { saveCredential, createFolder };
};
