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

export default function App() {
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
        <Analytics />
      </div>
    </MotionConfig>
  );
}
