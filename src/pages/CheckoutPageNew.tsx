import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { ShoppingCart, User, CreditCard, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const CheckoutPageNew = () => {
  const navigate = useNavigate();
  const { items, itemCount, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    documentType: 'CC',
    documentNumber: '',
    country: 'Colombia',
    city: '',
    specialRequests: '',
    paymentMethod: 'pending', // pending, transfer, mercadopago
    terms: false
  });

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 lg:p-12 text-center">
            <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">
              No hay items en el carrito
            </h2>
            <p className="text-gray-600 mb-6">
              Agrega propiedades o tours a tu carrito antes de proceder al checkout
            </p>
            <button
              onClick={() => navigate('/properties')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Ver Propiedades
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.fullName || !formData.email || !formData.phone) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!formData.terms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    setLoading(true);

    try {
      // 1. Crear o buscar usuario
      let userId = user?.id;

      if (!userId) {
        // Crear usuario temporal en la tabla users
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            email: formData.email,
            full_name: formData.fullName,
            phone: formData.phone,
            document_type: formData.documentType,
            document_number: formData.documentNumber,
            country: formData.country,
            city: formData.city
          })
          .select()
          .single();

        if (userError) throw userError;
        userId = newUser.id;
      }

      // 2. Crear reservas para cada item del carrito
      const reservations = [];

      for (const item of items) {
        const reservation = {
          user_id: userId,
          reservation_type: item.type,
          item_id: item.itemId,
          item_name: item.itemName,
          check_in: item.checkIn,
          check_out: item.checkOut || null,
          nights: item.nights || null,
          guests: item.guests,
          base_price: item.basePrice,
          services_price: item.additionalServices?.reduce((sum, s) => sum + s.price, 0) || 0,
          total_price: item.totalPrice,
          additional_services: item.additionalServices || [],
          status: 'pending',
          payment_status: 'pending',
          payment_method: formData.paymentMethod,
          special_requests: formData.specialRequests || null
        };

        const { data, error: reservationError } = await supabase
          .from('reservations')
          .insert(reservation)
          .select()
          .single();

        if (reservationError) throw reservationError;
        reservations.push(data);
      }

      // 3. Guardar datos de reserva para la página de confirmación
      const reservationSummary = {
        propertyName: items[0]?.itemName || 'Hellominus',
        checkIn: items[0]?.checkIn ? new Date(items[0].checkIn).toLocaleDateString('es-CO') : '',
        checkOut: items[0]?.checkOut ? new Date(items[0].checkOut).toLocaleDateString('es-CO') : '',
        guests: items.reduce((sum, item) => sum + item.guests, 0),
        total: totalAmount,
        items: items.map(item => ({
          name: item.itemName,
          type: item.type,
          nights: item.nights,
          guests: item.guests,
          price: item.totalPrice
        }))
      };

      sessionStorage.setItem('lastReservation', JSON.stringify(reservationSummary));

      // 4. Limpiar carrito
      clearCart();

      // 5. Redirigir a página de confirmación de reserva
      navigate('/reservation-confirmation');

    } catch (err: any) {
      console.error('Error creating reservation:', err);
      setError(err.message || 'Hubo un error al procesar tu reserva. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">
          Finalizar Reserva
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
              {/* Información Personal */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información Personal
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+57 300 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Documento
                    </label>
                    <select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="Pasaporte">Pasaporte</option>
                      <option value="NIT">NIT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Documento
                    </label>
                    <input
                      type="text"
                      name="documentNumber"
                      value={formData.documentNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Colombia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Bogotá"
                    />
                  </div>
                </div>
              </div>

              {/* Solicitudes Especiales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Solicitudes Especiales (Opcional)
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Alergias, preferencias de habitación, etc..."
                />
              </div>

              {/* Método de Pago */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Información de Pago
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Importante:</strong> Tu reserva será confirmada sin pago inmediato. 
                    Te contactaremos para coordinar el método de pago que prefieras.
                  </p>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="pending"
                      checked={formData.paymentMethod === 'pending'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 text-sm font-medium">Pagar después (Te contactaremos)</span>
                  </label>
                </div>
              </div>

              {/* Términos */}
              <div>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Acepto los <a href="#" className="text-blue-600 hover:underline">términos y condiciones</a> y la <a href="#" className="text-blue-600 hover:underline">política de privacidad</a>
                  </span>
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirmar Reserva
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Resumen de tu Reserva
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="pb-4 border-b border-gray-200 last:border-0">
                    <div className="flex gap-3">
                      {item.imageUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-1">
                          {item.itemName}
                        </h3>
                        <p className="text-xs text-gray-500 mb-1">{item.city}</p>
                        <p className="text-xs text-gray-600">
                          {item.guests} {item.guests === 1 ? 'huésped' : 'huéspedes'}
                          {item.nights && ` • ${item.nights} ${item.nights === 1 ? 'noche' : 'noches'}`}
                        </p>
                        <p className="text-sm font-bold text-blue-600 mt-1">
                          ${item.totalPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-gray-800 mb-6">
                <span>Total</span>
                <span className="text-blue-600">${totalAmount.toLocaleString()}</span>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-green-800 mb-1">
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                  Sin pago inmediato
                </p>
                <p className="text-xs text-green-800 mb-1">
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                  Confirmación rápida
                </p>
                <p className="text-xs text-green-800">
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                  Cancelación flexible
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPageNew;
