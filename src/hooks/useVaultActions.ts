import type {
    AuditInfo,
  Credential,
  CredentialSummary,
  Directory,
  VaultSummarizedData,
} from "@/types/vault";
import { cryptoService, useCloudStore } from "./useCloudStore";
import { useStorageSync } from "./useStorageSync";

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

  const updateSummaryCredential = (updatedSummary: CredentialSummary) => {
    if (!summaryVault) return;

    const exists = summaryVault.credentials.find((c) => c.id === updatedSummary.id);

    const newCredentials = exists
      ? summaryVault.credentials.map((c) =>
          c.id === updatedSummary.id ? updatedSummary : c,
        )
      : [updatedSummary, ...summaryVault.credentials];

    setSummaryVault({
      ...summaryVault,
      credentials: newCredentials,
    });
  };

  const buildSummaryCredential = (
    credentialData: Credential,
    auditInfo?: AuditInfo | null,
  ): CredentialSummary => {
    const current = summaryVault?.credentials.find((c) => c.id === credentialData.id);

    return {
      id: credentialData.id,
      type: credentialData.type,
      title: credentialData.title,
      username: credentialData.type === "login" ? credentialData.username : null,
      holderName: credentialData.type === "card" ? credentialData.holderName : null,
      name: credentialData.type === "note" ? credentialData.name : null,
      auditInfo: auditInfo ?? current?.auditInfo,
      directoriesIds: credentialData.directoriesIds,
      isFavorite: credentialData.isFavorite,
      isDeleted: credentialData.isDeleted,
    };
  };

  const saveCredential = async (
    credentialData: Credential,
    isTrashed?: boolean,
    isRestore?: boolean,
    auditInfo?: AuditInfo | null,
    isPasswordChanged?: boolean,
    setIsLoading?: (isLoading: boolean) => void,
  ) => {
    if (!vault || !summaryVault) return;

    try {
      setIsLoading?.(true);
      const credentialToSave: Credential = {
        ...credentialData,
        isDeleted: isTrashed ? true : isRestore ? false : (credentialData.isDeleted ?? false),
      };

      const newVault =
        await cryptoService.updateVaultFromCredentialAndTrackPasswordChange(
          vault,
          credentialToSave,
        );

      const summaryCredential = buildSummaryCredential(credentialToSave, auditInfo);
      const exists = summaryVault.credentials.some((c) => c.id === summaryCredential.id);
      const intermediateCredentials = exists
        ? summaryVault.credentials.map((c) => (c.id === summaryCredential.id ? summaryCredential : c))
        : [summaryCredential, ...summaryVault.credentials];

      const intermediateSummaryVault: VaultSummarizedData = {
        ...summaryVault,
        credentials: intermediateCredentials,
      };

      const isLogin = credentialToSave.type === "login";
      const isNew = !exists;
      const isStatusChanged = Boolean(isTrashed) || Boolean(isRestore);
      const shouldVerifyAudit = isLogin && (isNew || isStatusChanged || Boolean(isPasswordChanged));

      let finalSummaryVault = intermediateSummaryVault;

      if (shouldVerifyAudit) {
        finalSummaryVault = await cryptoService.verifyCredentials(
          newVault,
          intermediateSummaryVault,
        );
      }

      setIsPendingSync(true);
      setVault(newVault);
      setSummaryVault(finalSummaryVault);
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

    const finalSummaryVault = await cryptoService.verifyCredentials(
      newVault,
      updatedSummaryVault,
    );

    setIsPendingSync(true);
    setVault(newVault);
    setSummaryVault(finalSummaryVault);
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
    updateSummaryCredential,
    buildSummaryCredential,
  };
};
