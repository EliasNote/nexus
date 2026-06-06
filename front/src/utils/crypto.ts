import type { DecryptedVault } from "@/types/vault";

export const createInitialVault = async (
  password: string,
): Promise<DecryptedVault> => {
  return {
    version: "1.0",
    folders: [
      {
        id: "folder-1",
        name: "Trabalho",
        icon: "bi-briefcase",
        colorHex: "#3498db",
      },
    ],
    entries: [
      {
        type: "login",
        id: "entry-1",
        title: "Email Principal",
        foldersIds: ["folder-1"],
        username: "meu.email@exemplo.com",
        password: "uma-senha-forte-123",
        url: "https://mail.google.com",
        isFavorite: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };
};
