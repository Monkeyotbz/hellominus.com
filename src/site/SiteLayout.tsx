import { Outlet } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { SettingsProvider, useSettings } from './SettingsContext';
import { LeadDialogProvider } from './LeadDialog';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

function Ribbon() {
  const { announcement, whatsappHref } = useSettings();
  if (!announcement.enabled) return null;
  return (
    <div className="bg-brand-deep px-4 py-2.5 text-center text-body-sm font-medium text-white">
      <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
        {announcement.text}
      </a>
    </div>
  );
}

function FloatingWhatsApp() {
  const { whatsappHref, hasWhatsapp } = useSettings();
  if (!hasWhatsapp) return null;
  return (
    <a
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-xl transition hover:bg-brand-hover"
      aria-label="Escribinos por WhatsApp"
    >
      <MessageCircle className="h-8 w-8" aria-hidden="true" />
    </a>
  );
}

export default function SiteLayout() {
  return (
    <SettingsProvider>
      <LeadDialogProvider>
        <div className="flex min-h-screen flex-col">
          <a href="#contenido" className="skip-link">
            Saltar al contenido
          </a>
          <Ribbon />
          <SiteHeader />
          <main id="contenido" className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
          <FloatingWhatsApp />
        </div>
      </LeadDialogProvider>
    </SettingsProvider>
  );
}
