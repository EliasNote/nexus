import type {
  Credential,
  Directory,
  VaultSummarizedData,
} from "@/types/vault";
import { cryptoService, useCloudStore } from "./useCloudStore";
import { useStorageSync } from "./useStorageSync";
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

    await upload(await cryptoService.encryptVault(vault));
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
      credentials: summaryVault.credentials.filter((e) => e.id !== credentialId),
    };

    const newVault = await cryptoService.updateVaultFromSummary(
      vault,
      updatedSummaryVault,
    );

    setIsPendingSync(true);
    setVault(newVault);
    setSummaryVault(updatedSummaryVault);
  };

  const createDirectory = async (directoryName: string) => {
    if (!vault || !summaryVault) return;

    const trimmedName = directoryName.trim();
    if (!trimmedName) return;

    const newDirectory: Directory = {
      id: crypto.randomUUID(),
      name: trimmedName,
    };

    const updatedSummaryVault: VaultSummarizedData = {
      ...summaryVault,
      directories: [...summaryVault.directories, newDirectory],
    };

    const newVault = await cryptoService.updateVaultFromSummary(
      vault,
      updatedSummaryVault,
    );

    setIsPendingSync(true);
    setVault(newVault);
    setSummaryVault(updatedSummaryVault);

    return newDirectory;
  };

  const renameDirectory = async (directoryId: string, directoryName: string) => {
    if (!vault || !summaryVault) return;

    const trimmedName = directoryName.trim();
    if (!trimmedName) return;

    const updatedSummaryVault: VaultSummarizedData = {
      ...summaryVault,
      directories: summaryVault.directories.map((directory) =>
        directory.id === directoryId ? { ...directory, name: trimmedName } : directory,
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

  const deleteDirectory = async (directoryId: string) => {
    if (!vault || !summaryVault) return;

    const updatedSummaryVault: VaultSummarizedData = {
      ...summaryVault,
      directories: summaryVault.directories.filter((directory) => directory.id !== directoryId),
      credentials: summaryVault.credentials.map((credential) => ({
        ...credential,
        directoriesIds: credential.directoriesIds?.filter((id) => id !== directoryId),
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
    createDirectory,
    renameDirectory,
    deleteDirectory,
    saveVault,
  };
};
