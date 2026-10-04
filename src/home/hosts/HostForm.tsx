import { useId, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CITIES } from '../data';
import styles from './HostForm.module.css';

type Status = 'idle' | 'sending' | 'error';
type Kind = 'hospedaje' | 'tours' | 'mercado';

const KINDS: { value: Kind; label: string }[] = [
  { value: 'hospedaje', label: 'Hospedajes' },
  { value: 'tours', label: 'Tours y planes' },
  { value: 'mercado', label: 'Productos (mercado)' },
];

interface FormState {
  name: string;
  whatsapp: string;
  city: string;
  kinds: Kind[];
}

/** "Casa Mar & Sol" → "casa-mar-sol" (dirección pública del espacio). */
function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

/**
 * Alta de propietario: crea su espacio (queda en revisión) y lo lleva a su
 * panel. Sin sesión, primero se crea la cuenta y se vuelve aquí.
 */
export default function HostForm() {
  const uid = useId();
  const navigate = useNavigate();
  const { user, memberships, refreshMemberships, loading } = useAuth();
  const [form, setForm] = useState<FormState>({ name: '', whatsapp: '', city: CITIES[0], kinds: ['hospedaje'] });
  const [status, setStatus] = useState<Status>('idle');
  const [failure, setFailure] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  if (loading) return null;

  if (!user) {
    const back = { from: { pathname: '/anfitriones' } };
    return (
      <div className={styles.done}>
        <p className={styles.hand}>primero, tu cuenta</p>
        <h3>Crea tu cuenta para abrir tu espacio</h3>
        <p>Con ella administras tus hospedajes, tours o productos desde tu panel.</p>
        <div className={styles.pair}>
          <Button onClick={() => navigate('/registro', { state: back })}>Crear cuenta</Button>
          <Button variant="ghost" onClick={() => navigate('/login', { state: back })}>
            Ya tengo cuenta
          </Button>
        </div>
      </div>
    );
  }

  if (memberships.length > 0) {
    return (
      <div className={styles.done}>
        <p className={styles.hand}>ya estás dentro</p>
        <h3>Ya tienes el espacio {memberships[0].tenant.name}</h3>
        <p>Administra tu catálogo, tu información y tus reservas desde tu panel.</p>
        <Button href="/panel">Ir a mi panel</Button>
      </div>
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const toggleKind = (kind: Kind) =>
    set('kinds', form.kinds.includes(kind) ? form.kinds.filter((k) => k !== kind) : [...form.kinds, kind]);

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 3) next.name = 'Escribe el nombre de tu espacio (mínimo 3 letras).';
    if (form.whatsapp.replace(/\D/g, '').length < 7) next.whatsapp = 'Escribe un WhatsApp con indicativo, por ejemplo +57 300 123 4567.';
    if (form.kinds.length === 0) next.kinds = 'Elige al menos una opción.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    const base = slugify(form.name) || 'espacio';
    // Si la dirección ya existe, se prueba con un sufijo corto.
    for (const slug of [base, `${base}-${Math.random().toString(36).slice(2, 6)}`]) {
      const { error } = await supabase.rpc('create_tenant', {
        p_name: form.name.trim(),
        p_slug: slug,
        p_kinds: form.kinds,
        p_city: form.city === 'Otra' ? undefined : form.city,
        p_contact_whatsapp: form.whatsapp.trim(),
      });
      if (!error) {
        await refreshMemberships();
        navigate('/panel');
        return;
      }
      if (error.code !== '23505') {
        setFailure(error.message);
        break;
      }
    }
    setStatus('error');
  };

  const field = (key: keyof FormState) => ({
    id: `${uid}-${key}`,
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `${uid}-${key}-error` : undefined,
  });
  const error = (key: keyof FormState) =>
    errors[key] ? (
      <span id={`${uid}-${key}-error`} className={styles.error}>
        {errors[key]}
      </span>
    ) : null;

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.group}>
        <label htmlFor={`${uid}-name`}>Nombre de tu espacio</label>
        <input {...field('name')} placeholder="Ej.: Casas del Laguito" value={form.name} onChange={(e) => set('name', e.target.value)} />
        {error('name')}
      </div>
      <fieldset className={styles.group} aria-describedby={errors.kinds ? `${uid}-kinds-error` : undefined}>
        <legend>¿Qué vas a publicar?</legend>
        {KINDS.map((k) => (
          <label key={k.value} className={styles.check}>
            <input type="checkbox" checked={form.kinds.includes(k.value)} onChange={() => toggleKind(k.value)} /> {k.label}
          </label>
        ))}
        {error('kinds')}
      </fieldset>
      <div className={styles.pair}>
        <div className={styles.group}>
          <label htmlFor={`${uid}-city`}>Ciudad principal</label>
          <select {...field('city')} value={form.city} onChange={(e) => set('city', e.target.value)}>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
            <option value="Otra">Otra ciudad</option>
          </select>
        </div>
        <div className={styles.group}>
          <label htmlFor={`${uid}-whatsapp`}>WhatsApp</label>
          <input {...field('whatsapp')} type="tel" autoComplete="tel" placeholder="+57 300 123 4567" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
          {error('whatsapp')}
        </div>
      </div>

      {status === 'error' && (
        <p className={styles.fail} role="alert">
          No pudimos crear tu espacio{failure ? `: ${failure}` : ''}. Inténtalo de nuevo en un momento.
        </p>
      )}
      <Button type="submit" loading={status === 'sending'}>
        {status === 'sending' ? 'Creando…' : 'Crear mi espacio'}
      </Button>
      <p className={styles.fine}>Revisamos cada espacio antes de mostrarlo en Hellominus. Mientras tanto ya puedes preparar tu catálogo.</p>
    </form>
  );
}
