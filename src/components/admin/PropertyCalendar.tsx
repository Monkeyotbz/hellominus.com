import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../../supabaseClient';
import { X, DollarSign, Lock, ExternalLink, User, Users, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BlockDatesModal from '../BlockDatesModal';
import SpecialPriceModal from '../SpecialPriceModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface PropertyCalendarProps {
  propertyId: string;
  propertyName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'booking' | 'blocked' | 'special_price';
  data?: any;
}

const PropertyCalendar = ({ propertyId, propertyName, isOpen, onClose }: PropertyCalendarProps) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [basePrice, setBasePrice] = useState(0);

  useEffect(() => {
    if (isOpen && propertyId) {
      fetchCalendarData();
    }
  }, [isOpen, propertyId]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      // Obtener información de la propiedad (precio base)
      const { data: property } = await supabase
        .from('properties')
        .select('price_per_night')
        .eq('id', propertyId)
        .single();
      
      if (property) {
        setBasePrice(property.price_per_night);
      }

      // Obtener reservas desde la tabla correcta "reservations"
      const { data: reservations } = await supabase
        .from('reservations')
        .select('*')
        .eq('item_id', propertyId)
        .eq('reservation_type', 'property')
        .neq('status', 'cancelled');

      // Obtener fechas bloqueadas
      const { data: blocked } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('property_id', propertyId);

      // Obtener precios especiales
      const { data: specialPrices } = await supabase
        .from('special_pricing')
        .select('*')
        .eq('property_id', propertyId)
        .eq('active', true);

      const allEvents: CalendarEvent[] = [];

      // Agregar reservas al calendario
      reservations?.forEach(reservation => {
        allEvents.push({
          id: reservation.id,
          title: `${reservation.user_name || 'Cliente'} - ${reservation.guests} huéspedes`,
          start: new Date(reservation.check_in),
          end: new Date(reservation.check_out),
          type: 'booking',
          data: reservation,
        });
      });

      // Agregar fechas bloqueadas
      blocked?.forEach(block => {
        allEvents.push({
          id: block.id,
          title: `Bloqueado - ${block.reason || 'Sin razón'}`,
          start: new Date(block.start_date),
          end: new Date(block.end_date),
          type: 'blocked',
          data: block,
        });
      });

      // Agregar precios especiales
      specialPrices?.forEach(price => {
        allEvents.push({
          id: price.id,
          title: `$${price.price_per_night.toLocaleString()} - ${price.reason || 'Precio especial'}`,
          start: new Date(price.start_date),
          end: new Date(price.end_date),
          type: 'special_price',
          data: price,
        });
      });

      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    
    switch (event.type) {
      case 'booking':
        backgroundColor = '#10b981'; // Verde
        break;
      case 'blocked':
        backgroundColor = '#ef4444'; // Rojo
        break;
      case 'special_price':
        backgroundColor = '#f59e0b'; // Amarillo
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block',
      },
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full h-[95vh] sm:h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{propertyName}</h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">Calendario de Disponibilidad</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowBlockModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm"
            >
              <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Bloquear</span>
            </button>
            <button
              onClick={() => setShowPriceModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-xs sm:text-sm"
            >
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Precio</span>
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Leyenda */}
        <div className="px-3 sm:px-6 py-2 sm:py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded flex-shrink-0"></div>
            <span className="text-xs sm:text-sm text-gray-700">Reservas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded flex-shrink-0"></div>
            <span className="text-xs sm:text-sm text-gray-700">Bloqueado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded flex-shrink-0"></div>
            <span className="text-xs sm:text-sm text-gray-700">Precio Especial</span>
          </div>
        </div>

        {/* Calendario */}
        <div className="flex-1 p-2 sm:p-6 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={(event: CalendarEvent) => setSelectedEvent(event)}
              culture="es"
              messages={{
                next: 'Sig.',
                previous: 'Ant.',
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                agenda: 'Agenda',
                date: 'Fecha',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'No hay eventos',
                showMore: (total: number) => `+${total}`,
              }}
            />
          )}
        </div>

        {/* Modal de Detalles del Evento */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header del Modal */}
              <div className={`px-4 sm:px-6 py-4 rounded-t-xl ${
                selectedEvent.type === 'booking' ? 'bg-gradient-to-r from-green-600 to-green-700' :
                selectedEvent.type === 'blocked' ? 'bg-gradient-to-r from-red-600 to-red-700' :
                'bg-gradient-to-r from-yellow-600 to-yellow-700'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {selectedEvent.type === 'booking' ? '📅 Reservación' : 
                       selectedEvent.type === 'blocked' ? '🔒 Fecha Bloqueada' : 
                       '💰 Precio Especial'}
                    </h3>
                    {selectedEvent.type === 'booking' && selectedEvent.data && (
                      <p className="text-white text-opacity-90 text-sm mt-1">
                        #{selectedEvent.data.reservation_number || selectedEvent.id.slice(0, 8)}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="text-white hover:text-gray-200 transition p-1"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
                {/* Fechas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Check-in</p>
                    <p className="font-semibold text-gray-900">{format(selectedEvent.start, 'dd/MM/yyyy', { locale: es })}</p>
                    <p className="text-xs text-gray-500">{format(selectedEvent.start, 'EEEE', { locale: es })}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600 font-medium mb-1">Check-out</p>
                    <p className="font-semibold text-gray-900">{format(selectedEvent.end, 'dd/MM/yyyy', { locale: es })}</p>
                    <p className="text-xs text-gray-500">{format(selectedEvent.end, 'EEEE', { locale: es })}</p>
                  </div>
                </div>

                {/* Detalles de Reservación */}
                {selectedEvent.type === 'booking' && selectedEvent.data && (
                  <div className="space-y-3">
                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">Información del Cliente</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Nombre:</span>
                          <span className="font-medium text-sm">{selectedEvent.data.user_name || 'No especificado'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Email:</span>
                          <span className="font-medium text-sm truncate max-w-[200px]">{selectedEvent.data.user_email || 'No especificado'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Teléfono:</span>
                          <span className="font-medium text-sm">{selectedEvent.data.user_phone || 'No especificado'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-gray-900">Detalles de la Estadía</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Huéspedes:</span>
                          <span className="font-medium text-sm">{selectedEvent.data.guests} personas</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Noches:</span>
                          <span className="font-medium text-sm">{selectedEvent.data.nights || 1} noches</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                        <h4 className="font-semibold text-gray-900">Información de Pago</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total:</span>
                          <span className="font-bold text-lg text-green-600">
                            ${(selectedEvent.data.grand_total || selectedEvent.data.total_price || 0).toLocaleString('es-CO')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Estado de Pago:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            selectedEvent.data.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                            selectedEvent.data.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedEvent.data.payment_status === 'paid' ? 'Pagado' :
                             selectedEvent.data.payment_status === 'pending' ? 'Pendiente' : 
                             'No pagado'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Estado:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            selectedEvent.data.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            selectedEvent.data.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            selectedEvent.data.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedEvent.data.status === 'confirmed' ? 'Confirmada' :
                             selectedEvent.data.status === 'pending' ? 'Pendiente' :
                             selectedEvent.data.status === 'completed' ? 'Completada' :
                             selectedEvent.data.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botón para ver detalles completos */}
                    <button
                      onClick={() => {
                        navigate(`/admin/reservations/${selectedEvent.id}`);
                        setSelectedEvent(null);
                        onClose();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver Detalles Completos de la Reservación
                    </button>
                  </div>
                )}

                {/* Detalles de Precio Especial */}
                {selectedEvent.type === 'special_price' && selectedEvent.data && (
                  <div className="border-t pt-3">
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">Precio por Noche</p>
                      <p className="font-bold text-2xl text-yellow-600">
                        ${selectedEvent.data.price_per_night?.toLocaleString('es-CO')}
                      </p>
                      {selectedEvent.data.reason && (
                        <p className="text-sm text-gray-600 mt-2">
                          Razón: {selectedEvent.data.reason}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Detalles de Bloqueo */}
                {selectedEvent.type === 'blocked' && selectedEvent.data && (
                  <div className="border-t pt-3">
                    <div className="bg-red-50 rounded-lg p-4">
                      {selectedEvent.data.reason && (
                        <>
                          <p className="text-sm text-gray-600 mb-1">Razón del Bloqueo</p>
                          <p className="font-medium text-gray-900">{selectedEvent.data.reason}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Botón Cerrar (solo para eventos que no son reservaciones) */}
                {selectedEvent.type !== 'booking' && (
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modales */}
        <BlockDatesModal
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          propertyId={propertyId}
          propertyName={propertyName}
          onSuccess={fetchCalendarData}
        />
        <SpecialPriceModal
          isOpen={showPriceModal}
          onClose={() => setShowPriceModal(false)}
          propertyId={propertyId}
          propertyName={propertyName}
          basePrice={basePrice}
          onSuccess={fetchCalendarData}
        />
      </div>
    </div>
  );
};

export default PropertyCalendar;
