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
      {
        id: "folder-2",
        name: "Casa",
        icon: "bi-briefcase",
        colorHex: "#3498db",
      },
      {
        id: "folder-3",
        name: "Compras",
        icon: "bi-briefcase",
        colorHex: "#3498db",
      },
    ],
    entries: [
      {
        type: "login",
        id: "entry-1",
        title: "Email Principal",
        notes: "",
        foldersIds: ["folder-1", "folder-2"],
        audit: {
          leak: false,
          weak: true,
          reused: false,
          renewal: false,
        },
        isFavorite: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        username: "meu.email@exemplo.com",
        password: "uma-senha-forte-123",
        url: "https://mail.google.com",
      },
      {
        type: "login",
        id: "entry-2",
        title: "Email Principal",
        notes: "",
        foldersIds: ["folder-2"],
        audit: {
          leak: false,
          weak: true,
          reused: false,
          renewal: false,
        },
        isFavorite: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        username: "meu.email@exemplo.com",
        password: "uma-senha-forte-123",
        url: "https://mail.google.com",
      },
    ],
  };
};
