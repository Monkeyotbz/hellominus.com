import React from 'react';
import QuickCard from './QuickCard';
import { quickTours } from '../data/showcases';

const ToursShowcase: React.FC = () => {
  return (
    <section id="tours" className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="inline-block text-sm uppercase tracking-wider bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold">Tours seleccionados</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold mt-3 leading-tight">
              <span className="text-yellow-300">Experiencias</span>{' '}
              <span className="text-blue-600">que no puedes</span>{' '}
              <span className="text-red-600">perderte</span>
            </h2>
            <div className="mt-4">
              <p className="text-gray-700 text-lg">Tours curados con guías locales, transporte y actividades incluidas. <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md font-medium">Explora destinos</span> únicos en Colombia.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="/tours" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-semibold shadow">Ver todos los tours</a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {quickTours.map(item => (
            <QuickCard key={item.id} item={item} ctaLabel="Hablar ahora" detailRoute="tour" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToursShowcase;
