import { create } from "zustand";

export const useAssetStore = create((set) => ({
  currentAsset: "PETR4",
  setCurrentAsset: (asset) => set({ currentAsset: asset }),
  assets: {},
  setAsset: (key, price) =>
    set((state) => ({
      assets: {
        ...state.assets,
        [key]: { currentPrice: price },
      },
    })),
}));
