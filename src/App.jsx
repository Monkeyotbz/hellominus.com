import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import ValueProps from "./components/ValueProps.jsx";
import SocialProof from "./components/SocialProof.jsx";
import Sectors from "./components/Sectors.jsx";
import TechMarquee from "./components/TechMarquee.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import WhatsAppButton from "./components/WhatsAppButton.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import ComisionesArtPage from "./projects/comisiones-art/Page.jsx";
import CobranzasWtwPage from "./projects/cobranzas-wtw/Page.jsx";
import CertificadosPage from "./projects/certificados/Page.jsx";

// Ruteo mínimo por hash (sin react-router): funciona en cualquier hosting
// estático sin configurar rewrites de servidor. "#soluciones", "#casos", etc.
// son anclas normales de la landing y no pasan por acá; solo los hashes con
// prefijo "#/" abren una "página" de portafolio.
function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHashRoute();

  if (hash.startsWith("#/proyectos/comisiones-art")) {
    return (
      <MotionConfig reducedMotion="user">
        <ComisionesArtPage />
        <Analytics />
      </MotionConfig>
    );
  }

  if (hash.startsWith("#/proyectos/cobranzas-wtw")) {
    return (
      <MotionConfig reducedMotion="user">
        <CobranzasWtwPage />
        <Analytics />
      </MotionConfig>
    );
  }

  if (hash.startsWith("#/proyectos/certificados")) {
    return (
      <MotionConfig reducedMotion="user">
        <CertificadosPage />
        <Analytics />
      </MotionConfig>
    );
  }

  return (
    // reducedMotion="user": respeta prefers-reduced-motion del sistema operativo
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-hidden">
        <Navbar />
        <main>
          <Hero />
          <ValueProps />
          <SocialProof />
          <Sectors />
          <TechMarquee />
          <Contact />
        </main>
        <Footer />
        <WhatsAppButton />
        <CookieConsent />
      </div>
      <Analytics />
    </MotionConfig>
  );
}
