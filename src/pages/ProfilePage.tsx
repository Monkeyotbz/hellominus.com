import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, Calendar, MapPin, CreditCard, MessageSquare, Mail, Eye, DollarSign } from 'lucide-react';

interface Reservation {
  id: string;
  item_name: string;
  item_id: string;
  reservation_type: string;
  check_in: string;
  check_out: string | null;
  guests: number;
  total_price: number;
  base_price: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadReservations();
  }, [user, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
      });
    }
  }, [profile]);

  const loadReservations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await updateProfile(formData);
    if (!error) {
      setEditing(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const handleContactSupport = () => {
    // WhatsApp de soporte
    const supportPhone = '';
    const message = encodeURIComponent(
      `Hola, necesito ayuda con mi reserva. Usuario: ${user?.email}`
    );
    window.open(`https://wa.me/${supportPhone}?text=${message}`, '_blank');
  };

  const handlePayment = (reservationId: string) => {
    // Navegar a página de pago
    navigate(`/payment/${reservationId}`);
  };

  const handleDeleteReservation = async (reservationId: string, itemName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la reserva "${itemName}"?\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationId)
        .eq('user_id', user?.id); // Seguridad extra

      if (error) throw error;

      // Actualizar la lista de reservas
      setReservations(prev => prev.filter(r => r.id !== reservationId));
      
      alert('Reserva eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
      alert('Error al eliminar la reserva. Por favor intenta nuevamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile?.full_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile?.full_name}</h1>
                <p className="text-gray-600">{user?.email}</p>
                {profile?.city && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {profile.city}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Información del perfil */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Mi Información
              </h2>

              {!editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Nombre completo</label>
                    <p className="font-medium">{profile?.full_name || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Teléfono</label>
                    <p className="font-medium">{profile?.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Ciudad</label>
                    <p className="font-medium">{profile?.city || 'No especificado'}</p>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Editar perfil
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-700 block mb-1">Nombre completo</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 block mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 block mb-1">Ciudad</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Reservas */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Mis Reservas
              </h2>

              {reservations.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">Aún no tienes reservas</p>
                  <Link
                    to="/properties"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Explorar propiedades
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="border-2 border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800 mb-1">
                            {reservation.item_name}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              reservation.reservation_type === 'property' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {reservation.reservation_type === 'property' ? '🏠 Hospedaje' : '✈️ Tour'}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(reservation.status)}`}>
                              {reservation.status === 'pending' && '⏳ Pendiente'}
                              {reservation.status === 'confirmed' && '✅ Confirmado'}
                              {reservation.status === 'cancelled' && '❌ Cancelado'}
                              {reservation.status === 'completed' && '✔️ Completado'}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPaymentBadge(reservation.payment_status)}`}>
                              {reservation.payment_status === 'pending' && '💳 Pago Pendiente'}
                              {reservation.payment_status === 'paid' && '✅ Pagado'}
                              {reservation.payment_status === 'failed' && '⚠️ Pago Fallido'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Check-in</p>
                            <p className="font-semibold text-sm text-gray-800">
                              {formatDate(reservation.check_in)}
                            </p>
                          </div>
                        </div>
                        {reservation.check_out && (
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Check-out</p>
                              <p className="font-semibold text-sm text-gray-800">
                                {formatDate(reservation.check_out)}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Huéspedes</p>
                            <p className="font-semibold text-sm text-gray-800">
                              {reservation.guests} persona{reservation.guests !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <DollarSign className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="font-bold text-sm text-blue-600">
                              {formatPrice(reservation.total_price)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Link
                          to={`/booking-confirmation?id=${reservation.id}`}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Ver Detalles</span>
                          <span className="sm:hidden">Ver</span>
                        </Link>
                        
                        {reservation.payment_status === 'pending' && reservation.status === 'pending' && (
                          <button
                            onClick={() => handlePayment(reservation.id)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span className="hidden sm:inline">Pagar Ahora</span>
                            <span className="sm:hidden">Pagar</span>
                          </button>
                        )}
                        
                        <button
                          onClick={handleContactSupport}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="hidden sm:inline">Soporte</span>
                          <span className="sm:hidden">Chat</span>
                        </button>
                        
                        {reservation.status === 'pending' && reservation.payment_status === 'pending' ? (
                          <button
                            onClick={() => handleDeleteReservation(reservation.id, reservation.item_name)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            <Mail className="w-4 h-4" />
                            <span className="hidden sm:inline">Eliminar</span>
                            <span className="sm:hidden">✕</span>
                          </button>
                        ) : (
                          <a
                            href={`mailto:contacto@hellominus.com?subject=Reserva ${reservation.id.slice(0, 8)}`}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                          >
                            <Mail className="w-4 h-4" />
                            <span className="hidden sm:inline">Email</span>
                            <span className="sm:hidden">Mail</span>
                          </a>
                        )}
                      </div>

                      {/* Payment Alert */}
                      {reservation.payment_status === 'pending' && reservation.status === 'pending' && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <span className="font-medium">
                              ⚠️ Completa tu pago para confirmar la reserva
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
