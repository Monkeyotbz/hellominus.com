import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  User, LogOut, Calendar as CalendarIcon, MapPin, CreditCard, 
  MessageSquare, Mail, Eye, DollarSign, Settings, 
  Heart, TrendingUp, Clock, CheckCircle, 
  Edit3, Package, Bell, X
} from 'lucide-react';
import PaymentConfirmationModal from '../components/PaymentConfirmationModal';
import ChatBot from '../components/ChatBot';
import AvatarUpload from '../components/AvatarUpload';

interface Reservation {
  id: string;
  reservation_number: string;
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

type TabType = 'overview' | 'reservations' | 'calendar' | 'favorites' | 'settings';

export default function ProfilePageNew() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [editing, setEditing] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
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
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const loadReservations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'cancelled')
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

  const handleContactSupport = () => {
    setShowChat(true);
  };

  const handlePayment = (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation) {
      setSelectedReservation(reservation);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      console.log('Cancelando reserva:', reservationId);
      
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId);

      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }

      console.log('Reserva cancelada en BD, actualizando UI...');
      
      // Eliminar de la lista inmediatamente
      setReservations(prev => {
        const filtered = prev.filter(r => r.id !== reservationId);
        console.log('Reservas después de filtrar:', filtered.length);
        return filtered;
      });
      
      alert('✅ Reserva cancelada exitosamente');
    } catch (error: any) {
      console.error('Error completo al cancelar:', error);
      alert('❌ Error: ' + (error.message || 'No se pudo cancelar la reserva'));
    }
  };

  // Estadísticas
  const stats = {
    total: reservations.length,
    upcoming: reservations.filter(r => 
      r.status === 'confirmed' && new Date(r.check_in) > new Date()
    ).length,
    completed: reservations.filter(r => r.status === 'completed').length,
    totalSpent: reservations
      .filter(r => r.payment_status === 'paid')
      .reduce((sum, r) => sum + r.total_price, 0),
  };

  // Próxima reserva
  const nextReservation = reservations.find(r => 
    r.status === 'confirmed' && new Date(r.check_in) > new Date()
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
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

  const tabs = [
    { id: 'overview' as TabType, name: 'Resumen', icon: TrendingUp },
    { id: 'reservations' as TabType, name: 'Mis Reservas', icon: Package },
    { id: 'calendar' as TabType, name: 'Calendario', icon: CalendarIcon },
    { id: 'favorites' as TabType, name: 'Favoritos', icon: Heart },
    { id: 'settings' as TabType, name: 'Configuración', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Profesional - SIN BANNER */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28">
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-md ring-2 ring-white/70 bg-gray-100">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-red-600 flex items-center justify-center text-white text-3xl font-bold">
                      {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-3 -right-3 z-10">
                  <div className="shadow-lg rounded-full overflow-hidden bg-white">
                    <AvatarUpload
                      currentAvatarUrl={avatarUrl}
                      onUploadComplete={(url) => setAvatarUrl(url)}
                    />
                  </div>
                </div>
              </div>

              {/* Name & Info - TOTALMENTE VISIBLE */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {profile?.full_name || 'Usuario'}
                </h1>
                <p className="text-gray-600 flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                {profile?.city && (
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4" />
                    {profile.city}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 sm:mt-0">
              <button
                onClick={handleContactSupport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Soporte</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Reservas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Próximas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completadas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Gastado</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(stats.totalSpent)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 mb-8">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Próxima Reserva Destacada */}
            {nextReservation && (
              <div className="bg-white border-2 border-blue-600 rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-blue-600 text-sm font-semibold mb-1 uppercase tracking-wide">Próximo Viaje</p>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{nextReservation.item_name}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {formatDate(nextReservation.check_in)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {nextReservation.guests} {nextReservation.guests === 1 ? 'persona' : 'personas'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(nextReservation.total_price)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/booking-confirmation?id=${nextReservation.id}`)}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Ver Detalles
                  </button>
                  {nextReservation.payment_status === 'pending' && (
                    <button
                      onClick={() => handlePayment(nextReservation.id)}
                      className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Completar Pago
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Actividad Reciente */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Actividad Reciente
              </h3>
              <div className="space-y-3">
                {reservations.slice(0, 5).map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border border-gray-100"
                    onClick={() => {
                      sessionStorage.setItem('lastReservation', JSON.stringify({
                        propertyName: reservation.item_name,
                        checkIn: new Date(reservation.check_in).toLocaleDateString('es-CO'),
                        checkOut: reservation.check_out ? new Date(reservation.check_out).toLocaleDateString('es-CO') : '',
                        guests: reservation.guests,
                        total: reservation.total_price
                      }));
                      navigate('/reservation-confirmation');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-lg">
                        {reservation.reservation_type === 'property' ? '🏠' : '✈️'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{reservation.item_name}</p>
                        <p className="text-sm text-gray-500">{formatDate(reservation.check_in)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatPrice(reservation.total_price)}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getPaymentBadge(reservation.payment_status)}`}>
                        {reservation.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="grid grid-cols-1 gap-6">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center text-2xl">
                        {reservation.reservation_type === 'property' ? '🏠' : '✈️'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{reservation.item_name}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(reservation.status)}`}>
                            {reservation.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentBadge(reservation.payment_status)}`}>
                            {reservation.payment_status === 'paid' ? 'Pagado' : 'Pago Pendiente'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-blue-600" />
                            <span>{formatDate(reservation.check_in)}</span>
                          </div>
                          {reservation.check_out && (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-blue-600" />
                              <span>{formatDate(reservation.check_out)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span>{reservation.guests} {reservation.guests === 1 ? 'huésped' : 'huéspedes'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-blue-600" />
                            <span className="font-bold text-gray-900">{formatPrice(reservation.total_price)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        sessionStorage.setItem('lastReservation', JSON.stringify({
                          propertyName: reservation.item_name,
                          checkIn: new Date(reservation.check_in).toLocaleDateString('es-CO'),
                          checkOut: reservation.check_out ? new Date(reservation.check_out).toLocaleDateString('es-CO') : '',
                          guests: reservation.guests,
                          total: reservation.total_price
                        }));
                        navigate('/reservation-confirmation');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Instrucciones</span>
                    </button>
                    {reservation.payment_status === 'pending' && (
                      <button
                        onClick={() => handlePayment(reservation.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Pagar</span>
                      </button>
                    )}
                    <button
                      onClick={handleContactSupport}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Soporte</span>
                    </button>
                    {reservation.status === 'pending' && (
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
                    )}
                  </div>
                </div>

                {reservation.status === 'pending' && reservation.payment_status === 'pending' && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                    <div className="text-blue-600 mt-0.5">ℹ️</div>
                    <p className="text-sm text-blue-900">
                      <strong>Acción requerida:</strong> Por favor completa el pago para confirmar tu reserva.
                    </p>
                  </div>
                )}
              </div>
            ))}

            {reservations.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No tienes reservas aún</h3>
                <p className="text-gray-600 mb-6">¡Explora nuestras propiedades y tours para comenzar tu aventura!</p>
                <button
                  onClick={() => navigate('/properties')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Explorar Ahora
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              Vista de Calendario
            </h3>
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="font-medium text-gray-600">Vista de calendario próximamente</p>
              <p className="text-sm">Podrás ver todas tus reservas en un calendario interactivo</p>
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-600" />
              Mis Favoritos
            </h3>
            <div className="text-center py-12 text-gray-500">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="font-medium text-gray-600">No tienes favoritos guardados</p>
              <p className="text-sm">Guarda tus propiedades y tours favoritos para encontrarlos fácilmente</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Configuración de Cuenta
            </h3>

            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Nombre</p>
                    <p className="font-semibold text-gray-900">{profile?.full_name || 'No especificado'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">{user?.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                    <p className="font-semibold text-gray-900">{profile?.phone || 'No especificado'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Ciudad</p>
                    <p className="font-semibold text-gray-900">{profile?.city || 'No especificado'}</p>
                  </div>
                </div>

                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar Perfil
                </button>

                <hr className="my-6 border-gray-200" />

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 mb-3">Preferencias de Notificaciones</h4>
                  
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">Notificaciones por email</span>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" defaultChecked />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors border border-gray-100">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">Notificaciones por WhatsApp</span>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">Ofertas y promociones</span>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" defaultChecked />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

      {/* Payment Confirmation Modal */}
      {selectedReservation && (
        <PaymentConfirmationModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onSuccess={() => {
            loadReservations();
            setSelectedReservation(null);
          }}
        />
      )}

      {/* Chat Bot */}
      {showChat && <ChatBot onClose={() => setShowChat(false)} />}
      </div>
  );
}
