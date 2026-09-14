import { useState, useEffect } from 'react';
import { X, Calendar, Users, Plus, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'property' | 'tour';
  itemId: string;
  itemName: string;
  city: string;
  basePrice: number;
  maxGuests?: number;
  imageUrl?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  extraGuestFee?: number;
  baseGuests?: number;
}

const AddToCartModal = ({
  isOpen,
  onClose,
  type,
  itemId,
  itemName,
  city,
  basePrice,
  maxGuests = 10,
  imageUrl,
  initialCheckIn = '',
  initialCheckOut = '',
  initialGuests = 1,
  extraGuestFee = 30000,
  baseGuests = 2
}: AddToCartModalProps) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [showSuccess, setShowSuccess] = useState(false);

  // Actualizar valores cuando cambien las props
  useEffect(() => {
    if (isOpen) {
      setCheckIn(initialCheckIn);
      setCheckOut(initialCheckOut);
      setGuests(initialGuests);
    }
  }, [isOpen, initialCheckIn, initialCheckOut, initialGuests]);

  // Calcular noches y precio total
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const nights = type === 'property' ? calculateNights() : undefined;
  const subtotal = type === 'property' && nights ? basePrice * nights : basePrice;
  
  // Cargo por huéspedes adicionales
  const extraGuests = Math.max(0, guests - baseGuests);
  const guestFee = type === 'property' && nights ? extraGuests * extraGuestFee * nights : 0;
  
  const serviceFee = subtotal * 0.05;
  const cleaningFee = type === 'property' ? 50000 : 0;
  const tax = subtotal * 0.19;
  const totalPrice = subtotal + guestFee + serviceFee + cleaningFee + tax;

  // Debug: mostrar cálculo en consola
  console.log('=== CÁLCULO DE PRECIO ===');
  console.log('Base price por noche:', basePrice);
  console.log('Noches:', nights);
  console.log('Subtotal:', subtotal);
  console.log('Huéspedes:', guests, '| Base huéspedes:', baseGuests, '| Extra:', extraGuests);
  console.log('Cargo por huéspedes:', guestFee);
  console.log('Service fee (5%):', serviceFee);
  console.log('Cleaning fee:', cleaningFee);
  console.log('Tax (19%):', tax);
  console.log('TOTAL FINAL:', totalPrice);
  console.log('========================');

  const handleAddToCart = () => {
    if (!checkIn) {
      alert('Por favor selecciona la fecha de inicio');
      return;
    }

    if (type === 'property' && !checkOut) {
      alert('Por favor selecciona la fecha de salida');
      return;
    }

    addItem({
      type,
      itemId,
      itemName,
      checkIn,
      checkOut: type === 'property' ? checkOut : undefined,
      guests,
      nights,
      basePrice,
      totalPrice,
      imageUrl,
      city
    });

    // Mostrar mensaje de éxito
    setShowSuccess(true);
    
    // Cerrar modal después de 1.5 segundos
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  const handleAddAndCheckout = () => {
    if (!checkIn) {
      alert('Por favor selecciona la fecha de inicio');
      return;
    }

    if (type === 'property' && !checkOut) {
      alert('Por favor selecciona la fecha de salida');
      return;
    }

    addItem({
      type,
      itemId,
      itemName,
      checkIn,
      checkOut: type === 'property' ? checkOut : undefined,
      guests,
      nights,
      basePrice,
      totalPrice,
      imageUrl,
      city
    });

    navigate('/cart');
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : today;

  // Si se está mostrando el mensaje de éxito, mostrar solo eso
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Agregado exitosamente!
          </h3>
          <p className="text-gray-600">
            El item se agregó a tu carrito
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold text-white">Agregar a tu reserva</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Información del item */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex gap-4">
              {imageUrl && (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={imageUrl} alt={itemName} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-base line-clamp-2 mb-1">
                  {itemName}
                </h3>
                <p className="text-sm text-gray-500">{city}</p>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  ${basePrice.toLocaleString()}/{type === 'property' ? 'noche' : 'persona'}
                </p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="space-y-4">
            {/* Fecha de inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                {type === 'property' ? 'Fecha de entrada' : 'Fecha del tour'}
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={today}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Fecha de salida (solo propiedades) */}
            {type === 'property' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Fecha de salida
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={tomorrow}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Número de huéspedes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />
                {type === 'property' ? 'Huéspedes' : 'Personas'}
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                >
                  −
                </button>
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, Math.min(maxGuests, parseInt(e.target.value) || 1)))}
                  min="1"
                  max={maxGuests}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Máximo {maxGuests} {type === 'property' ? 'huéspedes' : 'personas'}
              </p>
            </div>

            {/* Resumen detallado */}
            {nights !== undefined && nights > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-gray-900 mb-3">Desglose de precios</h4>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    ${basePrice.toLocaleString()} × {nights} {nights === 1 ? 'noche' : 'noches'}
                  </span>
                  <span className="font-medium">${subtotal.toLocaleString()}</span>
                </div>

                {extraGuests > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {extraGuests} {extraGuests === 1 ? 'huésped adicional' : 'huéspedes adicionales'} × ${extraGuestFee.toLocaleString()}
                    </span>
                    <span className="font-medium">${guestFee.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cargo por servicio (5%)</span>
                  <span className="font-medium">${serviceFee.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cargo por limpieza</span>
                  <span className="font-medium">${cleaningFee.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA (19%)</span>
                  <span className="font-medium">${tax.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-base font-bold text-gray-800 pt-3 border-t border-gray-300">
                  <span>Total</span>
                  <span className="text-blue-600">${totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Precio total por {nights} {nights === 1 ? 'noche' : 'noches'}
                </p>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleAddAndCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Ir al Carrito
            </button>
            <button
              onClick={handleAddToCart}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
