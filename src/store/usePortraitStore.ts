import { create } from 'zustand';
import type { PortraitGenere, StatutGeneration, TerritoireIndicateurs, BatchJob } from '@/types';

interface PortraitStore {
  selectedCommune: string | null;
  selectedEpci: string | null;
  statut: StatutGeneration;
  portrait: PortraitGenere | null;
  indicateurs: TerritoireIndicateurs | null;
  erreur: string | null;
  batchJobs: BatchJob[];
  retryCount: number;

  setSelectedCommune: (code: string | null) => void;
  setSelectedEpci: (code: string | null) => void;
  setStatut: (statut: StatutGeneration) => void;
  setPortrait: (portrait: PortraitGenere | null) => void;
  setIndicateurs: (indicateurs: TerritoireIndicateurs | null) => void;
  setErreur: (erreur: string | null) => void;
  setBatchJobs: (jobs: BatchJob[]) => void;
  updateBatchJob: (code: string, update: Partial<BatchJob>) => void;
  incrementRetry: () => void;
  resetRetry: () => void;
  reset: () => void;
}

export const usePortraitStore = create<PortraitStore>((set, get) => ({
  selectedCommune: null,
  selectedEpci: null,
  statut: 'idle',
  portrait: null,
  indicateurs: null,
  erreur: null,
  batchJobs: [],
  retryCount: 0,

  setSelectedCommune: (code) => set({ selectedCommune: code, portrait: null, indicateurs: null, erreur: null, statut: 'idle' }),
  setSelectedEpci: (code) => set({ selectedEpci: code }),
  setStatut: (statut) => set({ statut }),
  setPortrait: (portrait) => set({ portrait }),
  setIndicateurs: (indicateurs) => set({ indicateurs }),
  setErreur: (erreur) => set({ erreur }),
  setBatchJobs: (jobs) => set({ batchJobs: jobs }),
  updateBatchJob: (code, update) => set((state) => ({
    batchJobs: state.batchJobs.map((j) =>
      j.commune_code === code ? { ...j, ...update } : j
    ),
  })),
  incrementRetry: () => set((state) => ({ retryCount: state.retryCount + 1 })),
  resetRetry: () => set({ retryCount: 0 }),
  reset: () => set({ selectedCommune: null, selectedEpci: null, statut: 'idle', portrait: null, indicateurs: null, erreur: null, batchJobs: [], retryCount: 0 }),
}));
