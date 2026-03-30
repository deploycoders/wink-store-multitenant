import { create } from "zustand";

export const useFilterStore = create((set) => ({
  pendingCategory: null,
  setPendingCategory: (category) => set({ pendingCategory: category }),
  clearPendingCategory: () => set({ pendingCategory: null }),
}));
