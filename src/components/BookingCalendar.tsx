import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { addDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Users } from 'lucide-react';

interface BookingCalendarProps {
  pricePerNight: number;
  maxGuests: number;
  onDateChange?: (checkIn: Date | null, checkOut: Date | null, guests: number) => void;
  onTotalChange?: (total: number, nights: number) => void;
  extraGuestFee?: number; // Cargo por huésped adicional
  baseGuests?: number; // Número de huéspedes incluidos en el precio base
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  pricePerNight,
  maxGuests,
  onDateChange,
  onTotalChange,
  extraGuestFee = 30000, // $30.000 por defecto por huésped adicional
  baseGuests = 2 // 2 huéspedes incluidos por defecto
}) => {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);

  const handleCheckInChange = (date: Date | null) => {
    setCheckIn(date);
    if (date && checkOut && date >= checkOut) {
      setCheckOut(addDays(date, 1));
    }
    if (onDateChange) {
      onDateChange(date, checkOut, guests);
    }
  };

  const handleCheckOutChange = (date: Date | null) => {
    setCheckOut(date);
    if (onDateChange && checkIn) {
      onDateChange(checkIn, date, guests);
    }
  };

  const handleGuestsChange = (newGuests: number) => {
    setGuests(newGuests);
    if (onDateChange && checkIn) {
      onDateChange(checkIn, checkOut, newGuests);
    }
  };

  // Cálculo de precios
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const subtotal = nights * pricePerNight;
  
  // Cargo por huéspedes adicionales
  const extraGuests = Math.max(0, guests - baseGuests);
  const guestFee = extraGuests * extraGuestFee * nights;
  
  const serviceFee = subtotal * 0.05; // 5% cargo por servicio
  const cleaningFee = 50000; // Cargo fijo por limpieza
  const tax = subtotal * 0.19; // IVA 19%
  const total = subtotal + guestFee + serviceFee + cleaningFee + tax;

  // Notificar cambios
  React.useEffect(() => {
    if (onTotalChange && nights > 0) {
      onTotalChange(total, nights);
    }
  }, [total, nights]);

  return (
    <div className="space-y-6">
      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Check-in
          </label>
          <DatePicker
            selected={checkIn}
            onChange={handleCheckInChange}
            minDate={new Date()}
            dateFormat="dd/MM/yyyy"
            locale={es}
            placeholderText="Seleccionar fecha"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Check-out
          </label>
          <DatePicker
            selected={checkOut}
            onChange={handleCheckOutChange}
            minDate={checkIn ? addDays(checkIn, 1) : addDays(new Date(), 1)}
            dateFormat="dd/MM/yyyy"
            locale={es}
            placeholderText="Seleccionar fecha"
            disabled={!checkIn}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
          />
        </div>
      </div>

      {/* Huéspedes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Users className="w-4 h-4 inline mr-1" />
          Huéspedes
        </label>
        <div className="flex items-center gap-4 border border-gray-300 rounded-lg px-4 py-3">
          <button
            onClick={() => handleGuestsChange(Math.max(1, guests - 1))}
            className="w-8 h-8 rounded-full border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={guests <= 1}
          >
            −
          </button>
          <span className="flex-1 text-center font-semibold text-gray-900">
            {guests} {guests === 1 ? 'huésped' : 'huéspedes'}
          </span>
          <button
            onClick={() => handleGuestsChange(Math.min(maxGuests, guests + 1))}
            className="w-8 h-8 rounded-full border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={guests >= maxGuests}
          >
            +
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Máximo {maxGuests} huéspedes</p>
      </div>

      {/* Desglose de precios */}
      {nights > 0 && (
        <div className="border-t border-gray-200 pt-6 space-y-3">
          <h3 className="font-semibold text-gray-900 mb-4">Desglose de precios</h3>
          
          <div className="flex justify-between text-gray-700">
            <span>${pricePerNight.toLocaleString('es-CO')} × {nights} {nights === 1 ? 'noche' : 'noches'}</span>
            <span>${subtotal.toLocaleString('es-CO')}</span>
          </div>

          {extraGuests > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>{extraGuests} {extraGuests === 1 ? 'huésped adicional' : 'huéspedes adicionales'} × ${extraGuestFee.toLocaleString('es-CO')}</span>
              <span>${guestFee.toLocaleString('es-CO')}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-700">
            <span>Cargo por servicio (5%)</span>
            <span>${serviceFee.toLocaleString('es-CO')}</span>
          </div>

          <div className="flex justify-between text-gray-700">
            <span>Cargo por limpieza</span>
            <span>${cleaningFee.toLocaleString('es-CO')}</span>
          </div>

          <div className="flex justify-between text-gray-700">
            <span>IVA (19%)</span>
            <span>${tax.toLocaleString('es-CO')}</span>
          </div>

          <div className="border-t border-gray-300 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                ${total.toLocaleString('es-CO')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Precio total por {nights} {nights === 1 ? 'noche' : 'noches'}</p>
          </div>
        </div>
      )}

      {!checkIn && (
        <div className="text-center py-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">📅 Selecciona fechas para ver el precio total</p>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
