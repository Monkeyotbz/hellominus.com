import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, MessageCircle, ExternalLink } from 'lucide-react';
import { ShowcaseItem } from './QuickCard';

type PropertyDetailProps = {
  item: ShowcaseItem;
  images?: string[]; // Array de URLs de imágenes adicionales (opcional)
  ctaLabel?: string;
};

const PropertyDetail: React.FC<PropertyDetailProps> = ({ item, images = [item.image], ctaLabel = 'Quiero reservar' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allImages = images.length > 0 ? images : [item.image];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="bg-white pt-[140px]">
      {/* Galería de imágenes */}
      <div className="w-full bg-gray-900">
        {/* Imagen principal */}
        <div className="relative w-full h-80 md:h-96 bg-gray-800 overflow-hidden flex items-center justify-center">
          <img
            src={allImages[currentImageIndex]}
            alt={item.name}
            className="w-full h-full object-contain"
          />

          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-6 h-6 text-gray-900" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="w-6 h-6 text-gray-900" />
              </button>
            </>
          )}
        </div>

        {/* Miniaturas de imágenes - Grid responsivo */}
        {allImages.length > 1 && (
          <div className="bg-gray-900 px-4 py-3">
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`aspect-square rounded overflow-hidden border-2 transition hover:opacity-100 ${
                    idx === currentImageIndex ? 'border-blue-500 opacity-100' : 'border-gray-700 opacity-60'
                  }`}
                  aria-label={`Ver imagen ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <div className="mb-6">
            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
              {item.priceLabel}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">{item.name}</h1>
            <p className="text-gray-600 flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5" /> {item.location}
            </p>
          </div>

          {/* Descripción principal */}
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed text-lg">{item.description}</p>
          </div>

          {/* Características / Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Características</h3>
              <div className="flex flex-wrap gap-3">
                {item.tags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm"
                  >
                    ✓ {tag}
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
              {ctaLabel}
            </a>
            {item.booking && (
              <a
                href={item.booking}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition"
              >
                <ExternalLink className="w-5 h-5" />
                Ver en Booking
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
