import { useEffect } from 'react';
import { SettingsProvider } from '../site/SettingsContext';
import About from './About';
import Blog from './Blog';
import BigDestination from './BigDestination';
import Closing from './Closing';
import Complete from './Complete';
import Faq from './Faq';
import Footer from './Footer';
import Header from './Header';
import Hero from './Hero';
import Hosts from './Hosts';
import HowItWorks from './HowItWorks';
import NewHome from './NewHome';
import Nomads from './Nomads';
import Reviews from './Reviews';
import Stays from './Stays';
import TrustFigures from './TrustFigures';
import WhatsAppFab from './WhatsAppFab';
import './tokens.css';

const PAGE_TITLE = 'Hellominus — Casas, planes y mercado en Colombia';

/** Portada nueva de Hellominus. Datos de ejemplo (ver data.ts). */
export default function HomePage() {
  useEffect(() => {
    const previous = document.title;
    document.title = PAGE_TITLE;
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <SettingsProvider>
      <div className="home-root" id="inicio">
        <Header />
        <main>
          <Hero />
          <TrustFigures />
          <Stays />
          <NewHome />
          <HowItWorks />
          <Reviews />
          <BigDestination />
          <Complete />
          <Nomads />
          <Closing />
          <Faq />
          <Blog />
          <About />
          <Hosts />
        </main>
        <Footer />
        <WhatsAppFab />
      </div>
    </SettingsProvider>
  );
}
