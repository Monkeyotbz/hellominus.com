import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Calendar, Users, Trash2, ArrowRight } from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, itemCount, totalAmount, removeItem, clearCart } = useCart();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 lg:p-12 text-center">
            <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-6">
              Explora nuestras propiedades y tours para comenzar tu aventura
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/properties')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Ver Propiedades
              </button>
              <button
                onClick={() => navigate('/tours')}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
              >
                Ver Tours
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            Carrito de Compras
          </h1>
          <p className="text-sm lg:text-base text-gray-600">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} en tu carrito
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items del Carrito */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="flex gap-4 p-4">
                  {/* Imagen */}
                  {item.imageUrl && (
                    <div className="w-24 h-24 lg:w-32 lg:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={item.imageUrl}
                        alt={item.itemName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${
                          item.type === 'property'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.type === 'property' ? 'Propiedad' : 'Tour'}
                        </span>
                        <h3 className="text-base lg:text-lg font-semibold text-gray-800 line-clamp-2">
                          {item.itemName}
                        </h3>
                        {item.city && (
                          <p className="text-xs lg:text-sm text-gray-500 mt-1">
                            {item.city}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    </div>

                    {/* Detalles de la reserva */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs lg:text-sm text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {formatDate(item.checkIn)}
                          {item.checkOut && ` - ${formatDate(item.checkOut)}`}
                        </span>
                      </div>
                      {item.nights && (
                        <div className="text-xs lg:text-sm text-gray-600">
                          <span className="font-medium">{item.nights}</span> {item.nights === 1 ? 'noche' : 'noches'}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs lg:text-sm text-gray-600">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span>{item.guests} {item.guests === 1 ? 'huésped' : 'huéspedes'}</span>
                      </div>
                    </div>

                    {/* Servicios adicionales */}
                    {item.additionalServices && item.additionalServices.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Servicios adicionales:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.additionalServices.map((service, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                            >
                              {service.name} (+${service.price.toLocaleString()})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Precio */}
                    <div className="flex items-baseline gap-2 pt-2 border-t border-gray-100">
                      <p className="text-xl lg:text-2xl font-bold text-blue-600">
                        ${item.totalPrice.toLocaleString()}
                      </p>
                      <p className="text-xs lg:text-sm text-gray-500">
                        (Base: ${item.basePrice.toLocaleString()})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Limpiar Carrito */}
            <button
              onClick={clearCart}
              className="w-full lg:w-auto px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Vaciar Carrito
            </button>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-4">
                Resumen de Compra
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm lg:text-base text-gray-600">
                  <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold">${totalAmount.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-base lg:text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-blue-600">${totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-3"
              >
                Proceder al Checkout
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate('/properties')}
                className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
              >
                Seguir Explorando
              </button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">
                  ✓ Reserva sin pago inmediato
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  ✓ Confirmación rápida
                </p>
                <p className="text-xs text-gray-500">
                  ✓ Soporte 24/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
