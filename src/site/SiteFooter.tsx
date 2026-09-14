import { Link } from 'react-router-dom';
import { useLocale } from '../lib/locale';
import { useSettings } from './SettingsContext';
import { Container } from './ui';

export default function SiteFooter() {
  const { locale } = useLocale();
  const { contactEmail, whatsappNumber, hasWhatsapp } = useSettings();
  const es = locale === 'es';

  return (
    <footer className="mt-20 border-t border-line">
      <Container className="grid grid-cols-2 gap-10 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <img src="/brand/logo.svg" alt="Hellominus" className="h-10 w-auto" />
          <p className="mt-3 max-w-[260px] text-sm leading-relaxed text-muted">
            {es
              ? 'Turismo con anfitriones locales en Colombia. Reserva directa, sin comisiones. 17 años.'
              : 'Travel with local hosts in Colombia. Book direct, no fees. 17 years.'}
          </p>
        </div>
        <FooterCol title={es ? 'Explorar' : 'Explore'}>
          <Link to="/tours">Tours</Link>
          <Link to="/hospedajes">{es ? 'Hospedajes' : 'Stays'}</Link>
          <Link to="/destinos">{es ? 'Destinos' : 'Destinations'}</Link>
        </FooterCol>
        <FooterCol title={es ? 'Empresa' : 'Company'}>
          <Link to="/nosotros">{es ? 'Nosotros' : 'About'}</Link>
          <Link to="/blog">Blog</Link>
        </FooterCol>
        <FooterCol title={es ? 'Contacto' : 'Contact'}>
          {hasWhatsapp && (
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          )}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </FooterCol>
      </Container>
      <Container className="flex flex-col justify-between gap-2 border-t border-line py-5 text-xs text-muted sm:flex-row">
        <span>© {new Date().getFullYear()} Hellominus · {es ? 'Términos · Privacidad' : 'Terms · Privacy'}</span>
        <span>{es ? 'Español (Colombia) · COP $' : 'Spanish (Colombia) · COP $'}</span>
      </Container>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 text-[13px] font-bold tracking-wide text-ink">{title}</div>
      <div className="flex flex-col gap-2 text-sm text-muted [&_a:hover]:text-brand">{children}</div>
    </div>
  );
}
