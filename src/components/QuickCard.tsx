import React from 'react';
import { ExternalLink, MapPin, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export type ShowcaseItem = {
  id: string;
  dbId?: string; // ID de la base de datos
  name: string;
  location: string;
  description: string;
  image: string;
  priceLabel: string;
  whatsapp: string;
  booking?: string;
  tags?: string[];
  category?: string; // Para categorizar tours por destino
  propertyType?: string; // hotel, apartamento, casa, cabaña, hostal
  city?: string; // Ciudad de la propiedad
  featured?: boolean; // Si es destacada
  difficulty?: string; // Dificultad del tour (Fácil, Moderado, Difícil)
};

type QuickCardProps = {
  item: ShowcaseItem;
  ctaLabel?: string;
  detailRoute?: 'property' | 'tour'; // Determina la ruta de detalle
};

const QuickCard: React.FC<QuickCardProps> = ({ item, ctaLabel, detailRoute = 'property' }) => {
  const detailPath = `/${detailRoute}/${item.id}`;
  
  // Detectar si el booking link es de Airbnb
  const isAirbnb = item.booking?.includes('airbnb');
  const isBooking = item.booking?.includes('booking.com');

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full">
      <Link to={detailPath} className="relative h-56 bg-gray-100 group overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
        />
        <span className="absolute top-3 left-3 bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full">
          {item.priceLabel}
        </span>
      </Link>
      <div className="p-5 flex-1 flex flex-col">
        <Link to={detailPath} className="group">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
            {item.name}
          </h3>
          <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" /> {item.location}
          </p>
        </Link>
        <p className="text-gray-600 text-sm mt-3 leading-relaxed">{item.description}</p>
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {item.tags.map(tag => (
              <span key={tag} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Espaciador que empuja los botones hacia abajo */}
        <div className="flex-1"></div>
        
        <div className="mt-5 flex flex-col gap-3">
          <Link
            to={detailPath}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition w-full"
          >
            Ver detalles y reservar
          </Link>
          <a
            href={item.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            <MessageCircle className="w-4 h-4" />
            {ctaLabel ?? 'Hablar por WhatsApp'}
          </a>
          {isAirbnb && (
            <a
              href={item.booking}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-pink-500 text-pink-500 hover:bg-pink-50 px-4 py-2 rounded-lg font-semibold transition"
            >
              <ExternalLink className="w-4 h-4" />
              Ver en Airbnb
            </a>
          )}
          {isBooking && (
            <a
              href={item.booking}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-semibold transition"
            >
              <ExternalLink className="w-4 h-4" />
              Ver en Booking
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickCard;
