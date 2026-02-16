import { create } from 'zustand';
import type { PortraitGenere, StatutGeneration } from '@/types';

interface PortraitStore {
  selectedCommune: string | null;
  statut: StatutGeneration;
  portrait: PortraitGenere | null;
  erreur: string | null;
  setSelectedCommune: (code: string | null) => void;
  setStatut: (statut: StatutGeneration) => void;
  setPortrait: (portrait: PortraitGenere | null) => void;
  setErreur: (erreur: string | null) => void;
  reset: () => void;
}

export const usePortraitStore = create<PortraitStore>((set) => ({
  selectedCommune: null,
  statut: 'idle',
  portrait: null,
  erreur: null,
  setSelectedCommune: (code) => set({ selectedCommune: code, portrait: null, erreur: null, statut: 'idle' }),
  setStatut: (statut) => set({ statut }),
  setPortrait: (portrait) => set({ portrait }),
  setErreur: (erreur) => set({ erreur }),
  reset: () => set({ selectedCommune: null, statut: 'idle', portrait: null, erreur: null }),
}));
