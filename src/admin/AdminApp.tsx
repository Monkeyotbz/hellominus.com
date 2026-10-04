import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import Wordmark from '../site/Wordmark';
import {
  BedDouble,
  CalendarDays,
  Compass,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Newspaper,
  Quote,
  Settings,
  ShoppingBag,
  Store,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ENTITIES, ENTITY_ORDER } from './entities';
import EntityList from './EntityList';
import EntityForm from './EntityForm';
import TenantsAdmin from './TenantsAdmin';
import AdminDashboard from './AdminDashboard';

const ICONS: Record<string, LucideIcon> = {
  MapPin,
  BedDouble,
  Compass,
  CalendarDays,
  Home,
  Quote,
  Newspaper,
  ShoppingBag,
};

export default function AdminApp() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-brand-tint text-brand' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-30 w-60 border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-5">
          <Wordmark className="text-base" />
          <span className="font-bold text-gray-800">Admin</span>
        </div>
        <nav className="space-y-1 p-3">
          <NavLink to="/admin" end className={linkCls}>
            <LayoutDashboard className="h-4 w-4" /> Panel
          </NavLink>
          <NavLink to="/admin/espacios" className={linkCls}>
            <Store className="h-4 w-4" /> Espacios
          </NavLink>
          {ENTITY_ORDER.map((key) => {
            const cfg = ENTITIES[key];
            const Icon = ICONS[cfg.icon] ?? MapPin;
            return (
              <NavLink key={key} to={`/admin/${key}`} className={linkCls}>
                <Icon className="h-4 w-4" /> {cfg.labelPlural}
              </NavLink>
            );
          })}
          <NavLink to="/admin/settings" className={linkCls}>
            <Settings className="h-4 w-4" /> Ajustes
          </NavLink>
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-gray-200 p-3">
          <div className="mb-2 px-2 text-xs text-gray-500">
            {profile?.full_name || 'Staff'} · {profile?.role}
          </div>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </div>
      </aside>

      <main className="ml-60 p-8">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="espacios" element={<TenantsAdmin />} />
          <Route path=":entity" element={<EntityList />} />
          <Route path=":entity/:id" element={<EntityForm />} />
          <Route path="settings" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}
