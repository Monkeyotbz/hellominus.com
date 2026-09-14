import { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Send, Calendar, DollarSign, User, MapPin, Hash } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

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
  status: string;
  payment_status: string;
}

interface PaymentConfirmationModalProps {
  reservation: Reservation;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentConfirmationModal({ reservation, onClose, onSuccess }: PaymentConfirmationModalProps) {
  const { user, profile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [sending, setSending] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen (JPG, PNG, etc.)');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setVoucherFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setVoucherPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadVoucher = async (): Promise<string | null> => {
    if (!voucherFile || !user) return null;

    setUploading(true);
    try {
      const fileExt = voucherFile.name.split('.').pop();
      const fileName = `${user.id}/${reservation.reservation_number}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('vouchers')
        .upload(fileName, voucherFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('vouchers')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading voucher:', error);
      alert('Error al subir el comprobante');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!voucherFile) {
      alert('Por favor selecciona el comprobante de pago');
      return;
    }

    setSending(true);
    try {
      // 1. Subir comprobante
      const voucherUrl = await uploadVoucher();
      if (!voucherUrl) {
        setSending(false);
        return;
      }

      // 2. Actualizar reserva con URL del comprobante
      const { error: updateError } = await supabase
        .from('reservations')
        .update({ 
          payment_receipt_url: voucherUrl,
          payment_status: 'pending_verification',
          updated_at: new Date().toISOString()
        })
        .eq('id', reservation.id);

      if (updateError) throw updateError;

      // 3. Calcular noches
      const checkIn = new Date(reservation.check_in);
      const checkOut = reservation.check_out ? new Date(reservation.check_out) : null;
      const nights = checkOut 
        ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        : 1;

      // 4. Formatear mensaje para WhatsApp
      const message = `🎉 *CONFIRMACIÓN DE PAGO RECIBIDA*

📋 *Número de Reserva:* ${reservation.reservation_number}

👤 *DATOS DEL CLIENTE*
• Nombre: ${profile?.full_name || 'No especificado'}
• Email: ${user?.email || 'No especificado'}
• Teléfono: ${profile?.phone || 'No especificado'}

🏨 *DATOS DE LA RESERVA*
• ${reservation.reservation_type === 'property' ? 'Propiedad' : 'Tour'}: ${reservation.item_name}
• Check-in: ${new Date(reservation.check_in).toLocaleDateString('es-CO', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}${checkOut ? `
• Check-out: ${checkOut.toLocaleDateString('es-CO', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
• Noches: ${nights}` : ''}
• Huéspedes: ${reservation.guests}

💰 *VALOR TOTAL*
$${reservation.total_price.toLocaleString('es-CO')} COP

📄 *COMPROBANTE DE PAGO*
${voucherUrl}

${notes ? `📝 *Notas adicionales:*
${notes}` : ''}

⏰ *Fecha de envío:* ${new Date().toLocaleString('es-CO')}

✅ Por favor verificar el pago y confirmar la reserva.`;

      // 5. Abrir WhatsApp
      const adminPhone = '';
      const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      // 6. Mostrar éxito y cerrar
      alert('¡Comprobante enviado exitosamente! Te contactaremos pronto para confirmar tu reserva.');
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la confirmación');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Confirmación de Pago</h2>
              <p className="text-blue-100 text-sm">Envía tu comprobante de transferencia</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Número de Reserva Destacado */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Número de Reserva</p>
                <p className="text-2xl font-bold text-blue-600">{reservation.reservation_number}</p>
              </div>
            </div>
          </div>

          {/* Datos del Cliente */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Tus Datos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Nombre</p>
                <p className="font-semibold text-gray-900">{profile?.full_name || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{user?.email || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-gray-600">Teléfono</p>
                <p className="font-semibold text-gray-900">{profile?.phone || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-gray-600">Ciudad</p>
                <p className="font-semibold text-gray-900">{profile?.city || 'No especificado'}</p>
              </div>
            </div>
          </div>

          {/* Datos de la Reserva */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Detalles de la Reserva
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">
                  {reservation.reservation_type === 'property' ? 'Propiedad' : 'Tour'}
                </span>
                <span className="font-semibold text-gray-900">{reservation.item_name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Check-in
                </span>
                <span className="font-semibold text-gray-900">{formatDate(reservation.check_in)}</span>
              </div>
              {reservation.check_out && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Check-out
                  </span>
                  <span className="font-semibold text-gray-900">{formatDate(reservation.check_out)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Huéspedes</span>
                <span className="font-semibold text-gray-900">{reservation.guests} persona{reservation.guests !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-blue-50 -mx-4 px-4 rounded-lg mt-3">
                <span className="text-gray-900 font-bold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Total a Pagar
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ${reservation.total_price.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>
          </div>

          {/* Upload de Comprobante */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Comprobante de Transferencia
            </h3>
            
            {!voucherPreview ? (
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">
                    Click para seleccionar el comprobante
                  </p>
                  <p className="text-sm text-gray-500">
                    Imagen del comprobante de transferencia (máx 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={voucherPreview}
                  alt="Comprobante"
                  className="w-full rounded-xl border-2 border-green-500"
                />
                <button
                  onClick={() => {
                    setVoucherFile(null);
                    setVoucherPreview('');
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Comprobante cargado
                </div>
              </div>
            )}
          </div>

          {/* Notas Adicionales */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notas adicionales (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Transferencia realizada desde cuenta Bancolombia terminada en 1234..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Información Bancaria */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-2">Datos para transferencia:</p>
                <p>• Banco: Bancolombia</p>
                <p>• Tipo: Ahorros</p>
                <p>• Número: 123-456789-01</p>
                <p>• Titular: Hellominus</p>
              </div>
            </div>
          </div>

          {/* Botón de Envío */}
          <button
            onClick={handleSubmit}
            disabled={!voucherFile || uploading || sending}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
          >
            {uploading || sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {uploading ? 'Subiendo comprobante...' : 'Enviando...'}
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar Confirmación por WhatsApp
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
