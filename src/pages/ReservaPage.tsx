import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaUserFriends, FaDollarSign, FaExclamationCircle } from 'react-icons/fa';
import Background from '../components/Background';
import { formatCOP } from '../utils/format';

function calcularDias(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diff = outDate.getTime() - inDate.getTime();
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
}

const ReservaPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reserva = location.state?.reserva;

  // Formulario de usuario
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [errores, setErrores] = useState<string | null>(null);

  // Permitir editar personas y fechas
  const [guests, setGuests] = useState(reserva?.guests || 1);
  const [checkIn, setCheckIn] = useState(reserva?.checkIn || '');
  const [checkOut, setCheckOut] = useState(reserva?.checkOut || '');

  // Cálculo de días y precio total
  const dias = useMemo(() => calcularDias(checkIn, checkOut), [checkIn, checkOut]);
  // Busca el precio correcto según el número de personas
  const precioNoche = useMemo(() => {
    if (Array.isArray(reserva?.prices) && reserva.prices.length > 0) {
      const found = reserva.prices.find((p: any) => Number(p.people) === Number(guests));
      return found ? found.price : reserva.prices[0].price;
    }
    return 0;
  }, [reserva, guests]);

  const precioTotal = dias > 0 ? precioNoche * dias * guests : 0;

  if (!reserva) {
    return <div className="text-center py-16">No hay datos de reserva.</div>;
  }

  const handlePagar = async (e: React.FormEvent) => {
    e.preventDefault();

    // Construye el objeto de reserva (puede tener campos vacíos)
    const reservaData = {
      nombre,
      correo,
      telefono,
      direccion,
      propiedad_id: reserva.id,
      propiedad_nombre: reserva.propertyName,
      location: reserva.location,
      check_in: checkIn,
      check_out: checkOut,
      guests,
      precio_noche: precioNoche,
    };

    try {
      const response = await fetch('http://localhost:5000/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservaData),
      });
      const preFactura = await response.json();
      navigate('/pago', { state: { reservaId: preFactura.id } });
    } catch (err) {
      setErrores('No se pudo guardar la reserva. Intenta de nuevo.');
    }
  };

  const handleAgregarCarrito = () => {
    const carrito = JSON.parse(localStorage.getItem('carritoReservas') || '[]');
    carrito.push({
      ...reserva,
      guests,
      checkIn,
      checkOut,
      nombre,
      correo,
      telefono,
      direccion,
      precioTotal,
    });
    localStorage.setItem('carritoReservas', JSON.stringify(carrito));
    alert('Reserva guardada en tu carrito.');
    navigate('/carrito');
  };

  return (
    <Background>
      <div className="max-w-4xl mx-auto pt-28 pb-10 px-2">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-800 tracking-tight">Completa tu reserva</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Resumen de reserva */}
          <div className="md:col-span-1 bg-white rounded-2xl shadow-2xl p-8 mb-6 flex flex-col">
            <h2 className="text-lg font-bold mb-4 text-blue-800">Resumen de tu reserva</h2>
            <div className="flex flex-col items-center mb-4">
              <img
                src={reserva.image}
                alt="propiedad"
                className="w-44 h-32 object-cover rounded-xl border-4 border-white shadow-lg mb-2"
                style={{ transition: 'box-shadow 0.3s' }}
              />
              <span className="text-base font-semibold text-gray-700 text-center">{reserva.propertyName}</span>
            </div>
            <div className="space-y-2 text-gray-700 text-sm flex-1">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-500" />
                <span>{reserva.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" />
                <span>
                  <b>Check-in:</b> {checkIn || <span className="text-gray-400">Sin seleccionar</span>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" />
                <span>
                  <b>Check-out:</b> {checkOut || <span className="text-gray-400">Sin seleccionar</span>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaUserFriends className="text-blue-500" />
                <span>
                  <b>Personas:</b> {guests}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaDollarSign className="text-green-600" />
                <span>
                  <b>Precio/noche:</b> {formatCOP(precioNoche)}
                </span>
              </div>
              <div>
                <b>Noches:</b> {dias}
              </div>
            </div>
            <div className="border-t border-blue-200 my-4"></div>
            <div className="text-xl font-bold text-blue-700 flex items-center gap-2 transition-all duration-300">
              Total: <span className={precioTotal > 0 ? "animate-pulse" : ""}>{formatCOP(precioTotal)}</span>
            </div>
          </div>
          {/* Formulario de usuario */}
          <form className="md:col-span-2 bg-white rounded-2xl shadow-2xl p-8 space-y-6 flex flex-col justify-between" onSubmit={handlePagar}>
            <h2 className="text-lg font-bold mb-2 text-blue-800">Datos del huésped principal</h2>
            {errores && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-2">
                <FaExclamationCircle /> {errores}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Nombre completo</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Correo electrónico</label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Teléfono de contacto</label>
                <input
                  type="tel"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Dirección</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Check-in</label>
                <input
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Check-out</label>
                <input
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">Personas</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  min={1}
                  max={10}
                  value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-lg shadow hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <FaDollarSign /> Ir a pagar
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-100 text-blue-700 px-6 py-3 rounded-lg font-bold text-lg shadow hover:bg-gray-200 transition flex items-center justify-center gap-2"
                onClick={handleAgregarCarrito}
              >
                <FaUserFriends /> Guardar en carrito
              </button>
            </div>
          </form>
        </div>
      </div>
    </Background>
  );
};

export default ReservaPage;