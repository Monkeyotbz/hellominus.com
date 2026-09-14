import React, { useState } from 'react';
import QuickCard from '../components/QuickCard';
import Background from '../components/Background';
import { quickTours } from '../data/showcases';

const ToursPage: React.FC = () => {
  const [filterLocation, setFilterLocation] = useState('Todas');

  // Ubicaciones únicas de tours
  const locations = ['Todas', ...new Set(quickTours.map(t => t.location).sort())];

  // Filtrar por ubicación
  const filteredTours = 
    filterLocation === 'Todas' 
      ? quickTours 
      : quickTours.filter(t => t.location === filterLocation);

  return (
    <Background>
      <div className="min-h-screen pt-40 pb-16 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                <span className="text-yellow-300">Todas</span> nuestras{' '}
                <span className="text-blue-600">experiencias</span>
              </h1>
              <p className="text-gray-600 text-lg">
                Descubre todos nuestros tours y aventuras cuidadosamente diseñados para ti.
              </p>
            </div>
          </div>

          {/* Filtro */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-gray-700 font-semibold">Filtrar por destino:</label>
              <select
                value={filterLocation}
                onChange={e => setFilterLocation(e.target.value)}
                className="border-2 border-blue-300 rounded-lg px-4 py-2 font-medium focus:outline-none focus:border-blue-600 transition"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div className="text-gray-600">
              <span className="font-semibold text-gray-900">{filteredTours.length}</span> tours disponibles
            </div>
          </div>

          {/* Grid de tours */}
          {filteredTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTours.map(tour => (
                <QuickCard
                  key={tour.id}
                  item={tour}
                  ctaLabel="Reservar tour"
                  detailRoute="tour"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron tours</h3>
              <p className="text-gray-500 mb-6">No hay tours disponibles en este destino.</p>
              <button
                onClick={() => setFilterLocation('Todas')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Ver todos los tours
              </button>
            </div>
          )}
        </div>
      </div>
    </Background>
  );
};

export default ToursPage;
