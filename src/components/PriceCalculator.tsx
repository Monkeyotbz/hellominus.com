import { useState, useEffect } from 'react';
import { Calculator, Info, Tag, TrendingDown } from 'lucide-react';

interface PriceBreakdown {
  pricePerNight: number;
  nights: number;
  basePrice: number;
  discountPercentage: number;
  discountAmount: number;
  discountReason: string;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  totalBeforeTaxes: number;
  ivaPercentage: number;
  ivaAmount: number;
  tourismTax: number;
  totalTaxes: number;
  grandTotal: number;
}

interface PriceCalculatorProps {
  pricePerNight: number;
  nights: number;
  guests?: number;
  propertyId?: string;
  onPriceCalculated?: (breakdown: PriceBreakdown) => void;
  showCommission?: boolean; // Solo para admin
}

export default function PriceCalculator({
  pricePerNight,
  nights,
  guests = 1,
  propertyId,
  onPriceCalculated,
  showCommission = false
}: PriceCalculatorProps) {
  const [breakdown, setBreakdown] = useState<PriceBreakdown>({
    pricePerNight: 0,
    nights: 0,
    basePrice: 0,
    discountPercentage: 0,
    discountAmount: 0,
    discountReason: '',
    subtotal: 0,
    cleaningFee: 0,
    serviceFee: 0,
    totalBeforeTaxes: 0,
    ivaPercentage: 19,
    ivaAmount: 0,
    tourismTax: 0,
    totalTaxes: 0,
    grandTotal: 0
  });

  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  useEffect(() => {
    calculatePricing();
  }, [pricePerNight, nights, guests]);

  const calculatePricing = () => {
    // Precio base
    const basePrice = pricePerNight * nights;
    
    // Descuentos automáticos
    let discountPercentage = 0;
    let discountReason = '';
    
    // Descuento por estadía larga
    if (nights >= 30) {
      discountPercentage = 15;
      discountReason = 'Descuento estadía mensual (15%)';
    } else if (nights >= 7) {
      discountPercentage = 10;
      discountReason = 'Descuento estadía semanal (10%)';
    }
    
    const discountAmount = basePrice * (discountPercentage / 100);
    const subtotal = basePrice - discountAmount;
    
    // Cargos adicionales
    const cleaningFee = 50000; // Cargo fijo de limpieza
    const serviceFeePercentage = 5; // 5% cargo por servicio
    const serviceFee = subtotal * (serviceFeePercentage / 100);
    
    const totalBeforeTaxes = subtotal + cleaningFee + serviceFee;
    
    // Impuestos
    const ivaPercentage = 19;
    const ivaAmount = subtotal * (ivaPercentage / 100);
    const tourismTax = nights * 5000; // $5,000 por noche
    const totalTaxes = ivaAmount + tourismTax;
    
    // Total final
    const grandTotal = totalBeforeTaxes + totalTaxes;
    
    const newBreakdown = {
      pricePerNight,
      nights,
      basePrice,
      discountPercentage,
      discountAmount,
      discountReason,
      subtotal,
      cleaningFee,
      serviceFee,
      totalBeforeTaxes,
      ivaPercentage,
      ivaAmount,
      tourismTax,
      totalTaxes,
      grandTotal
    };
    
    setBreakdown(newBreakdown);
    onPriceCalculated?.(newBreakdown);
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setApplyingPromo(true);
    // Aquí iría la llamada a Supabase para aplicar el código promocional
    // Por ahora simulamos
    setTimeout(() => {
      if (promoCode.toUpperCase() === 'DESCUENTO10') {
        const extraDiscount = breakdown.basePrice * 0.1;
        setBreakdown({
          ...breakdown,
          discountAmount: breakdown.discountAmount + extraDiscount,
          discountReason: 'Código promocional DESCUENTO10',
          grandTotal: breakdown.grandTotal - extraDiscount
        });
      }
      setApplyingPromo(false);
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
        <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
        <h3 className="text-base sm:text-xl font-bold text-white">Desglose de Precios</h3>
      </div>

      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {/* Precio base */}
        <div className="pb-3 sm:pb-4 border-b border-gray-200">
          <div className="flex justify-between items-start sm:items-center gap-2 mb-2">
            <span className="text-sm sm:text-base text-gray-600">
              {formatCurrency(breakdown.pricePerNight)} × {breakdown.nights} {breakdown.nights === 1 ? 'noche' : 'noches'}
            </span>
            <span className="font-semibold text-sm sm:text-base whitespace-nowrap">{formatCurrency(breakdown.basePrice)}</span>
          </div>
          
          {/* Descuentos */}
          {breakdown.discountAmount > 0 && (
            <div className="flex justify-between items-start sm:items-center text-green-600 mt-2 gap-2">
              <div className="flex items-start sm:items-center gap-2 flex-1">
                <TrendingDown className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-xs sm:text-sm">{breakdown.discountReason}</span>
              </div>
              <span className="font-semibold text-sm sm:text-base whitespace-nowrap">-{formatCurrency(breakdown.discountAmount)}</span>
            </div>
          )}
        </div>

        {/* Código promocional */}
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
            <span className="font-medium text-gray-900 text-sm sm:text-base">¿Tienes un código promocional?</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="CODIGO2025"
              className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
            />
            <button
              onClick={applyPromoCode}
              disabled={applyingPromo || !promoCode.trim()}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              {applyingPromo ? 'Aplicando...' : 'Aplicar'}
            </button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-700 text-sm sm:text-base">Subtotal</span>
          <span className="font-semibold text-sm sm:text-base">{formatCurrency(breakdown.subtotal)}</span>
        </div>

        {/* Cargos adicionales */}
        <div className="space-y-2 pb-3 sm:pb-4 border-b border-gray-200">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Cargo por limpieza</span>
              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            </div>
            <span className="text-gray-700 whitespace-nowrap">{formatCurrency(breakdown.cleaningFee)}</span>
          </div>
          
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Cargo por servicio (5%)</span>
              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            </div>
            <span className="text-gray-700 whitespace-nowrap">{formatCurrency(breakdown.serviceFee)}</span>
          </div>
        </div>

        {/* Impuestos */}
        <div className="space-y-2 pb-3 sm:pb-4 border-b border-gray-200">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-gray-600">IVA ({breakdown.ivaPercentage}%)</span>
            <span className="text-gray-700 whitespace-nowrap">{formatCurrency(breakdown.ivaAmount)}</span>
          </div>
          
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-gray-600">Impuesto turístico</span>
            <span className="text-gray-700 whitespace-nowrap">{formatCurrency(breakdown.tourismTax)}</span>
          </div>
          
          <div className="flex justify-between items-center text-xs sm:text-sm font-medium">
            <span className="text-gray-700">Total impuestos</span>
            <span className="text-gray-900 whitespace-nowrap">{formatCurrency(breakdown.totalTaxes)}</span>
          </div>
        </div>

        {/* Total final */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 border-2 border-blue-300">
          <div className="flex justify-between items-center gap-2">
            <span className="text-base sm:text-lg font-bold text-gray-900">Total a pagar</span>
            <span className="text-xl sm:text-2xl font-bold text-blue-600 whitespace-nowrap">{formatCurrency(breakdown.grandTotal)}</span>
          </div>
        </div>

        {/* Info adicional */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-800">
            <p className="font-medium mb-1">Los precios incluyen:</p>
            <ul className="list-disc list-inside space-y-0.5 sm:space-y-1">
              <li>IVA del 19% sobre el valor del alojamiento</li>
              <li>Impuesto turístico de $5,000 por noche</li>
              <li>Cargo único de limpieza de $50,000</li>
              <li>No se cobran cargos ocultos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
