import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  ArrowLeft, Calendar, Users, DollarSign, CreditCard, 
  MessageSquare, Download, Check, X, Clock, AlertCircle,
  User, Phone, Mail, MapPin, FileText
} from 'lucide-react';
import Invoice from '../components/Invoice';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  };
}

const ReservationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  // Update status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    fetchReservation();
    fetchMessages();
  }, [id]);
  const downloadPDF = async () => {
    if (!invoiceRef.current || !reservation) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Factura-${reservation.id.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF');
    }
  };
  const fetchReservation = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          users(email, full_name, phone, city, country)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setReservation(data);
    } catch (error) {
      console.error('Error fetching reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    // TODO: Implementar cuando se cree la tabla de mensajes
    setMessages([]);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || !reservation) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', reservation.id);

      if (error) throw error;

      setReservation({ ...reservation, status: newStatus });
      setShowStatusModal(false);
      alert('Estado actualizado exitosamente');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    }
  };

  const handleUpdatePayment = async () => {
    if (!reservation) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ 
          payment_status: 'paid',
          payment_method: paymentMethod,
          payment_id: paymentReference
        })
        .eq('id', reservation.id);

      if (error) throw error;

      setReservation({ 
        ...reservation, 
        payment_status: 'paid',
        payment_method: paymentMethod 
      });
      setShowPaymentModal(false);
      alert('Pago registrado exitosamente');
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Error al registrar el pago');
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    // TODO: Implementar sistema de mensajes
    alert('Sistema de mensajería en desarrollo');
    setChatMessage('');
  };

  const openWhatsApp = () => {
    if (!reservation?.users?.phone) {
      alert('No hay número de teléfono asociado');
      return;
    }
    
    // Limpiar número (quitar espacios, guiones, etc.)
    const cleanPhone = reservation.users.phone.replace(/[^0-9+]/g, '');
    const message = encodeURIComponent(
      `Hola ${reservation.users.full_name || 'Cliente'}, te contacto sobre tu reserva #${reservation.id.slice(0, 8)} de ${reservation.item_name}.`
    );
    
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const sendEmail = () => {
    if (!reservation?.users?.email) {
      alert('No hay email asociado');
      return;
    }
    
    const subject = encodeURIComponent(`Reserva #${reservation.id.slice(0, 8)} - ${reservation.item_name}`);
    const body = encodeURIComponent(
      `Hola ${reservation.users.full_name || 'Cliente'},\n\nTe contacto sobre tu reserva:\n\nServicio: ${reservation.item_name}\nCheck-in: ${new Date(reservation.check_in).toLocaleDateString('es-ES')}\nHuéspedes: ${reservation.guests}\n\nSaludos,\nHellominus`
    );
    
    window.location.href = `mailto:${reservation.users.email}?subject=${subject}&body=${body}`;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente', icon: Clock },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmada', icon: Check },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada', icon: X },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completada', icon: Check },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Reembolsada', icon: AlertCircle },
    };

    const conf = config[status] || config.pending;
    const Icon = conf.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${conf.bg} ${conf.text}`}>
        <Icon className="w-4 h-4" />
        {conf.label}
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
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${conf.bg} ${conf.text}`}>
        {conf.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reservación...</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reservación no encontrada</h2>
          <button
            onClick={() => navigate('/admin/reservations')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a Reservaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/reservations')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Reservaciones
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                Detalle de Reservación
              </h1>
              <p className="text-gray-600 mt-1">
                ID: {reservation.id.slice(0, 8)}...
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={sendEmail}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span className="hidden sm:inline">Email</span>
              </button>
              <button
                onClick={openWhatsApp}
                disabled={!reservation.users.phone}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Phone className="w-5 h-5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="hidden sm:inline">Chat</span>
              </button>
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Factura PDF</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & Payment */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Estado</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Estado de Reserva</p>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(reservation.status)}
                    <button
                      onClick={() => {
                        setNewStatus(reservation.status);
                        setShowStatusModal(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Estado de Pago</p>
                  <div className="flex items-center justify-between">
                    {getPaymentBadge(reservation.payment_status)}
                    {reservation.payment_status === 'pending' && (
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Registrar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reservation Details */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Detalles de la Reservación</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Servicio</p>
                    <p className="font-semibold text-gray-800">{reservation.item_name}</p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      reservation.reservation_type === 'property' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reservation.reservation_type === 'property' ? 'Propiedad' : 'Tour'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Check-in</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(reservation.check_in).toLocaleDateString('es-ES', { 
                          weekday: 'short',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {reservation.check_out && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Check-out</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(reservation.check_out).toLocaleDateString('es-ES', { 
                            weekday: 'short',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Huéspedes</p>
                      <p className="font-semibold text-gray-800">{reservation.guests} personas</p>
                    </div>
                  </div>

                  {reservation.nights && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Noches</p>
                        <p className="font-semibold text-gray-800">{reservation.nights} noches</p>
                      </div>
                    </div>
                  )}
                </div>

                {reservation.special_requests && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800 mb-1 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Solicitudes Especiales
                    </p>
                    <p className="text-sm text-yellow-700">{reservation.special_requests}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Details */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Desglose de Precios
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Precio Base</span>
                  <span className="font-semibold">${reservation.base_price.toLocaleString()}</span>
                </div>

                {reservation.services_price > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Servicios Adicionales</span>
                    <span className="font-semibold">${reservation.services_price.toLocaleString()}</span>
                  </div>
                )}

                {reservation.additional_services && reservation.additional_services.length > 0 && (
                  <div className="pl-4 space-y-1">
                    {reservation.additional_services.map((service: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm text-gray-600">
                        <span>• {service.name}</span>
                        <span>${service.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-blue-600">${reservation.total_price.toLocaleString()}</span>
                  </div>
                </div>

                {reservation.payment_method && (
                  <div className="pt-2 border-t border-gray-100 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CreditCard className="w-4 h-4" />
                      <span>Método de pago: <span className="font-semibold">{reservation.payment_method}</span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Información del Cliente</h2>
              
              <div className="space-y-3">
                {reservation.users.full_name && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Nombre</p>
                      <p className="font-medium text-gray-800">{reservation.users.full_name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-800 break-all">{reservation.users.email}</p>
                  </div>
                </div>

                {reservation.users.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Teléfono</p>
                      <p className="font-medium text-gray-800">{reservation.users.phone}</p>
                    </div>
                  </div>
                )}

                {(reservation.users.city || reservation.users.country) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Ubicación</p>
                      <p className="font-medium text-gray-800">
                        {[reservation.users.city, reservation.users.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
              
              <div className="space-y-2">
                <button
                  onClick={sendEmail}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  <Mail className="w-4 h-4" />
                  Enviar Email
                </button>
                
                <button
                  onClick={openWhatsApp}
                  disabled={!reservation.users.phone}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Phone className="w-4 h-4" />
                  WhatsApp
                  {!reservation.users.phone && <span className="text-xs ml-auto">(Sin número)</span>}
                </button>
                
                <button
                  onClick={() => setShowChat(true)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat Interno
                </button>
                
                <button
                  onClick={downloadPDF}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  Descargar Factura
                </button>
              </div>
            </div>

            {/* Reservation Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Historial</h2>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Reserva Creada</p>
                    <p className="text-xs text-gray-500">
                      {new Date(reservation.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
                {/* TODO: Add more timeline events */}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-green-600 text-white">
              <h3 className="font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat con Cliente
              </h3>
              <button
                onClick={() => setShowChat(false)}
                className="p-1 hover:bg-green-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No hay mensajes aún</p>
                  <p className="text-xs mt-1">Inicia la conversación</p>
                </div>
              ) : (
                messages.map((_msg, idx) => (
                  <div key={idx} className="mb-3">
                    {/* TODO: Render messages */}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Cambiar Estado</h3>
              
              <div className="space-y-2 mb-6">
                {['pending', 'confirmed', 'cancelled', 'completed', 'refunded'].map((status) => (
                  <label key={status} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={newStatus === status}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-4 h-4"
                    />
                    {getStatusBadge(status)}
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Registrar Pago</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="transfer">Transferencia</option>
                    <option value="mercadopago">Mercado Pago</option>
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referencia de Pago (Opcional)
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Ej: TRX123456"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdatePayment}
                  disabled={!paymentMethod}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Pago
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Invoice for PDF Generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {reservation && <Invoice ref={invoiceRef} reservation={reservation} />}
      </div>
    </div>
  );
};

export default ReservationDetail;
