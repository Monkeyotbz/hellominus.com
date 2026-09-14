import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import QuickCard, { ShowcaseItem } from '../components/QuickCard';
import { supabase } from '../supabaseClient';

const PropertiesPageDynamic: React.FC = () => {
  const [properties, setProperties] = useState<ShowcaseItem[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('Todas');
  const [filterCity, setFilterCity] = useState<string>('Todas');

  const propertyTypes = ['Todas', 'hotel', 'apartamento', 'casa', 'cabaña', 'hostal'];
  const cities = ['Todas', 'Medellín', 'Cartagena', 'Jardín', 'Jericó', 'San Jerónimo', 'Pitalito'];

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, searchTerm, filterType, filterCity]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          description,
          location,
          city,
          price_per_night,
          property_type,
          featured,
          active,
          amenities,
          property_images(
            id,
            image_url,
            display_order
          )
        `)
        .eq('active', true) // Solo propiedades activas
        .order('featured', { ascending: false }) // Destacadas primero
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar los datos
      const transformedProperties: ShowcaseItem[] = (data || []).map((prop: any) => {
        const firstImage = prop.property_images && prop.property_images.length > 0
          ? prop.property_images.sort((a: any, b: any) => a.display_order - b.display_order)[0]
          : null;

        const slug = prop.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '');

        return {
          id: slug,
          dbId: prop.id,
          name: prop.name,
          location: `${prop.location}, ${prop.city}`,
          description: prop.description,
          image: firstImage?.image_url || '/placeholder-property.jpg',
          priceLabel: `Desde $${prop.price_per_night.toLocaleString('es-CO')} / noche`,
          whatsapp: `https://wa.me/?text=${encodeURIComponent(`Hola, quiero reservar ${prop.name}`)}`,
          booking: '#',
          tags: prop.amenities || [],
          propertyType: prop.property_type,
          city: prop.city,
          featured: prop.featured
        };
      });

      setProperties(transformedProperties);
      setFilteredProperties(transformedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...properties];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo
    if (filterType !== 'Todas') {
      filtered = filtered.filter(p => p.propertyType === filterType);
    }

    // Filtro por ciudad
    if (filterCity !== 'Todas') {
      filtered = filtered.filter(p => p.city === filterCity);
    }

    setFilteredProperties(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-[110px]">
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-[110px]">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Nuestras <span className="text-blue-600">Propiedades</span>
          </h1>
          <p className="text-lg text-gray-600">
            Explora nuestra selección de alojamientos únicos en los destinos más hermosos de Colombia
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o ubicación..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg font-medium focus:outline-none focus:border-blue-600 transition"
              />
            </div>

            {/* Filtro por tipo */}
            <div>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-medium focus:outline-none focus:border-blue-600 transition capitalize"
              >
                {propertyTypes.map(type => (
                  <option key={type} value={type} className="capitalize">{type}</option>
                ))}
              </select>
            </div>

            {/* Filtro por ciudad */}
            <div>
              <select
                value={filterCity}
                onChange={e => setFilterCity(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-medium focus:outline-none focus:border-blue-600 transition"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 text-gray-600">
            <span className="font-semibold text-gray-900">{filteredProperties.length}</span> {filteredProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
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
          <div className="text-center py-20 bg-white rounded-xl shadow-lg">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No se encontraron propiedades</h3>
              <p className="text-gray-600 mb-6">
                No hay propiedades que coincidan con tus criterios de búsqueda.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('Todas');
                  setFilterCity('Todas');
                }}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPageDynamic;
