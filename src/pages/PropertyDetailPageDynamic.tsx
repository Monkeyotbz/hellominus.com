import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaBed, FaBath, FaUserFriends, FaWifi, FaSwimmingPool, FaCheckCircle, FaPlaneArrival, FaSnowflake, FaEye, FaParking } from 'react-icons/fa';
import { ChevronLeft, MessageCircle, ShoppingCart, Star, Shield, Clock } from 'lucide-react';
import { supabase } from '../supabaseClient';
import AddToCartModal from '../components/AddToCartModal';
import BookingCalendar from '../components/BookingCalendar';
import PropertyMap from '../components/PropertyMap';

interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  city: string;
  price_per_night: number;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  property_type: string;
  amenities: string[];
  extra_guest_fee?: number;
  base_guests?: number;
  property_images: Array<{
    id: string;
    image_url: string;
    display_order: number;
  }>;
}

const amenityIcons: Record<string, JSX.Element> = {
  wifi: <FaWifi />,
  parking: <FaParking />,
  piscina: <FaSwimmingPool />,
  vistas: <FaEye />,
  traslado: <FaPlaneArrival />,
  aire: <FaSnowflake />,
  default: <FaCheckCircle />
};

const getAmenityIcon = (amenity: string): JSX.Element => {
  const lowerAmenity = amenity.toLowerCase();
  if (lowerAmenity.includes('wifi')) return amenityIcons.wifi;
  if (lowerAmenity.includes('parking') || lowerAmenity.includes('estacionamiento')) return amenityIcons.parking;
  if (lowerAmenity.includes('piscina') || lowerAmenity.includes('alberca')) return amenityIcons.piscina;
  if (lowerAmenity.includes('vista')) return amenityIcons.vistas;
  if (lowerAmenity.includes('traslado') || lowerAmenity.includes('aeropuerto')) return amenityIcons.traslado;
  if (lowerAmenity.includes('aire') || lowerAmenity.includes('a/c') || lowerAmenity.includes('acondicionado')) return amenityIcons.aire;
  return amenityIcons.default;
};

