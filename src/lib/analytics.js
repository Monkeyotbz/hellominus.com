import { CLARITY_ID, GA_ID } from "../config.js";

// Los scripts de analítica se inyectan ÚNICAMENTE tras el consentimiento
// explícito del usuario en el banner de cookies. Rechazar no carga nada.

let loaded = false;

export function loadAnalytics() {
  if (loaded || typeof document === "undefined") return;
  loaded = true;

  if (CLARITY_ID) {
    // Microsoft Clarity: heatmaps y grabación de sesiones (equivalente a Zoho PageSense)
    window.clarity =
      window.clarity ||
      function (...args) {
        (window.clarity.q = window.clarity.q || []).push(args);
      };
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
    document.head.appendChild(script);
  }

  if (GA_ID) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    // IP anonimizada por defecto: coherente con la promesa de privacidad de la marca
    window.gtag("config", GA_ID, { anonymize_ip: true });
  }
}

// Eventos de conversión (no-op si la analítica no está cargada/consentida)
export function trackEvent(name, params = {}) {
  if (typeof window === "undefined") return;
  if (window.gtag) window.gtag("event", name, params);
  if (window.clarity) window.clarity("event", name);
}
