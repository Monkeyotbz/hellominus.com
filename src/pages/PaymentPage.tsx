import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { 
  CreditCard, Building2, DollarSign, Calendar, Users, 
  ArrowLeft, Check, AlertCircle, Phone, Mail, MessageSquare,
  Copy
} from 'lucide-react';

interface Reservation {
  id: string;
  item_name: string;
  reservation_type: string;
  check_in: string;
  check_out: string | null;
  guests: number;
  total_price: number;
  base_price: number;
  services_price: number;
  status: string;
  payment_status: string;
}

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'mercadopago' | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReservation();
  }, [id]);

  const loadReservation = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setReservation(data);
    } catch (error) {
      console.error('Error loading reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('1234567890');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContactSupport = () => {
    const supportPhone = '';
    const message = encodeURIComponent(
      `Hola, necesito ayuda con mi pago. Reserva ID: ${id?.slice(0, 8)}`
    );
    window.open(`https://wa.me/${supportPhone}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información de pago...</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reservación no encontrada</h2>
          <button
            onClick={() => navigate('/profile')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a Mi Perfil
          </button>
        </div>
      </div>
    );
  }

  if (reservation.payment_status === 'paid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pago Completado!</h2>
          <p className="text-gray-600 mb-6">Esta reserva ya está pagada.</p>
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Mis Reservas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a Mi Perfil
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            Completa tu Pago
          </h1>
          <p className="text-gray-600">
            Selecciona un método de pago para confirmar tu reserva
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transferencia */}
            <div
              onClick={() => setPaymentMethod('transfer')}
              className={`bg-white rounded-xl p-6 cursor-pointer transition-all border-2 ${
                paymentMethod === 'transfer'
                  ? 'border-blue-600 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Transferencia Bancaria</h3>
                    <p className="text-sm text-gray-500">Paga desde tu banco</p>
                  </div>
                </div>
                {paymentMethod === 'transfer' && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {paymentMethod === 'transfer' && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Datos Bancarios:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Banco:</span>
                        <span className="font-medium">Bancolombia</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo de Cuenta:</span>
                        <span className="font-medium">Ahorros</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Número de Cuenta:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">1234567890</span>
                          <button
                            onClick={handleCopyAccount}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Copiar número"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Titular:</span>
                        <span className="font-medium">Hellominus</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">NIT:</span>
                        <span className="font-medium">900.XXX.XXX-X</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Importante:</strong> Después de realizar la transferencia, envíanos el comprobante por WhatsApp 
                      para confirmar tu reserva.
                    </p>
                  </div>

                  <button
                    onClick={handleContactSupport}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Enviar Comprobante por WhatsApp
                  </button>
                </div>
              )}
            </div>

            {/* Mercado Pago */}
            <div
              onClick={() => setPaymentMethod('mercadopago')}
              className={`bg-white rounded-xl p-6 cursor-pointer transition-all border-2 ${
                paymentMethod === 'mercadopago'
                  ? 'border-blue-600 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Mercado Pago</h3>
                    <p className="text-sm text-gray-500">Tarjeta o PSE</p>
                  </div>
                </div>
                {paymentMethod === 'mercadopago' && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {paymentMethod === 'mercadopago' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Próximamente:</strong> Integración con Mercado Pago en desarrollo.
                      Por ahora, usa transferencia bancaria.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Reservation Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-xl sticky top-24">
              <h3 className="font-bold text-lg mb-4">Resumen de Reserva</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Servicio</p>
                  <p className="font-semibold">{reservation.item_name}</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    reservation.reservation_type === 'property' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reservation.reservation_type === 'property' ? 'Hospedaje' : 'Tour'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {new Date(reservation.check_in).toLocaleDateString('es-ES')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {reservation.guests} huésped{reservation.guests !== 1 ? 'es' : ''}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Precio base</span>
                  <span className="font-medium">
                    ${reservation.base_price.toLocaleString()} COP
                  </span>
                </div>
                {reservation.services_price > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Servicios</span>
                    <span className="font-medium">
                      ${reservation.services_price.toLocaleString()} COP
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-bold text-lg">Total a Pagar</span>
                  <span className="font-bold text-lg text-blue-600">
                    ${reservation.total_price.toLocaleString()} COP
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                  ¿Necesitas ayuda? Contáctanos
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleContactSupport}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>
                  <a
                    href="mailto:contacto@hellominus.com"
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="hidden sm:inline">Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
