import { useId, useState, type FormEvent } from 'react';
import Button from '../Button';
import { submitLead } from '../../lib/queries';
import { CITIES } from '../data';
import styles from './HostForm.module.css';

type Status = 'idle' | 'sending' | 'done' | 'error';

interface FormState {
  name: string;
  whatsapp: string;
  email: string;
  city: string;
  properties: string;
  message: string;
}

const EMPTY: FormState = { name: '', whatsapp: '', email: '', city: CITIES[0], properties: '', message: '' };
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export default function HostForm() {
  const uid = useId();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = 'Cuéntanos tu nombre.';
    if (form.whatsapp.replace(/\D/g, '').length < 7) next.whatsapp = 'Escribe un WhatsApp con indicativo, por ejemplo +57 300 123 4567.';
    if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) next.email = 'Escribe un correo válido o déjalo vacío.';
    const count = Number(form.properties);
    if (!form.properties || !Number.isInteger(count) || count < 1) next.properties = 'Indica cuántas propiedades tienes (un número).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    const { error } = await submitLead({
      type: 'general',
      name: form.name.trim(),
      whatsapp: form.whatsapp.trim(),
      email: form.email.trim() || undefined,
      locale: 'es',
      message: `Anfitrión · Ciudad: ${form.city} · Propiedades: ${form.properties}${form.message.trim() ? ` · ${form.message.trim()}` : ''}`,
    });
    setStatus(error ? 'error' : 'done');
  };

  if (status === 'done') {
    return (
      <div className={styles.done} role="status">
        <p className={styles.hand}>recibido</p>
        <h3>Gracias, {form.name.trim().split(' ')[0]}.</h3>
        <p>Recibimos tu solicitud. Una persona de Hellominus te escribirá por WhatsApp para coordinar la visita a tus casas.</p>
      </div>
    );
  }

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
        <label htmlFor={`${uid}-name`}>Tu nombre</label>
        <input {...field('name')} autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} />
        {error('name')}
      </div>
      <div className={styles.group}>
        <label htmlFor={`${uid}-whatsapp`}>WhatsApp</label>
        <input {...field('whatsapp')} type="tel" autoComplete="tel" placeholder="+57 300 123 4567" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
        {error('whatsapp')}
      </div>
      <div className={styles.group}>
        <label htmlFor={`${uid}-email`}>Correo (opcional)</label>
        <input {...field('email')} type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        {error('email')}
      </div>
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
          <label htmlFor={`${uid}-properties`}>¿Cuántas propiedades tienes?</label>
          <input {...field('properties')} type="number" inputMode="numeric" min={1} value={form.properties} onChange={(e) => set('properties', e.target.value)} />
          {error('properties')}
        </div>
      </div>
      <div className={styles.group}>
        <label htmlFor={`${uid}-message`}>Algo más que quieras contarnos (opcional)</label>
        <textarea id={`${uid}-message`} rows={3} value={form.message} onChange={(e) => set('message', e.target.value)} />
      </div>

      {status === 'error' && (
        <p className={styles.fail} role="alert">
          No pudimos enviar tu solicitud. Inténtalo de nuevo en un momento.
        </p>
      )}
      <Button type="submit" loading={status === 'sending'}>
        {status === 'sending' ? 'Enviando…' : 'Quiero publicar mis casas'}
      </Button>
      <p className={styles.fine}>No se cobra nada. Solo cobramos una comisión por cada reserva confirmada.</p>
    </form>
  );
}
