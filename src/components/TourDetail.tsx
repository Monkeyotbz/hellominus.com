import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, MessageCircle, ExternalLink, Clock, Users } from 'lucide-react';
import { ShowcaseItem } from './QuickCard';

type TourDetailProps = {
  item: ShowcaseItem;
  images?: string[];
  duration?: string; // Ej: "3 días"
  groupSize?: string; // Ej: "Máximo 8 personas"
};

const TourDetail: React.FC<TourDetailProps> = ({
  item,
  images = [item.image],
  duration = '2 días',
  groupSize = '2-10 personas',
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allImages = images.length > 0 ? images : [item.image];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="bg-white pt-40">
      {/* Galería de imágenes */}
      <div className="relative w-full h-96 md:h-[500px] bg-gray-200 overflow-hidden">
        <img
          src={allImages[currentImageIndex]}
          alt={item.name}
          className="w-full h-full object-cover"
        />

        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow transition"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow transition"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="w-6 h-6 text-gray-900" />
            </button>

            {/* Indicador de imágenes */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition ${
                    idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`Ir a imagen ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Contenido */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <div className="mb-6">
            <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold mb-4">
              {item.priceLabel}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">{item.name}</h1>
            <p className="text-gray-600 flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5" /> {item.location}
            </p>
          </div>

          {/* Información de la excursión */}
          <div className="grid grid-cols-2 gap-4 mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Duración</p>
                <p className="font-semibold text-gray-900">{duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Tamaño del grupo</p>
                <p className="font-semibold text-gray-900">{groupSize}</p>
              </div>
            </div>
          </div>

          {/* Descripción principal */}
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed text-lg">{item.description}</p>
          </div>

          {/* Qué está incluido */}
          {item.tags && item.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Incluido en el tour</h3>
              <div className="space-y-3">
                {item.tags.map((tag) => (
                  <div key={tag} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="text-green-600 text-lg mt-0.5">✓</span>
                    <span className="text-gray-700 font-medium">{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mt-10">
            <a
              href={item.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow"
            >
              <MessageCircle className="w-5 h-5" />
              Reservar esta experiencia
            </a>
            {item.booking && (
              <a
                href={item.booking}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition"
              >
                <ExternalLink className="w-5 h-5" />
                Ver más opciones
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
