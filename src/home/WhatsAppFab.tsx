import { useSettings } from '../site/SettingsContext';
import { WhatsAppIcon } from './Icons';
import styles from './WhatsAppFab.module.css';

/** Botón fijo de WhatsApp. Si no hay número configurado no se muestra (no apunta a nadie ajeno). */
export default function WhatsAppFab() {
  const { hasWhatsapp, whatsappHref } = useSettings();
  if (!hasWhatsapp) return null;

  return (
    <a className={styles.fab} href={whatsappHref()} target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp">
      <WhatsAppIcon />
      <span>WhatsApp</span>
    </a>
  );
}
