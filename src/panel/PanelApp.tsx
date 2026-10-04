import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { BedDouble, CalendarCheck, Compass, ExternalLink, Home, LogOut, Menu, Newspaper, Plane, ShoppingBag, Store, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth, type Membership } from '../contexts/AuthContext';
import EntityForm from '../admin/EntityForm';
import { EntityScopeProvider } from '../admin/scope';
import Wordmark from '../site/Wordmark';
import { tenantStatus } from '../dash/format';
import PanelHome from './PanelHome';
import CatalogList from './CatalogList';
import TenantProfile from './TenantProfile';
import TenantBookings from './TenantBookings';

/** Secciones de catálogo según lo que vende el espacio (`tenants.kinds`). */
const CATALOG: { entity: string; kind: string; label: string; icon: LucideIcon }[] = [
  { entity: 'accommodations', kind: 'hospedaje', label: 'Hospedajes', icon: BedDouble },
  { entity: 'tours', kind: 'tours', label: 'Tours y planes', icon: Compass },
  { entity: 'products', kind: 'mercado', label: 'Mercado', icon: ShoppingBag },
];

const STORAGE_KEY = 'hm-panel-tenant';

/**
 * Panel del anfitrión (/panel). Barra lateral verde (en móvil, menú
 * desplegable) y un espacio activo a la vez: las pantallas de catálogo
 * trabajan con ese espacio como alcance.
 */
export default function PanelApp() {
  const { memberships, loading } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const active = useMemo(() => memberships.find((m) => m.tenant.id === activeId) ?? memberships[0], [memberships, activeId]);

  useEffect(() => {
    if (!active) return;
    try {
      localStorage.setItem(STORAGE_KEY, active.tenant.id);
    } catch {
      /* sin almacenamiento: se usa el primer espacio */
    }
  }, [active]);

  // Cerrar el menú móvil al navegar.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  if (loading) return null;
  // Sin espacio todavía: el alta empieza en /anfitriones.
  if (!active) return <Navigate to="/anfitriones" replace />;

  const tenant = active.tenant;
  const sections = CATALOG.filter((c) => tenant.kinds.includes(c.kind));
  const allowed = new Set([...sections.map((s) => s.entity), 'blog_posts']);

  return (
    <EntityScopeProvider value={{ basePath: '/panel', tenantId: tenant.id }}>
      <div className="min-h-screen bg-surface">
        {/* Barra superior móvil */}
        <div className="sticky top-0 z-40 flex items-center justify-between gap-3 bg-brand px-4 py-3 text-brand-on lg:hidden">
          <Link to="/panel" className="min-w-0">
            <Wordmark light className="text-sm" />
            <span className="block truncate text-xs text-brand-on-muted">{tenant.name}</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="panel-nav"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Fondo del menú móvil */}
        {menuOpen && <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />}

        <aside
          id="panel-nav"
          className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-brand text-brand-on transition-transform duration-200 lg:w-64 lg:translate-x-0 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar tenant={tenant} memberships={memberships} sections={sections} onSwitch={setActiveId} />
        </aside>

        <main className="px-4 py-6 sm:px-8 lg:ml-64 lg:py-10">
          <Routes>
            <Route index element={<PanelHome tenantId={tenant.id} />} />
            <Route path="espacio" element={<TenantProfile tenantId={tenant.id} />} />
            <Route path="reservas" element={<TenantBookings tenantId={tenant.id} />} />
            <Route path=":entity" element={<Guard allowed={allowed}><CatalogList /></Guard>} />
            <Route path=":entity/:id" element={<Guard allowed={allowed}><EntityForm /></Guard>} />
          </Routes>
        </main>
      </div>
    </EntityScopeProvider>
  );
}

function Sidebar({
  tenant,
  memberships,
  sections,
  onSwitch,
}: {
  tenant: Membership['tenant'];
  memberships: Membership[];
  sections: typeof CATALOG;
  onSwitch: (id: string) => void;
}) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const st = tenantStatus(tenant.status);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition ${
      isActive ? 'bg-white/[0.14] font-medium text-white' : 'text-brand-on-muted hover:bg-white/[0.08] hover:text-white'
    }`;
  const group = (label: string) => <p className="px-3 pb-1 pt-5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brand-on-muted/80">{label}</p>;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="px-6 pb-5 pt-6">
        <Link to="/" aria-label="Ir a la portada de Hellominus">
          <Wordmark light className="text-base" />
        </Link>
        <p className="mt-1 font-hand text-lg font-semibold leading-none text-brand-on-muted">panel de anfitrión</p>
      </div>

      <div className="mx-4 rounded-lg bg-white/[0.08] p-3">
        {memberships.length > 1 ? (
          <label className="block">
            <span className="sr-only">Espacio activo</span>
            <select
              value={tenant.id}
              onChange={(e) => onSwitch(e.target.value)}
              className="w-full rounded-md border border-white/20 bg-transparent px-2 py-1.5 text-sm text-white [&>option]:text-ink"
            >
              {memberships.map((m) => (
                <option key={m.tenant.id} value={m.tenant.id}>
                  {m.tenant.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="truncate text-sm font-medium text-white">{tenant.name}</p>
        )}
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-brand-on-muted">
          <span className={`h-2 w-2 rounded-full ${tenant.status === 'active' ? 'bg-[#9FD3A7]' : tenant.status === 'pending' ? 'bg-[#E9C46A]' : 'bg-[#F08A80]'}`} aria-hidden="true" />
          {st.label}
        </p>
      </div>

      <nav className="flex-1 px-3 pb-4" aria-label="Panel">
        {group('Tu espacio')}
        <NavLink to="/panel" end className={linkCls}>
          <Home className="h-4 w-4" /> Inicio
        </NavLink>
        <NavLink to="/panel/espacio" className={linkCls}>
          <Store className="h-4 w-4" /> Mi espacio
        </NavLink>
        {group('Catálogo')}
        {sections.map(({ entity, label, icon: Icon }) => (
          <NavLink key={entity} to={`/panel/${entity}`} className={linkCls}>
            <Icon className="h-4 w-4" /> {label}
          </NavLink>
        ))}
        <NavLink to="/panel/blog_posts" className={linkCls}>
          <Newspaper className="h-4 w-4" /> Blog
        </NavLink>
        {group('Ventas')}
        <NavLink to="/panel/reservas" className={linkCls}>
          <CalendarCheck className="h-4 w-4" /> Reservas y pedidos
        </NavLink>
      </nav>

      <div className="space-y-0.5 border-t border-white/10 px-3 py-4 text-sm">
        {tenant.status === 'active' && (
          <a href={`/anfitrion/${tenant.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-brand-on-muted hover:bg-white/[0.08] hover:text-white">
            <ExternalLink className="h-4 w-4" /> Ver mi página
          </a>
        )}
        <Link to="/cuenta" className="flex items-center gap-3 rounded-lg px-3 py-2 text-brand-on-muted hover:bg-white/[0.08] hover:text-white">
          <Plane className="h-4 w-4" /> Modo viajero
        </Link>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate('/');
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-brand-on-muted hover:bg-white/[0.08] hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Salir
        </button>
      </div>
    </div>
  );
}

/** Solo las secciones que corresponden al tipo de espacio. */
function Guard({ allowed, children }: { allowed: Set<string>; children: JSX.Element }) {
  const { entity = '' } = useParams();
  return allowed.has(entity) ? children : <Navigate to="/panel" replace />;
}
