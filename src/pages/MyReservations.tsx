import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Users, FileText, Download } from 'lucide-react';
import ReservationSummary from '../components/ReservationSummary';

interface Reservation {
  id: string;
  reservation_number: string;
  item_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  grand_total: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function MyReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReservations();
    }
  }, [user]);

  const loadReservations = async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading reservations:', error);
      return;
    }

    setReservations(data || []);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[110px]">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Debes iniciar sesión para ver tus reservaciones</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedReservation) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[110px]">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => setSelectedReservation(null)}
            className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            ← Volver a mis reservaciones
          </button>
          <ReservationSummary reservationId={selectedReservation} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[110px]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Mis Reservaciones</h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No tienes reservaciones</h2>
              <p className="text-gray-600 mb-6">Explora nuestras propiedades y haz tu primera reserva</p>
              <button
                onClick={() => window.location.href = '/properties'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Ver Propiedades
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{reservation.item_name}</h3>
                          {getStatusBadge(reservation.status)}
                        </div>
                        <p className="text-sm text-gray-500">#{reservation.reservation_number}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(reservation.grand_total)}
                        </div>
                        <p className={`text-sm font-medium ${
                          reservation.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {reservation.payment_status === 'paid' ? 'Pagado' : 'Pendiente de pago'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <div className="text-sm">
                          <p className="font-medium">Check-in</p>
                          <p>{formatDate(reservation.check_in)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <div className="text-sm">
                          <p className="font-medium">Check-out</p>
                          <p>{formatDate(reservation.check_out)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <div className="text-sm">
                          <p className="font-medium">Huéspedes</p>
                          <p>{reservation.guests} {reservation.guests === 1 ? 'persona' : 'personas'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedReservation(reservation.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        <FileText className="w-4 h-4" />
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => alert('Descargando factura...')}
                        className="flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                      >
                        <Download className="w-4 h-4" />
                        Factura
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
