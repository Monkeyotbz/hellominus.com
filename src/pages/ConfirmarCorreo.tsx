import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ConfirmarCorreo: React.FC = () => {
  const [mensaje, setMensaje] = useState('Confirmando tu correo...');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMensaje('Token inválido.'); 
      return;
    }

    fetch(`http://localhost:5000/api/confirmar-correo?token=${token}`)
      .then(async (res) => {
        if (res.ok) {
          setMensaje('¡Correo confirmado correctamente! Ya puedes iniciar sesión.');
          setTimeout(() => navigate('/login'), 3500);
        } else {
          const text = await res.text();
          setMensaje(text || 'Enlace inválido o expirado.');
        }
      })
      .catch(() => setMensaje('Error al confirmar el correo.'));
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md w-full">
        <img
          src="/brand/logo.svg"
          alt="Logo Hellominus"
          className="mx-auto mb-6 w-24 h-24 object-contain"
        />
        <h2 className="text-2xl font-extrabold text-green-700 mb-2">¡Bienvenido a Hellominus!</h2>
        <p className="text-gray-700 mb-6">
          {mensaje}
        </p>
        <div className="flex justify-center">
          <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        >
          Ir al inicio de sesión
        </button>
        <p className="text-sm text-gray-500 mt-3">
          Serás redirigido al inicio de sesión en unos segundos...
        </p>
      </div>
    </div>
  );
};

export default ConfirmarCorreo;