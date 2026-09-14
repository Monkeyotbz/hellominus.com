import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import AddToCartModal from '../components/AddToCartModal';
import { 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers, 
  FaStar, 
  FaWhatsapp,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCheckCircle
} from 'react-icons/fa';
import { ShoppingCart } from 'lucide-react';

interface TourDetail {
  id: number;
  name: string;
  description: string;
  location: string;
  city: string;
  price: number;
  duration: string;
  difficulty: string;
  max_people: number;
  rating: number;
  reviews_count: number;
  includes: string[];
  images: string[];
}

const TourDetailPageDynamic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<TourDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTour();
    }
  }, [id]);

  const fetchTour = async () => {
    try {
      const { data: allTours, error } = await supabase
        .from('tours')
        .select(`
          id,
          name,
          description,
          location,
          city,
          price,
          duration,
          difficulty,
          max_people,
          rating,
          reviews_count,
          includes,
          tour_images(
            id,
            image_url,
            display_order
          )
        `)
        .eq('active', true);

      if (error) throw error;

      const foundTour = allTours?.find((t: any) => {
        const slug = t.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '');
        return slug === id;
      });

      if (!foundTour) {
        console.error('Tour not found');
        setLoading(false);
        return;
      }

      const images = foundTour.tour_images
        ?.sort((a: any, b: any) => a.display_order - b.display_order)
        .map((img: any) => img.image_url) || [];

      setTour({
        id: foundTour.id,
        name: foundTour.name,
        description: foundTour.description,
        location: foundTour.location,
        city: foundTour.city,
        price: foundTour.price,
        duration: foundTour.duration,
        difficulty: foundTour.difficulty,
        max_people: foundTour.max_people,
        rating: foundTour.rating,
        reviews_count: foundTour.reviews_count,
        includes: foundTour.includes || [],
        images
      });
    } catch (error) {
      console.error('Error fetching tour:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (tour) {
      setCurrentImageIndex((prev) => (prev + 1) % tour.images.length);
    }
  };

  const prevImage = () => {
    if (tour) {
      setCurrentImageIndex((prev) => (prev - 1 + tour.images.length) % tour.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-20 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tour no encontrado</h1>
          <a href="/tours" className="text-blue-600 hover:underline">Volver a tours</a>
        </div>
      </div>
    );
  }

  const whatsappMessage = `Hola, quiero reservar el tour ${tour.name}`;
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Image Gallery */}
        <div className="mb-8">
          {tour.images.length > 0 ? (
            <div className="relative">
              {/* Main Image */}
              <div 
                className="relative h-[500px] rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => setShowFullScreen(true)}
              >
                <img
                  src={tour.images[currentImageIndex]}
                  alt={tour.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
              </div>

              {/* Image Navigation */}
              {tour.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                  >
                    <FaChevronLeft className="text-gray-800 text-xl" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                  >
                    <FaChevronRight className="text-gray-800 text-xl" />
                  </button>

                  {/* Thumbnails */}
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {tour.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${tour.name} ${index + 1}`}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-20 h-20 object-cover rounded-lg cursor-pointer transition-all ${
                          index === currentImageIndex ? 'ring-4 ring-blue-600' : 'opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-[500px] bg-gray-200 rounded-xl flex items-center justify-center">
              <p className="text-gray-500">No hay imágenes disponibles</p>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title and Location */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{tour.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-600" />
                  <span>{tour.location}, {tour.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-blue-600" />
                  <span>{tour.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-500" />
                  <span>{tour.rating} ({tour.reviews_count} reseñas)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre este tour</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{tour.description}</p>
            </div>

            {/* What's Included */}
            {tour.includes.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Qué incluye</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tour.includes.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tour Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Detalles del tour</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <FaUsers className="text-blue-600 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Grupo máximo</p>
                    <p className="font-semibold text-gray-900">{tour.max_people} personas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaClock className="text-blue-600 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Dificultad</p>
                    <p className="font-semibold text-gray-900">{tour.difficulty}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-6 sticky top-24">
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-2">Desde</p>
                <p className="text-4xl font-bold text-blue-600">
                  ${tour.price.toLocaleString('es-CO')}
                </p>
                <p className="text-gray-500 text-sm mt-1">por persona</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setShowCartModal(true)}
                  className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold transition-colors shadow-lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al Carrito
                </button>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-semibold transition-colors"
                >
                  <FaWhatsapp className="text-2xl" />
                  Consultar por WhatsApp
                </a>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  ✓ Confirmación inmediata<br />
                  ✓ Cancelación gratis<br />
                  ✓ Mejor precio garantizado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {showFullScreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={() => setShowFullScreen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <FaTimes className="text-3xl" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-4 rounded-full transition-all z-10"
          >
            <FaChevronLeft className="text-white text-2xl" />
          </button>

          <img
            src={tour.images[currentImageIndex]}
            alt={tour.name}
            className="max-w-full max-h-full object-contain"
          />

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-4 rounded-full transition-all z-10"
          >
            <FaChevronRight className="text-white text-2xl" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentImageIndex + 1} / {tour.images.length}
          </div>
        </div>
      )}

      {/* Modal de Agregar al Carrito */}
      {tour && (
        <AddToCartModal
          isOpen={showCartModal}
          onClose={() => setShowCartModal(false)}
          type="tour"
          itemId={tour.id.toString()}
          itemName={tour.name}
          city={tour.city}
          basePrice={tour.price}
          maxGuests={tour.max_people}
          imageUrl={tour.images[0]}
        />
      )}
    </div>
  );
};

export default TourDetailPageDynamic;
