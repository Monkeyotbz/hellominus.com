import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Building2, Map, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Reservation {
  id: string;
  user_id: string;
  reservation_type: string;
  item_id: string;
  item_name: string;
  check_in: string;
  check_out: string | null;
  guests: number;
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string;
  users: {
    email: string;
    full_name?: string;
  };
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    properties: 0,
    tours: 0,
    users: 0,
    bookings: 0,
  });
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [propertiesRes, toursRes, usersRes, reservationsRes] = await Promise.all([
          supabase.from('properties').select('id', { count: 'exact', head: true }),
          supabase.from('tours').select('id', { count: 'exact', head: true }),
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('reservations').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          properties: propertiesRes.count || 0,
          tours: toursRes.count || 0,
          users: usersRes.count || 0,
          bookings: reservationsRes.count || 0,
        });

        // Fetch recent reservations with user info
        const { data: reservationsData } = await supabase
          .from('reservations')
          .select(`
            *,
            users(email, full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        setReservations(reservationsData || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: 'Propiedades',
      value: stats.properties,
      icon: Building2,
      color: 'blue',
      bgColor: 'bg-blue-500',
    },
    {
      name: 'Tours',
      value: stats.tours,
      icon: Map,
      color: 'yellow',
      bgColor: 'bg-yellow-500',
    },
    {
      name: 'Usuarios',
      value: stats.users,
      icon: Users,
      color: 'red',
      bgColor: 'bg-red-500',
    },
    {
      name: 'Reservaciones',
      value: stats.bookings,
      icon: Calendar,
      color: 'green',
      bgColor: 'bg-green-500',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmada' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completada' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 lg:mb-8">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Bienvenido al Panel de Administración</h2>
        <p className="text-sm lg:text-base text-gray-600 mt-1">Aquí puedes gestionar todo el contenido de tu sitio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl shadow-md p-4 lg:p-6 border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs lg:text-sm font-medium">{stat.name}</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-800 mt-1 lg:mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 lg:p-4 rounded-lg`}>
                  <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-4 lg:p-6 border border-gray-100 mb-6 lg:mb-8">
        <h3 className="text-base lg:text-lg font-bold text-gray-800 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
          <Link
            to="/admin/properties"
            className="flex items-center gap-3 p-3 lg:p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Building2 className="w-7 h-7 lg:w-8 lg:h-8 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800 text-sm lg:text-base">Gestionar Propiedades</p>
              <p className="text-xs lg:text-sm text-gray-500">Ver, crear y editar</p>
            </div>
          </Link>
          <Link
            to="/admin/tours"
            className="flex items-center gap-3 p-3 lg:p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors"
          >
            <Map className="w-7 h-7 lg:w-8 lg:h-8 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800 text-sm lg:text-base">Gestionar Tours</p>
              <p className="text-xs lg:text-sm text-gray-500">Ver, crear y editar</p>
            </div>
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-3 p-3 lg:p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Users className="w-7 h-7 lg:w-8 lg:h-8 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800 text-sm lg:text-base">Gestionar Usuarios</p>
              <p className="text-xs lg:text-sm text-gray-500">Ver perfiles</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h3 className="text-base lg:text-lg font-bold text-gray-800">Reservaciones Recientes</h3>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Últimas 10 reservaciones realizadas</p>
        </div>
        
        {reservations.length > 0 ? (
          <>
            {/* Vista móvil - Tarjetas */}
            <div className="lg:hidden divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">
                        {reservation.item_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{reservation.users?.email || 'N/A'}</p>
                    </div>
                    {getStatusBadge(reservation.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <p className="text-xs text-gray-500">Tipo</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${
                        reservation.reservation_type === 'property' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reservation.reservation_type === 'property' ? 'Propiedad' : 'Tour'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fecha</p>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(reservation.check_in).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Huéspedes</p>
                      <p className="text-sm font-medium text-gray-800">{reservation.guests}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-sm font-bold text-gray-800">${reservation.total_price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista desktop - Tabla */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Entrada
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Huéspedes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {reservation.users?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {reservation.item_name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          reservation.reservation_type === 'property' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reservation.reservation_type === 'property' ? 'Propiedad' : 'Tour'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(reservation.check_in).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {reservation.guests}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        ${reservation.total_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(reservation.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay reservaciones aún</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
