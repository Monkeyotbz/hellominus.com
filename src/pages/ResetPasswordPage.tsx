import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { buttonClasses } from '../site/ui';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(`Error: ${error.message || 'El link puede haber expirado. Pedí uno nuevo.'}`);
    } else {
      navigate('/login', { state: { message: 'Contraseña actualizada. Ya podés iniciar sesión.' } });
    }
  };

  const inputCls =
    'w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <img src="/brand/login-bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/55" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-6 flex justify-center">
          <img src="/brand/logo.svg" alt="Hellominus" className="h-11 w-auto" />
        </Link>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-[24px] border border-white/40 bg-white/90 p-7 shadow-pop backdrop-blur-md sm:p-9"
        >
          <div className="text-center">
            <h1 className="font-sans text-2xl font-bold text-ink sm:text-3xl">Elegí tu nueva contraseña</h1>
          </div>

          {error && (
            <div className="rounded-xl border border-alert/25 bg-alert/10 px-4 py-2.5 text-sm text-alert">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                Contraseña nueva
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-ink">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputCls}
                placeholder="Repetí tu contraseña"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className={buttonClasses('primary', 'lg', 'w-full')}>
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
