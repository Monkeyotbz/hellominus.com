import React, { useEffect, useState } from 'react';
import QuickCard, { ShowcaseItem } from '../components/QuickCard';
import { supabase } from '../supabaseClient';

const ToursPageDynamic: React.FC = () => {
  const [allTours, setAllTours] = useState<ShowcaseItem[]>([]);
  const [filteredTours, setFilteredTours] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterCity, setFilterCity] = useState('all');

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allTours, searchTerm, filterDifficulty, filterCity]);

  const fetchTours = async () => {
    try {
      const { data, error } = await supabase
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
          featured,
          active,
          includes,
          tour_images(
            id,
            image_url,
            display_order
          )
        `)
        .eq('active', true)
        .order('featured', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;

      const transformedTours: ShowcaseItem[] = (data || []).map((tour: any) => {
        const firstImage = tour.tour_images && tour.tour_images.length > 0
          ? tour.tour_images.sort((a: any, b: any) => a.display_order - b.display_order)[0]
          : null;

        const slug = tour.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '');

        return {
          id: slug,
          dbId: tour.id,
          name: tour.name,
          location: `${tour.location}, ${tour.city}`,
          description: tour.description,
          image: firstImage?.image_url || '/placeholder-tour.jpg',
          priceLabel: `${tour.duration} - $${tour.price.toLocaleString('es-CO')}`,
          whatsapp: `https://wa.me/?text=${encodeURIComponent(`Hola, quiero reservar ${tour.name}`)}`,
          booking: '#',
          tags: tour.includes || [],
          category: tour.city,
          featured: tour.featured,
          difficulty: tour.difficulty
        };
      });

      setAllTours(transformedTours);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...allTours];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(tour =>
        tour.name.toLowerCase().includes(term) ||
        tour.location.toLowerCase().includes(term) ||
        tour.description.toLowerCase().includes(term)
      );
    }

    if (filterDifficulty !== 'all') {
      result = result.filter(tour => tour.difficulty === filterDifficulty);
    }

    if (filterCity !== 'all') {
      result = result.filter(tour => tour.category === filterCity);
    }

    setFilteredTours(result);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDifficulty('all');
    setFilterCity('all');
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-28 pb-16 px-4 sm:pt-24">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 break-words">
            Todos los <span className="text-blue-600">Tours</span>
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            Descubre experiencias únicas en los destinos más hermosos de Colombia
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Buscar tours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="all">Todas las dificultades</option>
              <option value="Fácil">Fácil</option>
              <option value="Moderado">Moderado</option>
              <option value="Difícil">Difícil</option>
            </select>

            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="all">Todas las ciudades</option>
              <option value="Medellín">Medellín</option>
              <option value="Cartagena">Cartagena</option>
              <option value="Jardín">Jardín</option>
              <option value="Jericó">Jericó</option>
              <option value="San Jerónimo">San Jerónimo</option>
            </select>

            <button
              onClick={clearFilters}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Mostrando <span className="font-semibold text-blue-600">{filteredTours.length}</span> de{' '}
            <span className="font-semibold">{allTours.length}</span> tours
          </div>
        </div>

        {/* Tours Grid */}
        {filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map(tour => (
              <QuickCard key={tour.id} item={tour} ctaLabel="Reservar tour" detailRoute="tour" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <p className="text-gray-500 text-lg mb-4">No se encontraron tours con los filtros seleccionados</p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToursPageDynamic;
