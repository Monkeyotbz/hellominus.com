import React, { useState } from 'react';
import Background from '../components/Background';
import { Link } from 'react-router-dom';

const destinations = [
  {
    id: 'cartagena',
    name: 'Cartagena de Indias',
    region: 'Caribe',
    image: '/Cartagena.jpg',
    description: 'Ciudad amurallada patrimonio de la humanidad. Historia colonial, playas paradisíacas y gastronomía caribeña.',
    highlights: ['Ciudad amurallada', 'Islas del Rosario', 'Playas', 'Vida nocturna'],
    bestTime: 'Diciembre - Marzo',
  },
  {
    id: 'medellin',
    name: 'Medellín',
    region: 'Antioquia',
    image: '/Medellin1.jpg',
    description: 'La ciudad de la eterna primavera. Innovación, cultura paisa, clima perfecto y transformación urbana ejemplar.',
    highlights: ['Clima primaveral', 'Cultura paisa', 'Comuna 13', 'Parques temáticos'],
    bestTime: 'Todo el año',
  },
  {
    id: 'jerico',
    name: 'Jericó',
    region: 'Antioquia',
    image: '/Jerico1.jpg',
    description: 'El pueblo más lindo de Antioquia. Arquitectura colonial, café de altura y paisajes de montaña espectaculares.',
    highlights: ['Pueblo patrimonio', 'Café artesanal', 'Arquitectura colonial', 'Senderismo'],
    bestTime: 'Junio - Agosto',
  },
  {
    id: 'islas-rosario',
    name: 'Islas del Rosario',
    region: 'Caribe',
    image: '/Isla Palmarito Beach.jpg',
    description: 'Archipiélago paradisíaco con 27 islas. Playas cristalinas, arrecifes de coral y biodiversidad marina única.',
    highlights: ['Playas cristalinas', 'Snorkel', 'Arrecifes de coral', 'Oceanario'],
    bestTime: 'Diciembre - Abril',
  },
  {
    id: 'jardin',
    name: 'Jardín',
    region: 'Antioquia',
    image: '/JardinA.jpg',
    description: 'Pueblo colorido entre montañas. Naturaleza exuberante, aves endémicas y tradición cafetera.',
    highlights: ['Avistamiento de aves', 'Café orgánico', 'Cascadas', 'Teleférico'],
    bestTime: 'Junio - Septiembre',
  },
  {
    id: 'san-andres',
    name: 'San Andrés y Providencia',
    region: 'Caribe',
    image: '/Qué hacer en San Andrés en 4 días _ Travelgraf.jpg',
    description: 'Islas caribeñas con mar de siete colores. Cultura raizal, playas paradisíacas y deportes acuáticos.',
    highlights: ['Mar de 7 colores', 'Buceo', 'Johnny Cay', 'Cultura raizal'],
    bestTime: 'Febrero - Abril',
  },
];

const regions = ['Todos', 'Caribe', 'Antioquia', 'Oro Nacional', 'Eventos'];

const oroNacional = [
  {
    id: 'cafe-colombia',
    name: 'Café Colombiano',
    image: '/oro1.jpg',
    description: 'El mejor café del mundo. Descubre el proceso desde la semilla hasta la taza en las plantaciones del Eje Cafetero.',
  },
  {
    id: 'esmeraldas',
    name: 'Esmeraldas Colombianas',
    image: '/oro5.jpg',
    description: 'Colombia produce las esmeraldas más puras y hermosas del mundo. Visita las minas de Muzo y Chivor.',
  },
  {
    id: 'biodiversidad',
    name: 'Biodiversidad',
    image: '/oro8.jpg',
    description: 'Colombia es el segundo país más biodiverso del mundo. Más de 1,900 especies de aves y ecosistemas únicos.',
  },
  {
    id: 'musica',
    name: 'Música Colombiana',
    image: '/oro12.jpg',
    description: 'Desde el vallenato hasta la champeta, pasando por cumbia y salsa. Colombia es ritmo y alegría.',
  },
];

const eventos = [
  {
    id: 'feria-flores',
    name: 'Feria de las Flores',
    location: 'Medellín',
    month: 'Agosto',
    image: '/IMG-20240612-WA0042.jpg',
    description: 'El evento más importante de Medellín. Desfile de silleteros, conciertos y celebración de la cultura paisa.',
  },
  {
    id: 'carnaval-barranquilla',
    name: 'Carnaval de Barranquilla',
    location: 'Barranquilla',
    month: 'Febrero - Marzo',
    image: '/IMG-20231225-WA0186.jpg',
    description: 'Patrimonio Cultural de la Humanidad. Uno de los carnavales más importantes de América Latina.',
  },
  {
    id: 'festival-vallenato',
    name: 'Festival Vallenato',
    location: 'Valledupar',
    month: 'Abril',
    image: '/IMG-20240220-WA0184.jpg',
    description: 'Celebración de la música vallenata con competencias de acordeoneros y eventos culturales.',
  },
  {
    id: 'festival-cine-cartagena',
    name: 'Festival de Cine de Cartagena',
    location: 'Cartagena',
    month: 'Marzo',
    image: '/Cartagena.jpg',
    description: 'El festival de cine más antiguo de América Latina. Cine iberoamericano en la ciudad amurallada.',
  },
];

