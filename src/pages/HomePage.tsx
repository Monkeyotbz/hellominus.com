import React from 'react';
import HeroSection from '../components/HeroSection';
import Background from '../components/Background';
import PropertiesShowcaseDynamic from '../components/PropertiesShowcaseDynamic';
import ToursShowcaseDynamic from '../components/ToursShowcaseDynamic';

const HomePage: React.FC = () => {
  return (
    <Background>
      <div className="min-h-screen bg-gradient-to-b from-white/80 via-white to-white">
        <HeroSection />

        <PropertiesShowcaseDynamic />

        <section className="py-16 px-4 bg-gradient-to-b from-[#eaf1ff] via-[#f3f6ff] to-[#eaf1ff]">
          <div className="max-w-6xl mx-auto text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                ¿Por qué elegir Hellominus?
              </h2>
              <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
                Ofrecemos una experiencia de reserva excepcional con ofertas exclusivas y recomendaciones personalizadas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 flex flex-col items-center text-center gap-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7 fill-current">
                    <path d="M9 11.3 11.3 14.5 16.2 9.7 17.7 11.1 11.3 17.5 7.5 12.3 9 11.3ZM12 2A10 10 0 1 0 22 12 10 10 0 0 0 12 2Zm0 18A8 8 0 1 1 20 12 8 8 0 0 1 12 20Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Mejor Precio Garantizado</h3>
                <p className="text-gray-600 text-base">
                  Igualamos o superamos cualquier precio de la competencia, asegurando que siempre obtengas la mejor oferta disponible.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 flex flex-col items-center text-center gap-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7 fill-current">
                    <path d="M4 5H20V7H4V5ZM4 11H20V13H4V11ZM4 17H20V19H4V17Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Ofertas Exclusivas</h3>
                <p className="text-gray-600 text-base">
                  Accede a promociones y descuentos especiales que no encontrarás en otras plataformas de reservas.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 flex flex-col items-center text-center gap-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7 fill-current">
                    <path d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2ZM12 11.5C10.6193 11.5 9.5 10.3807 9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9C14.5 10.3807 13.3807 11.5 12 11.5Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Experiencia Local</h3>
                <p className="text-gray-600 text-base">
                  Obtén consejos y recomendaciones de nuestro equipo de expertos locales en viajes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <ToursShowcaseDynamic />

        {/* Sección de valores y características */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Grid de características con imágenes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="relative overflow-hidden rounded-2xl shadow-lg group h-80">
                <img 
                  src="/mesero.jpeg" 
                  alt="Hospitalidad y Servicio" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-1">Hospitalidad y</h3>
                    <h3 className="text-xl font-bold">Servicio al Cliente Excepcionales</h3>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl shadow-lg group h-80">
                <img 
                  src="/IMG-20231225-WA0149.jpg" 
                  alt="Autenticidad y Experiencias Locales" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-1">Autenticidad y</h3>
                    <h3 className="text-xl font-bold">Experiencias Locales</h3>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl shadow-lg group h-80">
                <img 
                  src="/IMG-20231216-WA0105.jpg" 
                  alt="Planes turísticos flexibles" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-1">Planes turísticos</h3>
                    <h3 className="text-xl font-bold">flexibles y personalizados</h3>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl shadow-lg group h-80">
                <img 
                  src="/IMG-20240612-WA0091.jpg" 
                  alt="Seguridad y Bienestar" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-1">Seguridad y</h3>
                    <h3 className="text-xl font-bold">Bienestar del Viajero</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de imágenes grandes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative overflow-hidden rounded-2xl shadow-lg group h-96">
                <img 
                  src="/IMG-20240220-WA0184.jpg" 
                  alt="Destino Colombia" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="relative overflow-hidden rounded-2xl shadow-lg group h-96">
                <img 
                  src="/Cartagena.jpg" 
                  alt="Cartagena" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="relative overflow-hidden rounded-2xl shadow-lg group h-96">
                <img 
                  src="/Isla Palmarito Beach.jpg" 
                  alt="Islas del Rosario" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="relative overflow-hidden rounded-2xl shadow-lg group h-96 lg:col-span-2">
                <img 
                  src="/IMG-20231225-WA0186.jpg" 
                  alt="Experiencias únicas" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="relative overflow-hidden rounded-2xl shadow-lg group h-96">
                <img 
                  src="/IMG-20240612-WA0042.jpg" 
                  alt="Aventuras Colombia" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>

      </div>
    </Background>
  );
};

export default HomePage;
