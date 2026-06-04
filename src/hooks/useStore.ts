import { create } from "zustand";

type StoreState = {
  vault: any | null;
  setVault: (vault: any | null) => void;
};

export const useStore = create<StoreState>()((set, get) => ({
  vault: null,

  setVault: (vault) => set({ vault: vault }),
}));
