import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Filter, Calendar, DollarSign, Eye, Download, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Reservation {
  id: string;
  user_id: string;
  reservation_type: string;
  item_id: string;
  item_name: string;
  check_in: string;
  check_out: string | null;
  nights: number | null;
  guests: number;
  base_price: number;
  services_price: number;
  total_price: number;
  additional_services: any[];
  status: string;
  payment_status: string;
  payment_method: string | null;
  special_requests: string | null;
  created_at: string;
  users: {
    email: string;
    full_name?: string;
    phone?: string;
    city?: string;
    country?: string;
    document_number?: string;
  };
}

const AdminReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterStatus, filterType, filterPayment, reservations]);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          users(email, full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
      setFilteredReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reservations];

    // Search by name, email, or item name
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.users?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.reservation_type === filterType);
    }

    // Filter by payment status
    if (filterPayment !== 'all') {
      filtered = filtered.filter(r => r.payment_status === filterPayment);
    }

    setFilteredReservations(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmada' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completada' },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Reembolsada' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pendiente' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Pagado' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Fallido' },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Reembolsado' },
    };

    const conf = config[paymentStatus] || config.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${conf.bg} ${conf.text}`}>
        {conf.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        type === 'property' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        {type === 'property' ? 'Propiedad' : 'Tour'}
      </span>
    );
  };

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    revenue: reservations.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + r.total_price, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reservaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Gestión de Reservaciones
          </h1>
          <p className="text-gray-600 mt-2">
            Administra todas las reservaciones de propiedades y tours
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reservas</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
              <Calendar className="w-10 h-10 lg:w-12 lg:h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl lg:text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <Calendar className="w-10 h-10 lg:w-12 lg:h-12 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmadas</p>
                <p className="text-2xl lg:text-3xl font-bold text-green-600 mt-1">{stats.confirmed}</p>
              </div>
              <Calendar className="w-10 h-10 lg:w-12 lg:h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-800 mt-1">
                  ${stats.revenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-10 h-10 lg:w-12 lg:h-12 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-800">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre, email, servicio..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="cancelled">Cancelada</option>
                <option value="completed">Completada</option>
                <option value="refunded">Reembolsada</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="property">Propiedades</option>
                <option value="tour">Tours</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pago
              </label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="failed">Fallido</option>
                <option value="refunded">Reembolsado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          {filteredReservations.length > 0 ? (
            <>
              {/* Mobile View - Cards */}
              <div className="lg:hidden divide-y divide-gray-200">
                {filteredReservations.map((reservation) => (
                  <div key={reservation.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {reservation.item_name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {reservation.users?.full_name || reservation.users?.email}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {reservation.users?.phone}
                        </p>
                      </div>
                      {getStatusBadge(reservation.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Tipo</p>
                        {getTypeBadge(reservation.reservation_type)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pago</p>
                        {getPaymentBadge(reservation.payment_status)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Check-in</p>
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(reservation.check_in).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-sm font-bold text-gray-800">
                          ${reservation.total_price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <Link
                        to={`/admin/reservations/${reservation.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Link>
                      <button
                        onClick={() => {/* TODO: Download invoice */}}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Factura
                      </button>
                      <button
                        onClick={() => {/* TODO: Open chat */}}
                        className="flex items-center justify-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table */}
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
                        Check-in
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pago
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-800">
                            {reservation.users?.full_name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {reservation.users?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-800">
                            {reservation.item_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTypeBadge(reservation.reservation_type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(reservation.check_in).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {reservation.guests}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                          ${reservation.total_price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(reservation.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentBadge(reservation.payment_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/admin/reservations/${reservation.id}`}
                              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => {/* TODO: Download invoice */}}
                              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              title="Descargar factura"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {/* TODO: Open chat */}}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              title="Iniciar chat"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
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
              <p className="text-gray-500">No se encontraron reservaciones</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReservations;
