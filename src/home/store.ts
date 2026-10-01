import { create } from 'zustand';
import type { StayFilter } from './data';

export type CompleteTab = 'planes' | 'mercado';

interface HomeState {
  /** Filtro activo de la grilla de casas (lo comparten el buscador, las pestañas y los enlaces). */
  stayFilter: StayFilter;
  /** Pestaña visible del bloque "Completa tu estadía". */
  completeTab: CompleteTab;
  setStayFilter: (filter: StayFilter) => void;
  setCompleteTab: (tab: CompleteTab) => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  stayFilter: 'todas',
  completeTab: 'planes',
  setStayFilter: (stayFilter) => set({ stayFilter }),
  setCompleteTab: (completeTab) => set({ completeTab }),
}));
