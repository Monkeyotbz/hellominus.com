import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { buttonClasses } from '../site/ui';
import Wordmark from '../site/Wordmark';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/restablecer-contrasena`,
    });

    setLoading(false);
    if (error) {
      setError(`Error: ${error.message || 'Intenta de nuevo'}`);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <img src="/portada/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/55" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-6 flex justify-center">
          <Wordmark light className="text-2xl" />
        </Link>

        <div className="space-y-5 rounded-[24px] border border-white/40 bg-white/90 p-7 shadow-pop backdrop-blur-md sm:p-9">
          <div className="text-center">
            <h1 className="font-sans text-2xl font-bold text-ink sm:text-3xl">Recuperar contraseña</h1>
            <p className="mt-1.5 text-sm text-muted">
              Ingresá tu email y te mandamos un link para elegir una contraseña nueva.
            </p>
          </div>

          {sent ? (
            <div className="rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-ink">
              Si <b>{email}</b> tiene una cuenta con nosotros, te llegó un correo con el link para restablecer la
              contraseña.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-alert/25 bg-alert/10 px-4 py-2.5 text-sm text-alert">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
                  placeholder="tu@email.com"
                />
              </div>

              <button type="submit" disabled={loading} className={buttonClasses('primary', 'lg', 'w-full')}>
                {loading ? 'Enviando...' : 'Mandar link de recuperación'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-muted">
            <Link to="/login" className="font-semibold text-brand hover:text-brand-hover">
              ← Volver a iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
