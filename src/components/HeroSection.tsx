import React from 'react';
import SearchBar from './SearchBar';
import { useNavigate } from 'react-router-dom';
import Background from './Background';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const manejarBusqueda = (searchParams: {
    destination: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (searchParams.destination) queryParams.append('destination', searchParams.destination);
    if (searchParams.checkIn) queryParams.append('checkIn', searchParams.checkIn);
    if (searchParams.checkOut) queryParams.append('checkOut', searchParams.checkOut);
    queryParams.append('guests', searchParams.guests.toString());
    navigate(`/properties?${queryParams.toString()}`);
  };

  const heroBackgrounds = [
    'https://images.pexels.com/photos/2884864/pexels-photo-2884864.jpeg',
  ];

  return (
    <Background backgrounds={heroBackgrounds} className="relative" minHeight="65vh">
      {/* Degradado overlay mejorado */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/30 to-black/60 pointer-events-none" />
      
      {/* Contenido */}
      <div className="relative z-20 container mx-auto px-4 flex flex-col justify-center pt-44 sm:pt-48 md:pt-40 pb-16 min-h-[65vh]">
        {/* Título principal estilo Booking.com */}
        <div className="max-w-5xl mx-auto mb-6 space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
            Encuentra tu próxima estancia
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-white font-normal drop-shadow-md">
            Busca ofertas en hoteles, casas y mucho más en Colombia
          </p>
          
          {/* Barra de búsqueda estilo Booking */}
          <div className="mt-6">
            <SearchBar onSearch={manejarBusqueda} className="max-w-5xl" />
          </div>
        </div>
      </div>
    </Background>
  );
};

export default HeroSection;
