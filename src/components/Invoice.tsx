import React from 'react';
import { Calendar, Users, MapPin, Phone, Mail, Building2 } from 'lucide-react';

interface InvoiceProps {
  reservation: {
    id: string;
    item_name: string;
    reservation_type: string;
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
    created_at: string;
    users: {
      email: string;
      full_name?: string;
      phone?: string;
      city?: string;
      country?: string;
      document_number?: string;
    };
  };
}

const Invoice = React.forwardRef<HTMLDivElement, InvoiceProps>(({ reservation }, ref) => {
  const invoiceNumber = `INV-${reservation.id.slice(0, 8).toUpperCase()}`;
  const invoiceDate = new Date(reservation.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b-4 border-blue-600 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <img 
              src="/brand/logo.svg" 
              alt="Hellominus" 
              className="h-16 w-auto mb-2"
            />
            <h1 className="text-3xl font-bold text-gray-800">FACTURA</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Número de Factura</p>
            <p className="text-2xl font-bold text-gray-800">{invoiceNumber}</p>
            <p className="text-sm text-gray-600 mt-2">Fecha</p>
            <p className="font-semibold text-gray-800">{invoiceDate}</p>
          </div>
        </div>
      </div>

      {/* Company & Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Company Info */}
        <div>
          <h3 className="text-sm font-bold text-gray-600 uppercase mb-3">De:</h3>
          <div className="space-y-1">
            <p className="font-bold text-gray-800">Hellominus</p>
            <p className="text-sm text-gray-600">NIT: 900.XXX.XXX-X</p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Cartagena, Colombia
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              +57 XXX XXX XXXX
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              contacto@hellominus.com
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div>
          <h3 className="text-sm font-bold text-gray-600 uppercase mb-3">Para:</h3>
          <div className="space-y-1">
            <p className="font-bold text-gray-800">
              {reservation.users.full_name || 'Cliente'}
            </p>
            {reservation.users.document_number && (
              <p className="text-sm text-gray-600">
                Doc: {reservation.users.document_number}
              </p>
            )}
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {reservation.users.email}
            </p>
            {reservation.users.phone && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {reservation.users.phone}
              </p>
            )}
            {(reservation.users.city || reservation.users.country) && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {[reservation.users.city, reservation.users.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reservation Details */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Detalles de la Reservación
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600">Servicio</p>
            <p className="font-semibold text-gray-800">{reservation.item_name}</p>
            <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
              reservation.reservation_type === 'property' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {reservation.reservation_type === 'property' ? 'Propiedad' : 'Tour'}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-600">Huéspedes</p>
            <p className="font-semibold text-gray-800 flex items-center gap-1">
              <Users className="w-4 h-4" />
              {reservation.guests} persona{reservation.guests !== 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Check-in</p>
            <p className="font-semibold text-gray-800 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(reservation.check_in).toLocaleDateString('es-ES')}
            </p>
          </div>
          {reservation.check_out && (
            <div>
              <p className="text-xs text-gray-600">Check-out</p>
              <p className="font-semibold text-gray-800 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(reservation.check_out).toLocaleDateString('es-ES')}
              </p>
            </div>
          )}
          {reservation.nights && (
            <div>
              <p className="text-xs text-gray-600">Noches</p>
              <p className="font-semibold text-gray-800">{reservation.nights} noche{reservation.nights !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">
                Descripción
              </th>
              <th className="text-right py-3 px-4 text-sm font-bold text-gray-700 uppercase">
                Cantidad
              </th>
              <th className="text-right py-3 px-4 text-sm font-bold text-gray-700 uppercase">
                Precio Unit.
              </th>
              <th className="text-right py-3 px-4 text-sm font-bold text-gray-700 uppercase">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Base Price */}
            <tr>
              <td className="py-3 px-4">
                <p className="font-medium text-gray-800">
                  {reservation.reservation_type === 'property' 
                    ? 'Alojamiento - ' + reservation.item_name
                    : 'Tour - ' + reservation.item_name}
                </p>
                {reservation.nights && (
                  <p className="text-xs text-gray-500 mt-1">
                    {reservation.nights} noche{reservation.nights !== 1 ? 's' : ''} × {reservation.guests} huésped{reservation.guests !== 1 ? 'es' : ''}
                  </p>
                )}
              </td>
              <td className="py-3 px-4 text-right text-gray-700">
                1
              </td>
              <td className="py-3 px-4 text-right text-gray-700">
                ${reservation.base_price.toLocaleString()}
              </td>
              <td className="py-3 px-4 text-right font-semibold text-gray-800">
                ${reservation.base_price.toLocaleString()}
              </td>
            </tr>

            {/* Additional Services */}
            {reservation.additional_services && reservation.additional_services.map((service: any, idx: number) => (
              <tr key={idx}>
                <td className="py-3 px-4">
                  <p className="font-medium text-gray-800">{service.name}</p>
                  {service.description && (
                    <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                  )}
                </td>
                <td className="py-3 px-4 text-right text-gray-700">
                  1
                </td>
                <td className="py-3 px-4 text-right text-gray-700">
                  ${service.price.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-semibold text-gray-800">
                  ${service.price.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-700">Subtotal</span>
            <span className="font-semibold text-gray-800">
              ${(reservation.base_price + reservation.services_price).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-700">Impuestos (0%)</span>
            <span className="font-semibold text-gray-800">$0</span>
          </div>
          <div className="flex justify-between py-3 bg-blue-600 text-white px-4 rounded-lg mt-2">
            <span className="font-bold text-lg">TOTAL</span>
            <span className="font-bold text-lg">
              ${reservation.total_price.toLocaleString()} COP
            </span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">Estado de Pago</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600">Estado</p>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${
              reservation.payment_status === 'paid' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {reservation.payment_status === 'paid' ? 'PAGADO' : 'PENDIENTE'}
            </span>
          </div>
          {reservation.payment_method && (
            <div>
              <p className="text-xs text-gray-600">Método de Pago</p>
              <p className="font-semibold text-gray-800 mt-1 capitalize">
                {reservation.payment_method}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-200 pt-6 mt-8">
        <p className="text-xs text-gray-600 text-center">
          Esta es una factura electrónica generada por Hellominus.
        </p>
        <p className="text-xs text-gray-600 text-center mt-1">
          Para cualquier consulta, contáctenos a contacto@hellominus.com
        </p>
        <p className="text-xs text-gray-500 text-center mt-4">
          ID de Reservación: {reservation.id}
        </p>
      </div>

      {/* Terms & Conditions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-xs font-bold text-gray-700 mb-2">Términos y Condiciones</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• El pago debe realizarse antes de la fecha de check-in.</li>
          <li>• Las cancelaciones deben hacerse con 48 horas de anticipación.</li>
          <li>• En caso de no presentarse, el monto no será reembolsable.</li>
          <li>• Los cambios de fecha están sujetos a disponibilidad.</li>
        </ul>
      </div>
    </div>
  );
});

Invoice.displayName = 'Invoice';

export default Invoice;
