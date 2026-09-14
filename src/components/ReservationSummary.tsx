import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FileText, Calendar, Users, MapPin, CreditCard, Tag, Download } from 'lucide-react';

interface ReservationSummaryProps {
  reservationId: string;
}

interface ReservationDetail {
  id: string;
  reservation_number: string;
  item_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  
  // Precios
  price_per_night: number;
  base_price: number;
  discount_percentage: number;
  discount_amount: number;
  discount_reason: string;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  total_before_taxes: number;
  iva_percentage: number;
  iva_amount: number;
  tourism_tax: number;
  total_taxes: number;
  grand_total: number;
  
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
}

export default function ReservationSummary({ reservationId }: ReservationSummaryProps) {
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservation();
  }, [reservationId]);

  const loadReservation = async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single();

    if (error) {
      console.error('Error loading reservation:', error);
      return;
    }

    setReservation(data);
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const downloadInvoice = () => {
    // Aquí se implementaría la generación del PDF
    alert('Generando factura...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-600">No se encontró la reservación</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Resumen de Reservación</h2>
            <p className="text-blue-100">Número: {reservation.reservation_number}</p>
          </div>
          {getStatusBadge(reservation.status)}
        </div>
      </div>

      {/* Detalles de la reserva */}
      <div className="p-8 space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Alojamiento
            </h3>
            <p className="text-gray-700 font-medium">{reservation.item_name}</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Fechas
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in:</span>
                <span className="font-medium">{formatDate(reservation.check_in)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-medium">{formatDate(reservation.check_out)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Noches:</span>
                <span className="font-medium">{reservation.nights}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Huéspedes
            </h3>
            <p className="text-gray-700 font-medium">{reservation.guests} {reservation.guests === 1 ? 'persona' : 'personas'}</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Pago
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`font-medium ${
                  reservation.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {reservation.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                </span>
              </div>
              {reservation.payment_method && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Método:</span>
                  <span className="font-medium capitalize">{reservation.payment_method}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desglose de precios */}
        <div className="border-t-2 border-gray-200 pt-6">
          <h3 className="font-bold text-xl text-gray-900 mb-6">Desglose de Precios</h3>
          
          <div className="space-y-3">
            {/* Precio base */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                {formatCurrency(reservation.price_per_night)} × {reservation.nights} {reservation.nights === 1 ? 'noche' : 'noches'}
              </span>
              <span className="font-medium">{formatCurrency(reservation.base_price)}</span>
            </div>

            {/* Descuentos */}
            {reservation.discount_amount > 0 && (
              <div className="flex justify-between items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm font-medium">{reservation.discount_reason}</span>
                </div>
                <span className="font-semibold">-{formatCurrency(reservation.discount_amount)}</span>
              </div>
            )}

            {/* Subtotal */}
            <div className="flex justify-between items-center py-2 border-t border-gray-200">
              <span className="text-gray-700 font-medium">Subtotal</span>
              <span className="font-semibold">{formatCurrency(reservation.subtotal)}</span>
            </div>

            {/* Cargos adicionales */}
            <div className="space-y-2 bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Cargos adicionales:</p>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cargo por limpieza</span>
                <span className="text-gray-700">{formatCurrency(reservation.cleaning_fee)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cargo por servicio</span>
                <span className="text-gray-700">{formatCurrency(reservation.service_fee)}</span>
              </div>
            </div>

            {/* Impuestos */}
            <div className="space-y-2 bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-sm font-medium text-amber-900 mb-2">Impuestos:</p>
              
              <div className="flex justify-between text-sm">
                <span className="text-amber-800">IVA ({reservation.iva_percentage}%)</span>
                <span className="text-amber-900">{formatCurrency(reservation.iva_amount)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-amber-800">Impuesto turístico</span>
                <span className="text-amber-900">{formatCurrency(reservation.tourism_tax)}</span>
              </div>
              
              <div className="flex justify-between text-sm font-medium pt-2 border-t border-amber-300">
                <span className="text-amber-900">Total impuestos</span>
                <span className="text-amber-900">{formatCurrency(reservation.total_taxes)}</span>
              </div>
            </div>

            {/* Total final */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mt-4">
              <div className="flex justify-between items-center text-white">
                <span className="text-xl font-bold">Total a pagar</span>
                <span className="text-3xl font-bold">{formatCurrency(reservation.grand_total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={downloadInvoice}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            Descargar Factura
          </button>
          
          <button
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Imprimir
          </button>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Nota:</strong> Esta reservación fue creada el {formatDate(reservation.created_at)}. 
            Para cualquier consulta o modificación, por favor contacta a nuestro equipo de soporte.
          </p>
        </div>
      </div>
    </div>
  );
}
