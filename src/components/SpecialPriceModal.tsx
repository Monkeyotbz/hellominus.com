import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface SpecialPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  basePrice: number;
  onSuccess: () => void;
}

const SpecialPriceModal: React.FC<SpecialPriceModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyName,
  basePrice,
  onSuccess
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validaciones
    if (!startDate || !endDate || !pricePerNight) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    const price = parseFloat(pricePerNight);
    if (isNaN(price) || price <= 0) {
      setError('El precio debe ser un número válido mayor a 0');
      return;
    }

    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error: insertError } = await supabase
        .from('special_pricing')
        .insert({
          property_id: propertyId,
          start_date: startDate,
          end_date: endDate,
          price_per_night: price,
          reason: reason || 'Sin especificar',
          active: true,
          created_by: userData.user?.id
        });

      if (insertError) throw insertError;

      // Limpiar formulario y cerrar
      setStartDate('');
      setEndDate('');
      setPricePerNight('');
      setReason('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error agregando precio especial:', err);
      setError(err.message || 'Error al agregar el precio especial');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStartDate('');
    setEndDate('');
    setPricePerNight('');
    setReason('');
    setError('');
    onClose();
  };

  const priceDifference = pricePerNight ? parseFloat(pricePerNight) - basePrice : 0;
  const percentageDiff = basePrice > 0 ? ((priceDifference / basePrice) * 100).toFixed(1) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Precio Especial</h2>
            <p className="text-sm text-gray-500 mt-1">
              Precio base: ${basePrice.toLocaleString('es-CO')} COP/noche
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre de la propiedad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Propiedad
            </label>
            <input
              type="text"
              value={propertyName}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          {/* Fecha de inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            />
          </div>

          {/* Fecha de fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Fin *
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            />
          </div>

          {/* Precio por noche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio por Noche (COP) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                placeholder={basePrice.toString()}
                min="0"
                step="1000"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
            </div>
            {pricePerNight && (
              <div className="mt-2">
                <p className={`text-sm font-medium ${priceDifference > 0 ? 'text-green-600' : priceDifference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {priceDifference > 0 ? '+' : ''}{priceDifference.toLocaleString('es-CO')} COP 
                  ({priceDifference > 0 ? '+' : ''}{percentageDiff}%)
                </p>
              </div>
            )}
          </div>

          {/* Razón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razón
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">Selecciona una razón</option>
              <option value="Temporada Alta">Temporada Alta</option>
              <option value="Fin de Semana Largo">Fin de Semana Largo</option>
              <option value="Festivo">Festivo</option>
              <option value="Evento Especial">Evento Especial</option>
              <option value="Promoción">Promoción</option>
              <option value="Descuento Temporada Baja">Descuento Temporada Baja</option>
              <option value="Black Friday">Black Friday</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Precio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpecialPriceModal;
