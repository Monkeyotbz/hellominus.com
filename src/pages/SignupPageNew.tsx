import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { buttonClasses } from '../site/ui';
import Wordmark from '../site/Wordmark';

export default function SignupPageNew() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Página que mandó a registrarse (p. ej. /anfitriones); se pasa también al login.
  const from = (location.state as { from?: { pathname: string } } | null)?.from;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!formData.fullName.trim()) {
      setError('El nombre completo es requerido');
      return;
    }

    setLoading(true);

    const { error, hasSession } = await signUp(formData.email, formData.password, formData.fullName);

    if (error) {
      setError(
        (error as { message?: string }).message === 'User already registered'
          ? 'Este email ya está registrado'
          : 'Error al crear la cuenta. Intenta de nuevo.'
      );
      setLoading(false);
    } else if (hasSession) {
      // Sin confirmación de correo: ya tiene sesión, sigue a donde iba.
      navigate(from?.pathname ?? '/cuenta', { replace: true });
    } else {
      navigate('/login', {
        state: { message: 'Te enviamos un correo para confirmar tu cuenta. Después inicia sesión aquí.', from },
      });
    }
  };

  const inputCls =
    'w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25';
  const labelCls = 'mb-1.5 block text-sm font-medium text-ink';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <img src="/portada/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/55" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-6 flex justify-center">
          <Wordmark light className="text-2xl" />
        </Link>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-[24px] border border-white/40 bg-white/90 p-7 shadow-pop backdrop-blur-md sm:p-9"
        >
          <div className="text-center">
            <h1 className="font-sans text-2xl font-bold text-ink sm:text-3xl">Crear cuenta</h1>
            <p className="mt-1.5 text-sm text-muted">Sumate y empezá a reservar</p>
          </div>

          {error && (
            <div className="rounded-xl border border-alert/25 bg-alert/10 px-4 py-2.5 text-sm text-alert">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className={labelCls}>
                Nombre completo
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className={inputCls}
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label htmlFor="email" className={labelCls}>
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={inputCls}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className={labelCls}>
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={inputCls}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelCls}>
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputCls}
                placeholder="Repetí tu contraseña"
              />
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted">
            Al crear una cuenta, aceptás nuestros{' '}
            <Link to="/terminos" className="font-medium text-brand hover:text-brand-hover">
              Términos y Condiciones
            </Link>{' '}
            y{' '}
            <Link to="/privacidad" className="font-medium text-brand hover:text-brand-hover">
              Política de Privacidad
            </Link>
          </p>

          <button type="submit" disabled={loading} className={buttonClasses('primary', 'lg', 'w-full')}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-muted">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" state={{ from }} className="font-semibold text-brand hover:text-brand-hover">
              Iniciá sesión acá
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
