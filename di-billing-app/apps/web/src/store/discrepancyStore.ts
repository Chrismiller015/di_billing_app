import { create } from 'zustand';

interface DiscrepancyStore {
  activeReport: { program: string; period: string } | null;
  setActiveReport: (report: { program: string; period: string } | null) => void;
}

export const useDiscrepancyStore = create<DiscrepancyStore>((set) => ({
  activeReport: null,
  setActiveReport: (report) => set({ activeReport: report }),
}));
