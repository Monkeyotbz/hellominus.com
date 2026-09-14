import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, AlertCircle } from 'lucide-react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'Colombia',
    terms: false
  });
  const [error, setError] = useState<string | null>(null);

  // Obtener datos de la reserva
  const reservationData = JSON.parse(sessionStorage.getItem('reservationData') || '{}');

  if (!reservationData.propertyId) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[110px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No hay reserva seleccionada</p>
          <button
            onClick={() => navigate('/properties')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Volver a propiedades
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.fullName || !formData.email || !formData.phone) {
        setError('Por favor completa todos los campos');
        setLoading(false);
        return;
      }

      if (!formData.terms) {
        setError('Debes aceptar los términos y condiciones');
        setLoading(false);
        return;
      }

      // Para esta fase, simular pago exitoso
      // En producción, aquí harías la integración real con Stripe
      
      const confirmationData = {
        ...reservationData,
        customerData: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country
        },
        confirmationId: `RES-${Date.now()}`,
        paymentStatus: 'completed',
        timestamp: new Date().toISOString()
      };

      // Guardar en sessionStorage
      sessionStorage.setItem('confirmationData', JSON.stringify(confirmationData));

      // Limpiar datos de reserva
      sessionStorage.removeItem('reservationData');

      // Redirigir a confirmación
      navigate('/booking-confirmation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const { priceBreakdown } = reservationData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-[110px]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Confirmación de pago</h1>
            <p className="text-gray-600">Completa tus datos para finalizar la reserva</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Formulario */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handlePayment} className="space-y-6">
                  {/* Información personal */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      👤 Información personal
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Juan Carlos Pérez"
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="tu@email.com"
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+57 300 1234567"
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          País
                        </label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition"
                        >
                          <option>Colombia</option>
                          <option>Perú</option>
                          <option>Ecuador</option>
                          <option>Venezuela</option>
                          <option>México</option>
                          <option>Argentina</option>
                          <option>Chile</option>
                          <option>Otro</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Método de pago */}
                  <div className="border-t-2 pt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      💳 Método de pago
                    </h3>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                      <p className="font-semibold mb-2">✓ Pago seguro con Stripe</p>
                      <p>Tus datos de tarjeta están protegidos con encriptación de nivel bancario. No almacenamos información de tu tarjeta.</p>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <p className="text-gray-700 mb-3 font-semibold">Simulación para esta fase:</p>
                      <p className="text-sm text-gray-600 mb-3">
                        Esta es una demo de pago. Usa el número de tarjeta <strong>4242 4242 4242 4242</strong> con cualquier fecha futura y CVC.
                      </p>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition font-mono"
                          defaultValue="4242 4242 4242 4242"
                          readOnly
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition font-mono"
                            defaultValue="12/25"
                            readOnly
                          />
                          <input
                            type="text"
                            placeholder="CVC"
                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition font-mono"
                            defaultValue="123"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Términos */}
                  <div className="border-t-2 pt-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="terms"
                        checked={formData.terms}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 mt-1 cursor-pointer"
                        required
                      />
                      <span className="text-gray-700 text-sm">
                        Acepto los <strong>términos y condiciones</strong>, <strong>política de privacidad</strong> y entiendo que la reserva es no reembolsable según la política de cancelación.
                      </span>
                    </label>
                  </div>

                  {/* Botón de pago */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-lg transition text-lg shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Procesando pago...
                      </span>
                    ) : (
                      `Pagar $${(priceBreakdown?.grandTotal || priceBreakdown?.totalPrice || 0).toLocaleString('es-CO')}`
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Resumen */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-32 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-700">
                      <span className="font-semibold">{reservationData.propertyName}</span>
                    </div>

                    <div className="border-t pt-3 space-y-1 text-gray-600">
                      <div className="flex justify-between">
                        <span>📅 Entrada:</span>
                        <span>{new Date(reservationData.checkIn).toLocaleDateString('es-CO')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>📅 Salida:</span>
                        <span>{new Date(reservationData.checkOut).toLocaleDateString('es-CO')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>👥 Huéspedes:</span>
                        <span>{reservationData.guests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🌙 Noches:</span>
                        <span>{priceBreakdown?.nights}</span>
                      </div>
                    </div>

                    {priceBreakdown?.services.length > 0 && (
                      <div className="border-t pt-3 space-y-1 text-gray-600">
                        {priceBreakdown.services.map((s: any, i: number) => (
                          <div key={i} className="flex justify-between">
                            <span>{s.name}</span>
                            <span>${s.price.toLocaleString('es-CO')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t-2 pt-6">
                  {priceBreakdown && (
                    <div className="space-y-3 mb-6">
                      <h3 className="font-semibold text-gray-900">Desglose de precios</h3>
                      
                      {/* Precio base */}
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>${priceBreakdown.pricePerNight?.toLocaleString('es-CO')} × {priceBreakdown.nights} noches</span>
                        <span className="font-medium">${priceBreakdown.basePrice?.toLocaleString('es-CO')}</span>
                      </div>

                      {/* Descuentos */}
                      {priceBreakdown.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>{priceBreakdown.discountReason}</span>
                          <span>-${priceBreakdown.discountAmount.toLocaleString('es-CO')}</span>
                        </div>
                      )}

                      {/* Subtotal */}
                      <div className="flex justify-between text-sm font-medium pt-2 border-t">
                        <span>Subtotal</span>
                        <span>${priceBreakdown.subtotal?.toLocaleString('es-CO')}</span>
                      </div>

                      {/* Cargos */}
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Cargo por limpieza</span>
                        <span>${priceBreakdown.cleaningFee?.toLocaleString('es-CO')}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Cargo por servicio</span>
                        <span>${priceBreakdown.serviceFee?.toLocaleString('es-CO')}</span>
                      </div>

                      {/* IVA */}
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>IVA (19%)</span>
                        <span>${priceBreakdown.ivaAmount?.toLocaleString('es-CO')}</span>
                      </div>

                      {/* Impuesto turístico */}
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Impuesto turístico</span>
                        <span>${priceBreakdown.tourismTax?.toLocaleString('es-CO')}</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-semibold">Total a pagar</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${priceBreakdown?.grandTotal?.toLocaleString('es-CO') || priceBreakdown?.totalPrice?.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Pago único en COP</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-3 rounded-lg">
                    <Heart className="w-4 h-4" />
                    <span>Garantía de satisfacción al 100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
