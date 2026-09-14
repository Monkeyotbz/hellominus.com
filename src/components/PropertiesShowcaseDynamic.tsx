import React, { useEffect, useState } from 'react';
import QuickCard, { ShowcaseItem } from './QuickCard';
import { supabase } from '../supabaseClient';

type PropertiesShowcaseDynamicProps = {
  /** Maximum number of items to show. If omitted, show all. Default is 6 for homepage usage. */
  limit?: number;
};

const PropertiesShowcaseDynamic: React.FC<PropertiesShowcaseDynamicProps> = ({ limit = 6 }) => {
  const [properties, setProperties] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

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
          featured,
          active,
          amenities,
          property_images(
            id,
            image_url,
            display_order
          )
        `)
        .eq('active', true)
        .eq('featured', true) // Solo propiedades destacadas
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Transformar los datos de Supabase al formato ShowcaseItem
      const transformedProperties: ShowcaseItem[] = (data || []).map((prop: any) => {
        // Obtener la primera imagen ordenada
        const firstImage = prop.property_images && prop.property_images.length > 0
          ? prop.property_images.sort((a: any, b: any) => a.display_order - b.display_order)[0]
          : null;

        // Crear slug desde el nombre de la propiedad
        const slug = prop.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '');

        return {
          id: slug,
          dbId: prop.id, // Guardar el ID de la base de datos
          name: prop.name,
          location: `${prop.location}, ${prop.city}`,
          description: prop.description,
          image: firstImage?.image_url || '/placeholder-property.jpg',
          priceLabel: `Desde $${prop.price_per_night.toLocaleString('es-CO')} / noche`,
          whatsapp: `https://wa.me/?text=${encodeURIComponent(`Hola, quiero reservar ${prop.name}`)}`,
          booking: '#', // Puedes agregar un campo booking_url en la base de datos si lo necesitas
          tags: prop.amenities || []
        };
      });

      setProperties(transformedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="properties" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  const items = properties.slice(0, limit ?? properties.length);
  const hasMore = properties.length > limit;

  return (
    <section id="properties" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="inline-block text-xs uppercase tracking-wider text-blue-600 font-semibold mb-3">Propiedades destacadas</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Encuentra <span className="text-blue-600">alojamientos</span> que enamoran
            </h2>
            <div className="mt-4">
              <p className="text-gray-600 text-base sm:text-lg">
                Alojamientos seleccionados por ubicación, servicio y experiencia. 
                <span className="text-yellow-600 font-semibold"> Reserva rápido</span> y directo desde la ficha — tu próxima aventura empieza aquí.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="/properties" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200">
              Ver todas las propiedades
            </a>
          </div>
        </div>

        {items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map(item => (
                <QuickCard key={item.id} item={item} ctaLabel="Quiero reservar" detailRoute="property" />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <a href="/properties" className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow font-semibold">
                  Ver más propiedades
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No hay propiedades destacadas disponibles en este momento.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertiesShowcaseDynamic;
