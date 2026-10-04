import { createContext, useContext } from 'react';

/**
 * Dónde se usa el motor de listas/formularios: en /admin (todo el catálogo) o
 * en /panel (solo lo del espacio del propietario).
 */
export interface EntityScope {
  /** Ruta base de las pantallas: '/admin' o '/panel'. */
  basePath: string;
  /** Espacio activo en /panel: filtra listas, marca lo creado y define la carpeta de fotos. */
  tenantId?: string;
}

const ScopeContext = createContext<EntityScope>({ basePath: '/admin' });

export const EntityScopeProvider = ScopeContext.Provider;

export function useEntityScope(): EntityScope {
  return useContext(ScopeContext);
}
