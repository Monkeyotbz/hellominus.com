import { Link, Outlet, useOutletContext } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Container } from '../site/ui';
import { Avatar, Hand, Tabs } from '../dash/ui';
import { firstName } from '../dash/format';
import { tripGroup, useMyBookings, type MyBooking } from './useMyBookings';

export interface AccountContext {
  bookings: MyBooking[] | null;
}

/** Datos compartidos por las pestañas de /cuenta (se cargan una sola vez). */
export function useAccount(): AccountContext {
  return useOutletContext<AccountContext>();
}

export function avatarUrl(path: string | null | undefined): string | null {
  return path ? supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl : null;
}

/**
 * Cuenta del viajero (/cuenta): encabezado con su foto y saludo, y pestañas
 * Resumen · Mis viajes · Perfil y seguridad.
 */
export default function AccountLayout() {
  const { user, profile, memberships } = useAuth();
  const bookings = useMyBookings(user?.id);
  const upcoming = bookings?.filter((b) => tripGroup(b) === 'upcoming').length;
  const name = firstName(profile?.full_name);

  return (
    <div>
      <div className="border-b border-line bg-gradient-to-b from-white to-surface">
        <Container className="pt-10 sm:pt-14">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Avatar name={profile?.full_name || user?.email} src={avatarUrl(profile?.avatar_path)} size={72} />
              <div className="min-w-0">
                <Hand>hola de nuevo</Hand>
                <h1 className="mt-1 font-serif text-[2.4rem] font-light leading-none text-ink sm:text-[2.8rem]">{name || 'Tu cuenta'}</h1>
                <p className="mt-2 truncate text-sm text-muted">{user?.email}</p>
              </div>
            </div>
            {memberships.length > 0 && (
              <Link
                to="/panel"
                className="inline-flex items-center gap-2 border border-ink px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-ink hover:text-surface"
              >
                Modo anfitrión · {memberships[0].tenant.name} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          <div className="mt-8">
            <Tabs
              items={[
                { to: '/cuenta', label: 'Resumen', end: true },
                { to: '/cuenta/viajes', label: 'Mis viajes', count: upcoming || undefined },
                { to: '/cuenta/perfil', label: 'Perfil y seguridad' },
              ]}
            />
          </div>
        </Container>
      </div>
      <Container className="py-8 sm:py-10">
        <Outlet context={{ bookings } satisfies AccountContext} />
      </Container>
    </div>
  );
}
