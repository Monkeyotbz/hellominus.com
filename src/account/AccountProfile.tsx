import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { buttonClasses } from '../site/ui';
import { Avatar, Card } from '../dash/ui';
import { FormMessage, SelectField, TextField, Toggle } from '../dash/fields';
import { avatarUrl } from './AccountLayout';

type Msg = { kind: 'ok' | 'error'; text: string } | null;

function SaveButton({ busy, children = 'Guardar' }: { busy: boolean; children?: string }) {
  return (
    <button type="submit" disabled={busy} className={buttonClasses('primary', 'md')}>
      {busy && <Loader2 className="h-4 w-4 animate-spin" />} {children}
    </button>
  );
}

/** Datos personales, preferencias y seguridad de la cuenta. */
export default function AccountProfile() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PersonalData />
      <Preferences />
      <Security />
      <SessionCard />
    </div>
  );
}

function PersonalData() {
  const { user, profile, updateProfile } = useAuth();
  const [form, setForm] = useState({ full_name: '', phone: '', country: '', city: '' });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  useEffect(() => {
    setForm({ full_name: profile?.full_name ?? '', phone: profile?.phone ?? '', country: profile?.country ?? '', city: profile?.city ?? '' });
  }, [profile]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const clean = (v: string) => v.trim() || null;
    const { error } = await updateProfile({ full_name: clean(form.full_name), phone: clean(form.phone), country: clean(form.country), city: clean(form.city) });
    setBusy(false);
    setMsg(error ? { kind: 'error', text: 'No se pudo guardar. Inténtalo de nuevo.' } : { kind: 'ok', text: 'Datos guardados.' });
  };

  const upload = async (file: File | undefined) => {
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    // Política de Storage: cada usuario escribe solo en avatars/<su id>/…
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: false });
    if (!error) await updateProfile({ avatar_path: path });
    setUploading(false);
    setMsg(error ? { kind: 'error', text: `No se pudo subir la foto: ${error.message}` } : { kind: 'ok', text: 'Foto actualizada.' });
  };

  return (
    <Card title="Tu foto y tus datos">
      <form onSubmit={save} className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={profile?.full_name || user?.email} src={avatarUrl(profile?.avatar_path)} size={72} />
            {uploading && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
                <Loader2 className="h-5 w-5 animate-spin text-brand" />
              </span>
            )}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-brand hover:underline">
            <Camera className="h-4 w-4" /> {profile?.avatar_path ? 'Cambiar foto' : 'Subir foto'}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nombre completo" value={form.full_name} onChange={set('full_name')} autoComplete="name" />
          <TextField label="WhatsApp" value={form.phone} onChange={set('phone')} type="tel" autoComplete="tel" placeholder="+57 300 123 4567" hint="Para coordinar tu llegada." />
          <TextField label="País" value={form.country} onChange={set('country')} autoComplete="country-name" />
          <TextField label="Ciudad" value={form.city} onChange={set('city')} autoComplete="address-level2" />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <SaveButton busy={busy} />
          <FormMessage message={msg} />
        </div>
      </form>
    </Card>
  );
}

function Preferences() {
  const { profile, updateProfile } = useAuth();
  const [locale, setLocale] = useState('es');
  const [optIn, setOptIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  useEffect(() => {
    setLocale(profile?.locale ?? 'es');
    setOptIn(Boolean(profile?.marketing_opt_in));
  }, [profile]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await updateProfile({ locale, marketing_opt_in: optIn });
    setBusy(false);
    setMsg(error ? { kind: 'error', text: 'No se pudo guardar.' } : { kind: 'ok', text: 'Preferencias guardadas.' });
  };

  return (
    <Card title="Preferencias">
      <form onSubmit={save} className="space-y-5">
        <div className="max-w-xs">
          <SelectField
            label="Idioma de los correos"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            options={[
              { value: 'es', label: 'Español' },
              { value: 'en', label: 'English' },
            ]}
          />
        </div>
        <Toggle label="Recibir guías y ofertas" hint="Un correo de vez en cuando, nunca spam." checked={optIn} onChange={setOptIn} />
        <div className="flex flex-wrap items-center gap-4">
          <SaveButton busy={busy} />
          <FormMessage message={msg} />
        </div>
      </form>
    </Card>
  );
}

function Security() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState({ next: '', repeat: '' });
  const [busy, setBusy] = useState<'email' | 'pw' | null>(null);
  const [emailMsg, setEmailMsg] = useState<Msg>(null);
  const [pwMsg, setPwMsg] = useState<Msg>(null);

  const changeEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setEmailMsg({ kind: 'error', text: 'Escribe un correo válido.' });
    setBusy('email');
    const { error } = await supabase.auth.updateUser({ email: email.trim() }, { emailRedirectTo: `${window.location.origin}/cuenta/perfil` });
    setBusy(null);
    setEmailMsg(
      error
        ? { kind: 'error', text: error.message }
        : { kind: 'ok', text: `Te enviamos un enlace a ${email.trim()} para confirmar el cambio.` },
    );
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (pw.next.length < 8) return setPwMsg({ kind: 'error', text: 'Usa al menos 8 caracteres.' });
    if (pw.next !== pw.repeat) return setPwMsg({ kind: 'error', text: 'Las contraseñas no coinciden.' });
    setBusy('pw');
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    setBusy(null);
    if (!error) setPw({ next: '', repeat: '' });
    setPwMsg(error ? { kind: 'error', text: error.message } : { kind: 'ok', text: 'Contraseña actualizada.' });
  };

  return (
    <Card title="Seguridad">
      <div className="space-y-8">
        <form onSubmit={changeEmail} className="space-y-4">
          <p className="text-sm text-muted">
            Correo actual: <span className="text-ink">{user?.email}</span>
          </p>
          <div className="max-w-md">
            <TextField label="Nuevo correo" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <SaveButton busy={busy === 'email'}>Cambiar correo</SaveButton>
            <FormMessage message={emailMsg} />
          </div>
        </form>
        <form onSubmit={changePassword} className="space-y-4 border-t border-line pt-8">
          <div className="grid max-w-xl gap-4 sm:grid-cols-2">
            <TextField label="Nueva contraseña" type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} hint="Mínimo 8 caracteres." />
            <TextField label="Repite la contraseña" type="password" autoComplete="new-password" value={pw.repeat} onChange={(e) => setPw((p) => ({ ...p, repeat: e.target.value }))} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <SaveButton busy={busy === 'pw'}>Cambiar contraseña</SaveButton>
            <FormMessage message={pwMsg} />
          </div>
        </form>
      </div>
    </Card>
  );
}

function SessionCard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={async () => {
          await signOut();
          navigate('/');
        }}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <LogOut className="h-4 w-4" /> Cerrar sesión
      </button>
    </div>
  );
}
