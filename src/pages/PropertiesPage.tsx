import React, { useState } from 'react';
import QuickCard from '../components/QuickCard';
import Background from '../components/Background';
import { quickProperties } from '../data/showcases';

const PropertiesPage: React.FC = () => {
  const [filterType, setFilterType] = useState('Todas');

  // Tipos únicos de propiedades
  const propertyTypes = ['Todas', ...new Set(quickProperties.map(p => p.location).sort())];

  // Filtrar por ubicación
  const filteredProperties = 
    filterType === 'Todas' 
      ? quickProperties 
      : quickProperties.filter(p => p.location === filterType);

  return (
    <Background>
      <div className="min-h-screen pt-40 pb-16 px-4">
        <div className="container mx-auto">
          {/* Banner de apoyo y beneficios */}
          <div className="mb-10">
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1.6fr_auto] md:items-center gap-6 md:gap-8">
              <div className="space-y-2 md:max-w-3xl">
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  Reserva directa
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  Al reservar directamente con nosotros apoyas el emprendimiento colombiano
                </h2>
                <p className="text-gray-600 text-base md:text-lg">
                  Atención prioritaria, coordinación personalizada y tarifas exclusivas con aliados locales. Beneficios reales por reservar directo.
                </p>
              </div>
              <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto md:justify-self-end">
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold bg-green-600 text-white hover:bg-green-700 transition shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5 fill-current">
                    <path d="M16.04 5c-6.08 0-11 4.92-11 10.98 0 2.17.64 4.21 1.87 5.99L5 27l5.19-1.69A10.98 10.98 0 0 0 16.04 27c6.08 0 11-4.92 11-10.98C27.04 9.92 22.12 5 16.04 5Zm0 19.98c-1.75 0-3.47-.46-4.98-1.34l-.36-.21-3.08 1 1-3.01-.23-.39a8.96 8.96 0 0 1-1.36-4.67c0-4.97 4.05-9.02 9.01-9.02 4.96 0 9.01 4.05 9.01 9.02 0 4.97-4.05 9.02-9.01 9.02Zm5.11-6.74c-.28-.14-1.64-.81-1.89-.9-.25-.09-.43-.14-.61.14-.19.28-.74.9-.9 1.08-.16.19-.33.21-.61.07-.28-.14-1.17-.43-2.22-1.35-.82-.73-1.38-1.64-1.54-1.92-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.02-.36-.02-.55-.02-.19 0-.5.07-.76.36-.26.28-1 1-1 2.42 0 1.43 1.02 2.81 1.17 3 .14.19 2 3.2 4.84 4.36.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.64-.67 1.87-1.32.23-.65.23-1.21.16-1.32-.07-.12-.25-.19-.53-.33Z"/>
                  </svg>
                  Hablar por WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-10">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                <span className="text-yellow-300">Todas</span> nuestras{' '}
                <span className="text-blue-600">propiedades</span>
              </h1>
              <p className="text-gray-600 text-lg">
                Descubre todos nuestros alojamientos cuidadosamente seleccionados para tu comodidad.
              </p>
            </div>
          </div>

          {/* Filtro */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-gray-700 font-semibold">Filtrar por ubicación:</label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="border-2 border-blue-300 rounded-lg px-4 py-2 font-medium focus:outline-none focus:border-blue-600 transition"
              >
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="text-gray-600">
              <span className="font-semibold text-gray-900">{filteredProperties.length}</span> propiedades
            </div>
          </div>

          {/* Grid de propiedades */}
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map(property => (
                <QuickCard
                  key={property.id}
                  item={property}
                  ctaLabel="Quiero reservar"
                  detailRoute="property"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron propiedades</h3>
              <p className="text-gray-500 mb-6">No hay propiedades disponibles en esta ubicación.</p>
              <button
                onClick={() => setFilterType('Todas')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Ver todas las propiedades
              </button>
            </div>
          )}
        </div>
      </div>
    </Background>
  );
};

export default PropertiesPage;