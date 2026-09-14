import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { calculatePrice, propertyPricingRules, PriceBreakdown } from '../utils/pricing';
import { quickProperties } from '../data/showcases';
import { AlertCircle, Check, ChevronDown } from 'lucide-react';

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
    selectedServices: [] as string[]
  });

  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [expandedServices, setExpandedServices] = useState(false);

  // Cargar propiedad
  useEffect(() => {
    const prop = quickProperties.find(p => p.id === id);
    if (prop) {
      setProperty(prop);
      setLoading(false);
    } else {
      setError('Propiedad no encontrada');
      setLoading(false);
    }
  }, [id]);

  // Calcular precio cuando cambien los datos
  useEffect(() => {
    if (!formData.checkIn || !formData.checkOut || !property) {
      setPriceBreakdown(null);
      return;
    }

    try {
      const pricingRule = propertyPricingRules[id as string];
      if (!pricingRule) {
        setError('No hay reglas de precios para esta propiedad');
        return;
      }

      const breakdown = calculatePrice(
        pricingRule,
        formData.checkIn,
        formData.checkOut,
        formData.guests,
        formData.selectedServices
      );
      setPriceBreakdown(breakdown);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular el precio');
      setPriceBreakdown(null);
    }
  }, [formData.checkIn, formData.checkOut, formData.guests, formData.selectedServices, property, id]);

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter(s => s !== service)
        : [...prev.selectedServices, service]
    }));
  };

  const handlePayment = async () => {
    if (!priceBreakdown) return;

    // Crear objeto de reserva
    const reservationData = {
      propertyId: id,
      propertyName: property.name,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: formData.guests,
      selectedServices: formData.selectedServices,
      priceBreakdown: priceBreakdown
    };

    // Guardar en sessionStorage para el checkout
    sessionStorage.setItem('reservationData', JSON.stringify(reservationData));

    // Redirigir a checkout
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[110px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando propiedad...</p>
        </div>
      </div>
    );
  }

  if (!property || !id) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[110px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Propiedad no encontrada'}</p>
          <button
            onClick={() => navigate('/properties')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Volver a propiedades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-[110px]">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-gray-600">
          <button onClick={() => navigate('/properties')} className="hover:text-blue-600">
            Propiedades
          </button>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{property.name}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Información de propiedad */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-32">
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{property.name}</h2>
                <p className="text-gray-600 text-sm mb-4 flex items-center gap-2">
                  📍 {property.location}
                </p>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">{property.description}</p>

                {property.tags && (
                  <div className="flex flex-wrap gap-2">
                    {property.tags.slice(0, 4).map((tag: string, i: number) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Formulario y resumen */}
          <div className="md:col-span-2 space-y-6">
            {/* Formulario */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Detalles de tu reserva</h3>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Fecha de entrada
                  </label>
                  <input
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Fecha de salida
                  </label>
                  <input
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👥 Número de huéspedes
                </label>
                <select
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-600 transition"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'huésped' : 'huéspedes'}</option>
                  ))}
                </select>
              </div>

              {/* Servicios adicionales */}
              {Object.keys(propertyPricingRules[id as string]?.additionalServices || {}).length > 0 && (
                <div className="mt-6 pt-6 border-t-2">
                  <button
                    type="button"
                    onClick={() => setExpandedServices(!expandedServices)}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-blue-900 font-semibold"
                  >
                    <span>🎁 Servicios adicionales</span>
                    <ChevronDown className={`w-5 h-5 transition transform ${expandedServices ? 'rotate-180' : ''}`} />
                  </button>

                  {expandedServices && (
                    <div className="mt-4 space-y-2">
                      {Object.entries(propertyPricingRules[id as string].additionalServices).map(([key, service]) => (
                        <label key={key} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                          <input
                            type="checkbox"
                            checked={formData.selectedServices.includes(key)}
                            onChange={() => handleServiceToggle(key)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                          />
                          <span className="flex-1 text-gray-700">{service.label}</span>
                          <span className="font-bold text-blue-600 whitespace-nowrap">
                            +${service.price.toLocaleString('es-CO')}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Resumen de precio */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-2xl font-bold mb-6">Resumen de precio</h3>

              {error && (
                <div className="bg-red-500/20 border border-red-400 rounded-lg p-4 mb-4 text-sm">
                  {error}
                </div>
              )}

              {priceBreakdown ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span>${priceBreakdown.adjustedNightlyPrice.toLocaleString('es-CO')} × {priceBreakdown.nights} noche{priceBreakdown.nights > 1 ? 's' : ''}</span>
                    <span className="font-bold">${priceBreakdown.baseTotal.toLocaleString('es-CO')}</span>
                  </div>

                  {/* Descuentos */}
                  {(priceBreakdown.breakdown.seasonDiscount !== '0%' ||
                    priceBreakdown.breakdown.groupDiscount !== '0%' ||
                    priceBreakdown.breakdown.stayDiscount !== '0%') && (
                    <div className="bg-white/20 rounded-lg p-3 space-y-1 text-sm">
                      {priceBreakdown.breakdown.seasonDiscount !== '0%' && (
                        <div className="flex items-center justify-between">
                          <span>✓ Descuento temporada</span>
                          <span>-{priceBreakdown.breakdown.seasonDiscount}</span>
                        </div>
                      )}
                      {priceBreakdown.breakdown.groupDiscount !== '0%' && (
                        <div className="flex items-center justify-between">
                          <span>✓ Descuento grupo</span>
                          <span>-{priceBreakdown.breakdown.groupDiscount}</span>
                        </div>
                      )}
                      {priceBreakdown.breakdown.stayDiscount !== '0%' && (
                        <div className="flex items-center justify-between">
                          <span>✓ Descuento estadía</span>
                          <span>-{priceBreakdown.breakdown.stayDiscount}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Servicios */}
                  {priceBreakdown.services.length > 0 && (
                    <div className="bg-white/20 rounded-lg p-3 space-y-1 text-sm border-t border-white/30 pt-3">
                      {priceBreakdown.services.map((service, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{service.name}</span>
                          <span>+${service.price.toLocaleString('es-CO')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t-2 border-white/30 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">Total a pagar:</span>
                      <span className="text-4xl font-bold">${priceBreakdown.totalPrice.toLocaleString('es-CO')}</span>
                    </div>
                  </div>

                  {/* Botón de pago */}
                  <button
                    onClick={handlePayment}
                    className="w-full bg-white hover:bg-gray-100 text-blue-600 font-bold py-4 rounded-lg mt-6 transition text-lg shadow-lg"
                  >
                    💳 Proceder al pago
                  </button>
                </div>
              ) : (
                <p className="text-blue-100 text-center py-8">
                  ✨ Selecciona fechas para ver el precio
                </p>
              )}
            </div>

            {/* Garantías */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Check className="w-8 h-8 text-green-500 mb-2" />
                  <p className="text-sm font-semibold text-gray-900">Pago seguro</p>
                  <p className="text-xs text-gray-600">Encriptado con Stripe</p>
                </div>
                <div className="flex flex-col items-center">
                  <Check className="w-8 h-8 text-green-500 mb-2" />
                  <p className="text-sm font-semibold text-gray-900">Cancelación flexible</p>
                  <p className="text-xs text-gray-600">Hasta 7 días antes</p>
                </div>
                <div className="flex flex-col items-center">
                  <Check className="w-8 h-8 text-green-500 mb-2" />
                  <p className="text-sm font-semibold text-gray-900">Confirmación inmediata</p>
                  <p className="text-xs text-gray-600">Por email y WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
