import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { DollarSign, Save, Percent, Tag, Calendar as CalendarIcon, Info } from 'lucide-react';

interface PropertyPricing {
  id?: string;
  property_id: string;
  base_price_per_night: number;
  high_season_price?: number;
  low_season_price?: number;
  weekend_price?: number;
  weekly_discount_percentage: number;
  monthly_discount_percentage: number;
  cleaning_fee: number;
  service_fee_percentage: number;
  tourism_tax_per_night: number;
  iva_percentage: number;
  apply_iva: boolean;
  min_nights: number;
  max_guests?: number;
  extra_guest_fee: number;
  active: boolean;
}

interface AdminPropertyPricingProps {
  propertyId: string;
  propertyName: string;
  onClose: () => void;
}

export default function AdminPropertyPricing({ propertyId, propertyName, onClose }: AdminPropertyPricingProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricing, setPricing] = useState<PropertyPricing>({
    property_id: propertyId,
    base_price_per_night: 0,
    weekly_discount_percentage: 10,
    monthly_discount_percentage: 15,
    cleaning_fee: 50000,
    service_fee_percentage: 5,
    tourism_tax_per_night: 5000,
    iva_percentage: 19,
    apply_iva: true,
    min_nights: 1,
    extra_guest_fee: 0,
    active: true
  });

  useEffect(() => {
    loadPricing();
  }, [propertyId]);

  const loadPricing = async () => {
    const { data, error } = await supabase
      .from('property_pricing')
      .select('*')
      .eq('property_id', propertyId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // Si el error NO es "no rows returned", mostrar advertencia
      console.warn('⚠️ Tabla property_pricing no existe. Ejecuta pricing-system.sql en Supabase');
    }

    if (data) {
      setPricing(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (pricing.id) {
        // Update existing
        const { error } = await supabase
          .from('property_pricing')
          .update({
            ...pricing,
            updated_at: new Date().toISOString()
          })
          .eq('id', pricing.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('property_pricing')
          .insert([pricing]);

        if (error) throw error;
      }

      alert('✅ Configuración de precios guardada correctamente');
      onClose();
    } catch (error: any) {
      console.error('Error saving pricing:', error);
      
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        alert('⚠️ Error: La tabla property_pricing no existe.\n\nPor favor ejecuta el archivo pricing-system.sql en Supabase SQL Editor primero.');
      } else {
        alert('Error al guardar la configuración: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const calculateExample = () => {
    const nights = 7;
    const basePrice = pricing.base_price_per_night * nights;
    const discount = basePrice * (pricing.weekly_discount_percentage / 100);
    const subtotal = basePrice - discount;
    const iva = pricing.apply_iva ? subtotal * (pricing.iva_percentage / 100) : 0;
    const serviceFee = subtotal * (pricing.service_fee_percentage / 100);
    const tourismTax = pricing.tourism_tax_per_night * nights;
    const total = subtotal + pricing.cleaning_fee + serviceFee + iva + tourismTax;

    return {
      basePrice,
      discount,
      subtotal,
      cleaningFee: pricing.cleaning_fee,
      serviceFee,
      iva,
      tourismTax,
      total
    };
  };

  const example = calculateExample();

  if (loading) {
    return <div className="p-6 text-center">Cargando...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-xl">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Configuración de Precios
          </h2>
          <p className="text-blue-100 mt-1">{propertyName}</p>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Columna izquierda: Configuración */}
            <div className="space-y-6">
              {/* Precio Base */}
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Precio Base
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por noche (COP)
                  </label>
                  <input
                    type="number"
                    value={pricing.base_price_per_night}
                    onChange={(e) => setPricing({ ...pricing, base_price_per_night: parseFloat(e.target.value) })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-600 focus:outline-none"
                    placeholder="150000"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {formatCurrency(pricing.base_price_per_night)} por noche
                  </p>
                </div>
              </div>

              {/* Precios de Temporada */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  Temporadas (Opcional)
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temporada Alta (COP/noche)
                  </label>
                  <input
                    type="number"
                    value={pricing.high_season_price || ''}
                    onChange={(e) => setPricing({ ...pricing, high_season_price: parseFloat(e.target.value) || undefined })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-600 focus:outline-none"
                    placeholder="200000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temporada Baja (COP/noche)
                  </label>
                  <input
                    type="number"
                    value={pricing.low_season_price || ''}
                    onChange={(e) => setPricing({ ...pricing, low_season_price: parseFloat(e.target.value) || undefined })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-600 focus:outline-none"
                    placeholder="120000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fin de Semana (COP/noche)
                  </label>
                  <input
                    type="number"
                    value={pricing.weekend_price || ''}
                    onChange={(e) => setPricing({ ...pricing, weekend_price: parseFloat(e.target.value) || undefined })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-600 focus:outline-none"
                    placeholder="180000"
                  />
                </div>
              </div>

              {/* Descuentos Automáticos */}
              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-green-600" />
                  Descuentos Automáticos
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descuento Semanal (7+ noches) %
                    </label>
                    <input
                      type="number"
                      value={pricing.weekly_discount_percentage}
                      onChange={(e) => setPricing({ ...pricing, weekly_discount_percentage: parseFloat(e.target.value) })}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-green-600 focus:outline-none"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Se aplica automáticamente en reservas de 7+ noches
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descuento Mensual (30+ noches) %
                    </label>
                    <input
                      type="number"
                      value={pricing.monthly_discount_percentage}
                      onChange={(e) => setPricing({ ...pricing, monthly_discount_percentage: parseFloat(e.target.value) })}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-green-600 focus:outline-none"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Se aplica automáticamente en reservas de 30+ noches
                    </p>
                  </div>
                </div>
              </div>

              {/* Cargos Adicionales */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-600" />
                  Cargos Adicionales
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo por Limpieza (COP)
                  </label>
                  <input
                    type="number"
                    value={pricing.cleaning_fee}
                    onChange={(e) => setPricing({ ...pricing, cleaning_fee: parseFloat(e.target.value) })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-600 focus:outline-none"
                  />
                  <p className="text-xs text-gray-600 mt-1">Cargo único por estadía</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo por Servicio (%)
                  </label>
                  <input
                    type="number"
                    value={pricing.service_fee_percentage}
                    onChange={(e) => setPricing({ ...pricing, service_fee_percentage: parseFloat(e.target.value) })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-600 focus:outline-none"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-600 mt-1">Porcentaje sobre el subtotal</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Impuesto Turístico (COP/noche)
                  </label>
                  <input
                    type="number"
                    value={pricing.tourism_tax_per_night}
                    onChange={(e) => setPricing({ ...pricing, tourism_tax_per_night: parseFloat(e.target.value) })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-600 focus:outline-none"
                  />
                  <p className="text-xs text-gray-600 mt-1">Por noche de estadía</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo por Huésped Extra (COP/noche)
                  </label>
                  <input
                    type="number"
                    value={pricing.extra_guest_fee}
                    onChange={(e) => setPricing({ ...pricing, extra_guest_fee: parseFloat(e.target.value) })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-600 focus:outline-none"
                  />
                  <p className="text-xs text-gray-600 mt-1">Si excede capacidad base</p>
                </div>
              </div>

              {/* Impuestos */}
              <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200">
                <h3 className="font-bold text-gray-900 mb-3">Impuestos</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={pricing.apply_iva}
                      onChange={(e) => setPricing({ ...pricing, apply_iva: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Aplicar IVA
                    </label>
                  </div>

                  {pricing.apply_iva && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Porcentaje de IVA (%)
                      </label>
                      <input
                        type="number"
                        value={pricing.iva_percentage}
                        onChange={(e) => setPricing({ ...pricing, iva_percentage: parseFloat(e.target.value) })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-amber-600 focus:outline-none"
                        min="0"
                        max="100"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Restricciones */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">Restricciones</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mínimo de Noches
                  </label>
                  <input
                    type="number"
                    value={pricing.min_nights}
                    onChange={(e) => setPricing({ ...pricing, min_nights: parseInt(e.target.value) })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-600 focus:outline-none"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de Huéspedes
                  </label>
                  <input
                    type="number"
                    value={pricing.max_guests || ''}
                    onChange={(e) => setPricing({ ...pricing, max_guests: parseInt(e.target.value) || undefined })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-600 focus:outline-none"
                    min="1"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>

            {/* Columna derecha: Ejemplo de cálculo */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-300 sticky top-0">
                <h3 className="font-bold text-xl text-gray-900 mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Ejemplo de Cálculo
                </h3>
                <p className="text-sm text-gray-600 mb-4">Reserva de 7 noches, 2 huéspedes</p>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      {formatCurrency(pricing.base_price_per_night)} × 7 noches
                    </span>
                    <span className="font-semibold">{formatCurrency(example.basePrice)}</span>
                  </div>

                  {example.discount > 0 && (
                    <div className="flex justify-between items-center text-green-600 bg-green-50 px-3 py-2 rounded">
                      <span>Descuento semanal (-{pricing.weekly_discount_percentage}%)</span>
                      <span className="font-semibold">-{formatCurrency(example.discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center font-medium pt-2 border-t">
                    <span>Subtotal</span>
                    <span>{formatCurrency(example.subtotal)}</span>
                  </div>

                  <div className="space-y-2 bg-gray-50 rounded p-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Cargos adicionales:</p>
                    <div className="flex justify-between text-gray-600">
                      <span>Limpieza</span>
                      <span>{formatCurrency(example.cleaningFee)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Servicio ({pricing.service_fee_percentage}%)</span>
                      <span>{formatCurrency(example.serviceFee)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 bg-amber-50 rounded p-3 border border-amber-200">
                    <p className="text-xs font-medium text-amber-900 mb-2">Impuestos:</p>
                    {pricing.apply_iva && (
                      <div className="flex justify-between text-amber-800">
                        <span>IVA ({pricing.iva_percentage}%)</span>
                        <span>{formatCurrency(example.iva)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-amber-800">
                      <span>Impuesto turístico</span>
                      <span>{formatCurrency(example.tourismTax)}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-center text-white">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold">{formatCurrency(example.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-xs text-gray-600">
                    💡 Este cálculo se aplicará automáticamente en todas las reservas de esta propiedad
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex gap-3 justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}