const DestinosPage: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('Todos');

  const filteredDestinations =
    selectedRegion === 'Todos'
      ? destinations
      : destinations.filter((d) => d.region === selectedRegion);

  return (
    <Background>
      <div className="min-h-screen pt-40 pb-20 px-4">
        <div className="container mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Descubre los <span className="text-blue-600">Destinos</span> de Colombia
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explora la diversidad de paisajes, culturas y experiencias que Colombia tiene para ofrecerte.
              Desde playas caribeñas hasta pueblos de montaña, cada destino es una aventura única.
            </p>
          </div>

          {/* Filtros por región */}
          <div className="flex justify-center gap-4 mb-16 flex-wrap">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  selectedRegion === region
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Grid de destinos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredDestinations.map((destination) => (
              <div
                key={destination.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative overflow-hidden h-64">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {destination.region}
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {destination.name}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {destination.description}
                  </p>

                  {/* Highlights */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Destacados:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {destination.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mejor época */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-blue-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      <strong>Mejor época:</strong> {destination.bestTime}
                    </span>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    <Link
                      to="/properties"
                      className="flex-1 bg-blue-600 text-white text-center px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Ver hospedajes
                    </Link>
                    <Link
                      to="/tours"
                      className="flex-1 border-2 border-blue-600 text-blue-600 text-center px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    >
                      Ver tours
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sección Oro Nacional */}
          {selectedRegion === 'Oro Nacional' && (
            <div className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Oro Nacional de Colombia
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Descubre las riquezas naturales y culturales que hacen de Colombia un país único en el mundo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {oroNacional.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative overflow-hidden h-72">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <h3 className="absolute bottom-6 left-6 text-3xl font-bold text-white">
                        {item.name}
                      </h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sección Eventos */}
          {selectedRegion === 'Eventos' && (
            <div className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Eventos y Festivales
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Colombia celebra su cultura con festivales únicos durante todo el año. Planifica tu viaje para vivirlos.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {eventos.map((evento) => (
                  <div
                    key={evento.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative overflow-hidden h-64">
                      <img
                        src={evento.image}
                        alt={evento.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        {evento.month}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {evento.name}
                      </h3>
                      <p className="text-blue-600 font-semibold mb-3">
                        📍 {evento.location}
                      </p>
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {evento.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Final */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl mt-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para tu próxima aventura?
            </h2>
            <p className="text-xl mb-6 text-blue-100 max-w-2xl mx-auto">
              Reserva directamente con nosotros y obtén tarifas exclusivas, atención personalizada
              y beneficios especiales. ¡Apoya el emprendimiento colombiano!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 32"
                  className="w-6 h-6 fill-current"
                >
                  <path d="M16.04 5c-6.08 0-11 4.92-11 10.98 0 2.17.64 4.21 1.87 5.99L5 27l5.19-1.69A10.98 10.98 0 0 0 16.04 27c6.08 0 11-4.92 11-10.98C27.04 9.92 22.12 5 16.04 5Zm0 19.98c-1.75 0-3.47-.46-4.98-1.34l-.36-.21-3.08 1 1-3.01-.23-.39a8.96 8.96 0 0 1-1.36-4.67c0-4.97 4.05-9.02 9.01-9.02 4.96 0 9.01 4.05 9.01 9.02 0 4.97-4.05 9.02-9.01 9.02Zm5.11-6.74c-.28-.14-1.64-.81-1.89-.9-.25-.09-.43-.14-.61.14-.19.28-.74.9-.9 1.08-.16.19-.33.21-.61.07-.28-.14-1.17-.43-2.22-1.35-.82-.73-1.38-1.64-1.54-1.92-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.02-.36-.02-.55-.02-.19 0-.5.07-.76.36-.26.28-1 1-1 2.42 0 1.43 1.02 2.81 1.17 3 .14.19 2 3.2 4.84 4.36.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.64-.67 1.87-1.32.23-.65.23-1.21.16-1.32-.07-.12-.25-.19-.53-.33Z" />
                </svg>
                Consultar por WhatsApp
              </a>
              <Link
                to="/properties"
                className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                Ver todos los hospedajes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default DestinosPage;
