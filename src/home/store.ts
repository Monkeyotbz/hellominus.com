import { create } from 'zustand';
import { PROPERTIES, type Property, type StayFilter } from './data';

export type CompleteTab = 'planes' | 'mercado';

interface HomeState {
  /** Filtro activo de la grilla de casas (lo comparten el buscador, las pestañas y los enlaces). */
  stayFilter: StayFilter;
  /** Pestaña visible del bloque "Completa tu estadía". */
  completeTab: CompleteTab;
  /** Casas mostradas: las de la base de datos si hay, si no los ejemplos de data.ts. */
  properties: Property[];
  /** De dónde salen las casas, para rotularlo en pantalla. */
  propertiesSource: 'ejemplo' | 'base';
  setStayFilter: (filter: StayFilter) => void;
  setProperties: (properties: Property[]) => void;
  setCompleteTab: (tab: CompleteTab) => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  stayFilter: 'todas',
  completeTab: 'planes',
  properties: PROPERTIES,
  propertiesSource: 'ejemplo',
  setStayFilter: (stayFilter) => set({ stayFilter }),
  setProperties: (properties) => set({ properties, propertiesSource: 'base' }),
  setCompleteTab: (completeTab) => set({ completeTab }),
}));
