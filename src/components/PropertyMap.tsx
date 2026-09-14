import React from 'react';
import { MapPin } from 'lucide-react';

interface PropertyMapProps {
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ address, city, latitude, longitude }) => {
  // Coordenadas por defecto para principales ciudades de Colombia
  const defaultCoordinates: { [key: string]: { lat: number; lng: number } } = {
    'Cartagena': { lat: 10.3932, lng: -75.4832 },
    'Barranquilla': { lat: 10.9685, lng: -74.7813 },
    'Santa Marta': { lat: 11.2408, lng: -74.2099 },
    'Medellín': { lat: 6.2476, lng: -75.5658 },
    'Bogotá': { lat: 4.7110, lng: -74.0721 },
    'Cali': { lat: 3.4516, lng: -76.5320 },
    'Cartagena de Indias': { lat: 10.3932, lng: -75.4832 },
  };

  const coords = latitude && longitude
    ? { lat: latitude, lng: longitude }
    : defaultCoordinates[city] || { lat: 4.7110, lng: -74.0721 };

  // URL de Google Maps embebido
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${coords.lat},${coords.lng}&zoom=15`;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-gray-900 text-lg mb-1">Ubicación</h3>
          <p className="text-gray-700">{address}</p>
          <p className="text-gray-600">{city}, Colombia</p>
        </div>
      </div>

      <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Información de la zona</h4>
        <p className="text-sm text-gray-600">
          Esta propiedad se encuentra en una ubicación privilegiada de {city}, 
          con fácil acceso a las principales atracciones turísticas, restaurantes y centros comerciales.
        </p>
      </div>
    </div>
  );
};

export default PropertyMap;
