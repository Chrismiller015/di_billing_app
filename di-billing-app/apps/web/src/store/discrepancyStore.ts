// [SOURCE: apps/web/src/store/discrepancyStore.ts]
import { create } from 'zustand';

// NOTE: The 'filters' state has been removed.

export type DiscrepancySorting = {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

export type DiscrepancyPagination = {
  page: number;
  pageSize: number;
};

type DiscrepancyState = {
  sorting: DiscrepancySorting;
  pagination: DiscrepancyPagination;
  setSorting: (sorting: DiscrepancySorting) => void;
  setPagination: (pagination: Partial<DiscrepancyPagination>) => void;
  reset: () => void;
};

const initialState = {
  sorting: {
    sortBy: 'variance',
    sortOrder: 'desc' as const,
  },
  pagination: {
    page: 1,
    pageSize: 20,
  },
};

export const useDiscrepancyStore = create<DiscrepancyState>((set) => ({
  ...initialState,
  setSorting: (newSorting) => set({ sorting: newSorting }),
  setPagination: (newPagination) => set((state) => ({ pagination: { ...state.pagination, ...newPagination } })),
  reset: () => set(initialState),
}));