const PropertyDetailPageDynamic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null);
  const [selectedGuests, setSelectedGuests] = useState(2);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const isValidUUID = (value: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  };

  const fetchProperty = async () => {
    if (!id) return;

    try {
      // Primero intentar buscar por ID directo (solo si es UUID válido)
      if (isValidUUID(id)) {
        const { data: directProperty, error: directError } = await supabase
          .from('properties')
          .select(`
            *,
            property_images(
              id,
              image_url,
              display_order
            )
          `)
          .eq('id', id)
          .eq('active', true)
          .single();

        if (directProperty && !directError) {
          setProperty(directProperty);
          setLoading(false);
          return;
        }
      }

      // Si no se encuentra por ID, buscar por slug
      const { data: properties, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(
            id,
            image_url,
            display_order
          )
        `)
        .eq('active', true);

      if (error) throw error;

      // Buscar la propiedad que coincida con el slug
      const property = properties?.find((p: any) => {
        const slug = p.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '');
        console.log('Comparing slug:', slug, 'with id:', id);
        return slug === id;
      });

      if (property) {
        setProperty(property);
      } else {
        console.error('Property not found. ID/Slug:', id);
        setProperty(null);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-[110px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white pt-[110px] flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Propiedad no encontrada</h2>
        <p className="text-gray-600 mb-8">Lo sentimos, no pudimos encontrar esta propiedad.</p>
        <button
          onClick={() => navigate('/properties')}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver a propiedades
        </button>
      </div>
    );
  }

  // Ordenar imágenes por display_order
  const images = property.property_images
    ?.sort((a, b) => a.display_order - b.display_order)
    .map(img => img.image_url) || [];

  const mainImage = images[0] || '/placeholder-property.jpg';
  const mosaicImages = images.slice(1, 5);

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(`Hola, quiero reservar ${property.name}`)}`;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="pt-[140px]">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div className="space-y-3 min-w-0">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 break-words">{property.name}</h1>
                <div className="flex items-center gap-4 flex-wrap text-sm sm:text-base">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">4.9</span>
                    <span className="text-gray-500">(127 reseñas)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaMapMarkerAlt className="text-blue-600" />
                    <span className="underline cursor-pointer hover:text-blue-600">{property.location}, {property.city}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap md:justify-end">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium">
                  <Shield className="w-5 h-5" />
                  Compartir
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium">
                  ❤️ Guardar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Galería de imágenes */}
        <div className="bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {!showAllPhotos ? (
              <>
                {/* Layout móvil: stack simple para evitar recortes */}
                <div className="lg:hidden space-y-3">
                  <div className="relative rounded-xl overflow-hidden shadow-sm">
                    <img
                      src={mainImage}
                      alt={property.name}
                      className="w-full h-64 sm:h-80 object-cover cursor-pointer"
                      onClick={() => setShowAllPhotos(true)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0" />
                  </div>
                  {mosaicImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {mosaicImages.map((img, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden shadow-sm">
                          <img
                            src={img}
                            alt={`${property.name} ${idx + 2}`}
                            className="w-full h-32 sm:h-36 object-cover cursor-pointer"
                            onClick={() => setShowAllPhotos(true)}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0" />
                          {idx === 3 && images.length > 5 && (
                            <button
                              onClick={() => setShowAllPhotos(true)}
                              className="absolute inset-0 bg-black/60 hover:bg-black/70 flex items-center justify-center text-white font-semibold transition"
                            >
                              +{images.length - 5} fotos más
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Layout desktop: mosaico amplio */}
                <div className="hidden lg:grid grid-cols-4 grid-rows-2 gap-2 h-[520px] rounded-xl overflow-hidden">
                  {/* Imagen principal */}
                  <div className="col-span-2 row-span-2 relative group">
                    <img
                      src={mainImage}
                      alt={property.name}
                      className="w-full h-full object-cover cursor-pointer transition duration-300 group-hover:brightness-90"
                      onClick={() => setShowAllPhotos(true)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-300" />
                  </div>
                  {/* Mosaico de imágenes */}
                  {mosaicImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`${property.name} ${idx + 2}`}
                        className="w-full h-full object-cover cursor-pointer transition duration-300 group-hover:brightness-90"
                        onClick={() => setShowAllPhotos(true)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-300" />
                      {idx === 3 && images.length > 5 && (
                        <button
                          onClick={() => setShowAllPhotos(true)}
                          className="absolute inset-0 bg-black bg-opacity-50 hover:bg-opacity-60 flex items-center justify-center text-white font-semibold transition"
                        >
                          +{images.length - 5} fotos más
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // Modal de todas las fotos
              <div className="fixed inset-0 bg-black bg-opacity-95 z-50 overflow-auto">
                <div className="min-h-screen py-8 px-4">
                  <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold text-white">Todas las fotos ({images.length})</h2>
                      <button
                        onClick={() => setShowAllPhotos(false)}
                        className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                      >
                        ✕ Cerrar
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${property.name} ${idx + 1}`}
                          className="w-full rounded-lg shadow-lg"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Columna izquierda - Info principal */}
              <div className="lg:col-span-2 space-y-10">
                {/* Host Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-gray-900 mb-1 break-words">
                        Alojamiento completo · {property.property_type}
                      </h2>
                      <div className="flex items-center gap-3 flex-wrap text-gray-600 text-sm sm:text-base">
                        <span className="flex items-center gap-2">
                          <FaUserFriends className="text-blue-600" />
                          {property.guests} huéspedes
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-2">
                          <FaBed className="text-blue-600" />
                          {property.bedrooms} {property.bedrooms === 1 ? 'habitación' : 'habitaciones'}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-2">
                          <FaBath className="text-blue-600" />
                          {property.bathrooms} {property.bathrooms === 1 ? 'baño' : 'baños'}
                        </span>
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      TC
                    </div>
                  </div>

                  {/* Características destacadas */}
                  <div className="space-y-6 pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Check-in flexible</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Puedes llegar a la hora que desees después de las 3:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Cancelación gratuita antes del check-in</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Obtén un reembolso completo si cambias de planes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <FaCheckCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Uno de los favoritos</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Esta es una de las propiedades mejor valoradas</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Acerca de este alojamiento</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base sm:text-lg break-words">{property.description}</p>
                </div>

                {/* Amenidades */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Lo que ofrece este lugar</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {property.amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-4 text-gray-700 py-2 text-sm sm:text-base">
                          <div className="text-blue-600 text-2xl">
                            {getAmenityIcon(amenity)}
                          </div>
                          <span className="text-lg">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mapa de ubicación */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Dónde estarás</h2>
                  <PropertyMap
                    address={property.location}
                    city={property.city}
                  />
                </div>

                {/* Políticas */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Políticas del alojamiento</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Horarios
                      </h3>
                      <div className="ml-7 space-y-1 text-gray-700 text-sm sm:text-base">
                        <p>Check-in: Después de las 3:00 PM</p>
                        <p>Check-out: Antes de las 11:00 AM</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Reglas de la casa
                      </h3>
                      <div className="ml-7 space-y-1 text-gray-700 text-sm sm:text-base">
                        <p>• No se permiten fiestas o eventos</p>
                        <p>• No fumar dentro de la propiedad</p>
                        <p>• Respetar el horario de silencio (10:00 PM - 8:00 AM)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Card de reserva */}
              <div className="lg:col-span-1">
                <div>
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
                    {/* Precio */}
                    <div className="pb-6 border-b border-gray-200">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                          ${property.price_per_night.toLocaleString('es-CO')}
                        </span>
                        <span className="text-gray-600">/ noche</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">4.9</span>
                        <span className="text-gray-500 text-sm">· 127 reseñas</span>
                      </div>
                    </div>

                    {/* Calendario y calculadora */}
                    <div className="py-6">
                      <BookingCalendar
                        pricePerNight={property.price_per_night}
                        maxGuests={property.guests}
                        extraGuestFee={property.extra_guest_fee}
                        baseGuests={property.base_guests}
                        onDateChange={(checkIn, checkOut, guests) => {
                          setSelectedCheckIn(checkIn);
                          setSelectedCheckOut(checkOut);
                          setSelectedGuests(guests);
                          // Guardar en sessionStorage para checkout
                          sessionStorage.setItem('reservationData', JSON.stringify({
                            propertyId: property.id,
                            propertyName: property.name,
                            propertyImage: mainImage,
                            checkIn: checkIn?.toISOString(),
                            checkOut: checkOut?.toISOString(),
                            guests
                          }));
                        }}
                      />
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-3 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => setShowCartModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl font-semibold transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Agregar al Carrito
                      </button>

                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-xl font-semibold transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Consultar por WhatsApp
                      </a>
                    </div>

                    <p className="text-center text-gray-500 text-sm mt-4">
                      No se hará ningún cargo por el momento
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA flotante móvil para acceder al carrito */}
      <div className="lg:hidden fixed bottom-4 inset-x-4 z-30">
        <div className="bg-white shadow-xl rounded-2xl border border-gray-200 p-3 flex items-center gap-3 backdrop-blur supports-[backdrop-filter]:bg-white/90">
          <div className="flex-1">
            <p className="text-sm text-gray-600">Desde</p>
            <p className="text-lg font-semibold text-gray-900">
              ${property.price_per_night.toLocaleString('es-CO')} <span className="text-sm text-gray-600">/ noche</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCartModal(true)}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-md"
            >
              Agregar al carrito
            </button>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl bg-green-600 text-white font-semibold shadow-md"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Modal de Agregar al Carrito */}
      <AddToCartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        type="property"
        itemId={property.id}
        itemName={property.name}
        city={property.city}
        basePrice={property.price_per_night}
        maxGuests={property.guests}
        imageUrl={mainImage}
        initialCheckIn={selectedCheckIn ? selectedCheckIn.toISOString().split('T')[0] : ''}
        initialCheckOut={selectedCheckOut ? selectedCheckOut.toISOString().split('T')[0] : ''}
        initialGuests={selectedGuests}
        extraGuestFee={property.extra_guest_fee}
        baseGuests={property.base_guests}
      />
    </div>
  );
};

export default PropertyDetailPageDynamic;
