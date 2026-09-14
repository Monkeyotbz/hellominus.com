import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { buttonClasses } from '../site/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        console.error('Error de login:', error);

        // Mensajes de error más específicos
        if (error.message?.includes('Invalid login credentials')) {
          setError('Email o contraseña incorrectos');
        } else if (error.message?.includes('Email not confirmed')) {
          setError('Por favor confirma tu email antes de iniciar sesión');
        } else if (error.message?.includes('User not found')) {
          setError('No existe una cuenta con ese email');
        } else {
          setError(`Error: ${error.message || 'Intenta de nuevo'}`);
        }
        setLoading(false);
      } else {
        // Redirigir a /admin si es staff (editor/admin)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          if (prof?.role === 'admin' || prof?.role === 'editor') {
            navigate('/admin');
            return;
          }
        }
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <img
        src="/brand/login-bg.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
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
            <h1 className="font-sans text-2xl font-bold text-ink sm:text-3xl">Bienvenido de nuevo</h1>
            <p className="mt-1.5 text-sm text-muted">Iniciá sesión para gestionar tus reservas</p>
          </div>

          {error && (
            <div className="rounded-xl border border-alert/25 bg-alert/10 px-4 py-2.5 text-sm text-alert">
              {error}
            </div>
          )}

          <div className="space-y-4">
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

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-ink">
                  Contraseña
                </label>
                <Link to="/recuperar-contrasena" className="text-sm font-medium text-brand hover:text-brand-hover">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className={buttonClasses('primary', 'lg', 'w-full')}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <p className="text-center text-sm text-muted">
            ¿No tenés cuenta?{' '}
            <Link to="/registro" className="font-semibold text-brand hover:text-brand-hover">
              Registrate acá
            </Link>
          </p>
        </form>

        <div className="mt-5 text-center">
          <Link to="/" className="text-sm text-white/80 hover:text-white">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
