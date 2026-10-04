import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Row, Update } from '../lib/supabase';

export type Profile = Row<'profiles'>;

/** Espacio (tenant) al que pertenece el usuario y su rol en él. */
export interface Membership {
  role: string;
  tenant: Pick<Row<'tenants'>, 'id' | 'slug' | 'name' | 'status' | 'kinds'>;
}

/**
 * A dónde va cada quien al iniciar sesión: el equipo al admin, quien tiene un
 * espacio a su panel de propietario y el resto a su cuenta de viajero.
 */
export function homePathFor(role: string | null | undefined, memberships: Membership[]): string {
  if (role === 'admin' || role === 'editor') return '/admin';
  if (memberships.length > 0) return '/panel';
  return '/cuenta';
}

/** Texto del enlace de cuenta según el inicio del usuario. */
export function accountLabel(homePath: string, es = true): string {
  if (homePath === '/admin') return 'Admin';
  if (homePath === '/panel') return es ? 'Mi panel' : 'My dashboard';
  return es ? 'Mi cuenta' : 'My account';
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  memberships: Membership[];
  /** Ruta de inicio según el rol: /admin, /panel o /cuenta. */
  homePath: string;
  loading: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  /** Crea la cuenta. `hasSession` es false si Supabase pide confirmar el correo primero. */
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: unknown; hasSession?: boolean }>;
  /** Inicia sesión y devuelve a dónde debe ir el usuario (`home`). */
  signIn: (email: string, password: string) => Promise<{ error: unknown; home?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Update<'profiles'>) => Promise<{ error: unknown }>;
  refreshProfile: () => Promise<void>;
  refreshMemberships: () => Promise<Membership[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMemberships = async (userId: string): Promise<Membership[]> => {
    const { data, error } = await supabase
      .from('tenant_members')
      .select('role, tenant:tenants(id, slug, name, status, kinds)')
      .eq('user_id', userId);
    if (error) {
      console.error('Error cargando espacios:', error.message);
      setMemberships([]);
      return [];
    }
    const list = (data ?? []).filter((m): m is Membership => Boolean(m.tenant));
    setMemberships(list);
    return list;
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.error('Error cargando perfil:', error.message);
      setProfile(null);
      return null;
    }
    setProfile(data);
    return data;
  };

  useEffect(() => {
    let mounted = true;
    // "Listo" (loading=false) solo cuando ya están el perfil Y los espacios: si
    // no, al recargar /panel o /admin se ve un instante sin espacio ni rol y la
    // ruta redirige por error.
    const hydrate = async (next: Session | null) => {
      setSession(next);
      setUser(next?.user ?? null);
      if (next?.user) {
        await Promise.all([loadProfile(next.user.id), loadMemberships(next.user.id)]);
      } else {
        setProfile(null);
        setMemberships([]);
      }
      if (mounted) setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => hydrate(session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return; // ya lo cubre getSession()
      // Diferido: Supabase recomienda no consultar la base dentro de este callback.
      setTimeout(() => hydrate(session), 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/login` },
    });
    // El perfil lo crea el trigger handle_new_user en la base de datos.
    return { error, hasSession: Boolean(data.session) };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { error };
    const [prof, members] = await Promise.all([loadProfile(data.user.id), loadMemberships(data.user.id)]);
    return { error: null, home: homePathFor(prof?.role, members) };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: Update<'profiles'>) => {
    if (!user) return { error: new Error('No hay sesión activa') };
    const { error } = await supabase.from('profiles').update(data).eq('id', user.id);
    if (!error) await loadProfile(user.id);
    return { error };
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  const refreshMemberships = async () => (user ? loadMemberships(user.id) : []);

  const role = profile?.role ?? 'user';

  const value: AuthContextType = {
    user,
    profile,
    session,
    memberships,
    homePath: homePathFor(role, memberships),
    loading,
    isStaff: role === 'editor' || role === 'admin',
    isAdmin: role === 'admin',
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    refreshMemberships,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
