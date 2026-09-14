import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface BlockDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  onSuccess: () => void;
}

const BlockDatesModal: React.FC<BlockDatesModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyName,
  onSuccess
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validaciones
    if (!startDate || !endDate) {
      setError('Por favor completa las fechas');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error: insertError } = await supabase
        .from('blocked_dates')
        .insert({
          property_id: propertyId,
          start_date: startDate,
          end_date: endDate,
          reason: reason || 'Sin especificar',
          created_by: userData.user?.id
        });

      if (insertError) throw insertError;

      // Limpiar formulario y cerrar
      setStartDate('');
      setEndDate('');
      setReason('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error bloqueando fechas:', err);
      setError(err.message || 'Error al bloquear las fechas');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStartDate('');
    setEndDate('');
    setReason('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Bloquear Fechas</h2>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* Razón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razón
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Selecciona una razón</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Reservado fuera del sistema">Reservado fuera del sistema</option>
              <option value="Bloqueado por propietario">Bloqueado por propietario</option>
              <option value="Reparaciones">Reparaciones</option>
              <option value="Vacaciones del propietario">Vacaciones del propietario</option>
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
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Bloqueando...' : 'Bloquear Fechas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlockDatesModal;
