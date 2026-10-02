import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import { subscribeNewsletter } from '../lib/queries';
import { useSettings } from '../site/SettingsContext';
import { useHomeStore } from './store';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, YouTubeIcon } from './Icons';
import type { City } from './data';
import styles from './Footer.module.css';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export default function Footer() {
  const { social, hasWhatsapp, whatsappHref } = useSettings();
  const setStayFilter = useHomeStore((s) => s.setStayFilter);
  const setCompleteTab = useHomeStore((s) => s.setCompleteTab);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const cityLink = (city: City) => (
    <a href="#estadia" onClick={() => setStayFilter(city)}>
      {city}
    </a>
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setMessage('Escribe un correo válido.');
      return;
    }
    setSending(true);
    setMessage('');
    const { error } = await subscribeNewsletter(email.trim().toLowerCase(), 'es');
    setSending(false);
    if (error) {
      setMessage('No pudimos guardar tu correo. Inténtalo de nuevo en un momento.');
      return;
    }
    setEmail('');
    setMessage('Listo, te escribiremos pronto.');
  };

  const networks = [
    { key: 'instagram', label: 'Instagram', icon: <InstagramIcon /> },
    { key: 'facebook', label: 'Facebook', icon: <FacebookIcon /> },
    { key: 'tiktok', label: 'TikTok', icon: <TikTokIcon /> },
    { key: 'youtube', label: 'YouTube', icon: <YouTubeIcon /> },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.news}>
        <p className={styles.hand}>recibe guías y ofertas</p>
        <form onSubmit={onSubmit} noValidate>
          <label htmlFor="footer-email" className={styles.srOnly}>
            Tu correo
          </label>
          <input id="footer-email" type="email" autoComplete="email" placeholder="Tu correo" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" variant="ghost" loading={sending}>
            {sending ? 'Enviando…' : 'Suscribirme'}
          </Button>
        </form>
        <p className={styles.message} role="status">
          {message}
        </p>
      </div>

      <div className={styles.cols}>
        <div>
          <p className={styles.hand}>casas</p>
          {cityLink('Cartagena')}
          {cityLink('Medellín')}
          {cityLink('Jardín')}
          <a href="#nomadas" onClick={() => setStayFilter('trabajo')}>
            Para trabajar
          </a>
        </div>
        <div>
          <p className={styles.hand}>planes</p>
          {['Islas del Rosario', 'Isla Cholón', 'Bora Bora Beach Club', 'Playa Tranquila'].map((name) => (
            <a key={name} href="#completa" onClick={() => setCompleteTab('planes')}>
              {name}
            </a>
          ))}
        </div>
        <div>
          <p className={styles.hand}>mercado</p>
          {['Tote bag de lino', 'Café de origen', 'Cerámica', 'Tejidos'].map((name) => (
            <a key={name} href="#completa" onClick={() => setCompleteTab('mercado')}>
              {name}
            </a>
          ))}
        </div>
        <div>
          <p className={styles.hand}>hellominus</p>
          <Link to="/nosotros">Nosotros</Link>
          <a href="#comofunciona">Cómo funciona</a>
          <a href="#cancelacion">Cancelación</a>
          <a href="#faq">Preguntas</a>
          <Link to="/anfitriones">Publicar mi casa</Link>
        </div>
      </div>

      <div className={styles.row}>
        <a className={styles.wordmark} href="#inicio">
          Hellominus
        </a>
        <div className={styles.social}>
          <span className={styles.follow}>Síguenos en:</span>
          {networks.map((network) => (
            <a key={network.key} href={social[network.key] || '#inicio'} aria-label={network.label} {...(social[network.key] ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {network.icon}
            </a>
          ))}
          {hasWhatsapp && (
            <a href={whatsappHref()} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
            </a>
          )}
        </div>
        <span className={styles.copy}>© {new Date().getFullYear()} Hellominus</span>
      </div>
      <small className={styles.note}>Fotos del proyecto. Cifras, precios, reseñas y artículos son de ejemplo.</small>
    </footer>
  );
}
