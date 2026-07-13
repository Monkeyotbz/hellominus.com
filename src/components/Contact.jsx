import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Loader2,
  Mail,
  MessageCircle,
  Rocket,
  Send,
} from "lucide-react";
import {
  CONTACT_EMAIL,
  CALENDLY_URL,
  calendlyConfigured,
  FORM_ENDPOINT,
  formConfigured,
  whatsappConfigured,
  whatsappUrl,
} from "../config.js";

const initialForm = { nombre: "", email: "", empresa: "", mensaje: "" };

function validate(form) {
  const errors = {};
  if (form.nombre.trim().length < 2) errors.nombre = "Escribe tu nombre.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = "Escribe un correo válido.";
  if (form.mensaje.trim().length < 10)
    errors.mensaje = "Cuéntanos un poco más (mínimo 10 caracteres).";
  return errors;
}

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [showCalendly, setShowCalendly] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Honeypot anti-spam: si el campo oculto tiene valor, se descarta en silencio
    if (e.target.elements._gotcha?.value) return;

    if (!formConfigured) {
      // Respaldo funcional mientras no exista backend: abre el cliente de correo
      // con el mensaje ya redactado (mejor que un mailto vacío, sigue siendo trazable
      // vía el asunto).
      const body = encodeURIComponent(
        `Nombre: ${form.nombre}\nEmpresa: ${form.empresa || "—"}\n\n${form.mensaje}`
      );
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
        `[Web] Solicitud de demo — ${form.nombre}`
      )}&body=${body}`;
      setStatus("sent");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("sent");
      setForm(initialForm);
    } catch {
      setStatus("error");
    }
  };

  const inputClass = (field) =>
    `w-full rounded-xl border bg-night-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-neon-cyan/60 ${
      errors[field] ? "border-red-400/60" : "border-white/10"
    }`;

  return (
    <section id="contacto" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <p className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-neon-cyan">
            Contacto
          </p>
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            ¿Listo para asegurar la información de tu empresa y automatizar tu
            éxito?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Agenda una sesión gratuita de diagnóstico o escríbenos: respondemos
            en menos de 24 horas hábiles.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-white/8 bg-night-800/60 p-6 backdrop-blur sm:p-8 lg:col-span-3"
          >
            {status === "sent" ? (
              <div className="flex h-full min-h-72 flex-col items-center justify-center text-center">
                <Rocket className="mb-4 h-10 w-10 text-neon-emerald" aria-hidden="true" />
                <h3 className="font-display text-xl font-semibold text-white">
                  ¡Mensaje enviado!
                </h3>
                <p className="mt-2 max-w-sm text-sm text-slate-400">
                  Gracias por escribirnos. Te contactaremos en menos de 24 horas
                  hábiles para agendar tu diagnóstico gratuito.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3 className="mb-6 font-display text-lg font-semibold text-white">
                  Cuéntanos sobre tu proyecto
                </h3>

                {/* Honeypot anti-spam (invisible para humanos) */}
                <input
                  type="text"
                  name="_gotcha"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="nombre" className="mb-1.5 block text-xs font-medium text-slate-400">
                      Nombre *
                    </label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      autoComplete="name"
                      value={form.nombre}
                      onChange={handleChange}
                      className={inputClass("nombre")}
                      placeholder="Tu nombre"
                      aria-invalid={Boolean(errors.nombre)}
                    />
                    {errors.nombre && (
                      <p className="mt-1 text-xs text-red-400">{errors.nombre}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-400">
                      Correo corporativo *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      className={inputClass("email")}
                      placeholder="tu@empresa.com"
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="empresa" className="mb-1.5 block text-xs font-medium text-slate-400">
                    Empresa
                  </label>
                  <input
                    id="empresa"
                    name="empresa"
                    type="text"
                    autoComplete="organization"
                    value={form.empresa}
                    onChange={handleChange}
                    className={inputClass("empresa")}
                    placeholder="Nombre de tu empresa (opcional)"
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="mensaje" className="mb-1.5 block text-xs font-medium text-slate-400">
                    ¿Qué proceso quieres automatizar o asegurar? *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={4}
                    value={form.mensaje}
                    onChange={handleChange}
                    className={inputClass("mensaje")}
                    placeholder="Ej: quiero automatizar el seguimiento de cartera de mi empresa…"
                    aria-invalid={Boolean(errors.mensaje)}
                  />
                  {errors.mensaje && (
                    <p className="mt-1 text-xs text-red-400">{errors.mensaje}</p>
                  )}
                </div>

                {status === "error" && (
                  <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm text-red-300">
                    No pudimos enviar el mensaje. Inténtalo de nuevo o escríbenos a{" "}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                      {CONTACT_EMAIL}
                    </a>
                    .
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-violet px-8 py-3.5 font-display text-sm font-semibold text-night-950 shadow-[0_0_28px_rgba(34,211,238,0.35)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_48px_rgba(167,139,250,0.5)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {status === "sending" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  )}
                  {status === "sending" ? "Enviando…" : "Iniciar mi Transformación Tecnológica"}
                </button>
              </form>
            )}
          </motion.div>

          {/* Canales directos */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-4 lg:col-span-2"
          >
            {/* Agendamiento */}
            <div className="flex-1 rounded-2xl border border-neon-cyan/20 bg-night-800/60 p-6 backdrop-blur">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neon-cyan/20 bg-neon-cyan/10">
                <CalendarCheck className="h-5 w-5 text-neon-cyan" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">
                Agenda tu demo directamente
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Elige el horario que mejor te convenga. Sesión de diagnóstico de
                30 minutos, sin costo.
              </p>
              {calendlyConfigured ? (
                showCalendly ? (
                  <iframe
                    src={`${CALENDLY_URL}?hide_gdpr_banner=1&background_color=0a0c14&text_color=e2e8f0&primary_color=22d3ee`}
                    title="Agendar demostración con Hellominus"
                    className="mt-4 h-[520px] w-full rounded-xl border border-white/10"
                    loading="lazy"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCalendly(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-neon-cyan/40 px-5 py-2.5 text-sm font-medium text-neon-cyan transition-all duration-300 hover:border-neon-cyan hover:bg-neon-cyan/10"
                  >
                    <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                    Ver horarios disponibles
                  </button>
                )
              ) : (
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Agendar demostración")}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-neon-cyan/40 px-5 py-2.5 text-sm font-medium text-neon-cyan transition-all duration-300 hover:border-neon-cyan hover:bg-neon-cyan/10"
                >
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  Solicitar horario por correo
                </a>
              )}
            </div>

            {/* WhatsApp */}
            {whatsappConfigured && (
              <div className="rounded-2xl border border-neon-emerald/20 bg-night-800/60 p-6 backdrop-blur">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neon-emerald/20 bg-neon-emerald/10">
                  <MessageCircle className="h-5 w-5 text-neon-emerald" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">
                  Escríbenos por WhatsApp
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Respuesta directa de nuestro equipo, sin bots de por medio.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-neon-emerald/40 px-5 py-2.5 text-sm font-medium text-neon-emerald transition-all duration-300 hover:border-neon-emerald hover:bg-neon-emerald/10"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Abrir WhatsApp
                </a>
              </div>
            )}

            {/* Email directo */}
            <div className="rounded-2xl border border-white/8 bg-night-800/60 p-6 backdrop-blur">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neon-violet/20 bg-neon-violet/10">
                <Mail className="h-5 w-5 text-neon-violet" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">
                Correo directo
              </h3>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-2 inline-block text-sm text-slate-400 transition-colors hover:text-neon-violet"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
