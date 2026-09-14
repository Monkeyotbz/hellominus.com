import React, { useEffect, useState } from 'react';
import QuickCard, { ShowcaseItem } from './QuickCard';
import { supabase } from '../supabaseClient';

type ToursShowcaseDynamicProps = {
  limit?: number;
};

const ToursShowcaseDynamic: React.FC<ToursShowcaseDynamicProps> = ({ limit = 6 }) => {
  const [tours, setTours] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTours();
  }, []);

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
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

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
          category: tour.city
        };
      });

      setTours(transformedTours);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="tours" className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  const items = tours.slice(0, limit ?? tours.length);
  const hasMore = tours.length > limit;

  return (
    <section id="tours" className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="inline-block text-xs uppercase tracking-wider text-blue-600 font-semibold mb-3">Tours destacados</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Vive <span className="text-blue-600">experiencias</span> inolvidables
            </h2>
            <div className="mt-4">
              <p className="text-gray-600 text-base sm:text-lg">
                Descubre los mejores tours y actividades en los destinos más hermosos de Colombia.
                <span className="text-yellow-600 font-semibold"> Reserva fácil</span> y crea recuerdos únicos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="/tours" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200">
              Ver todos los tours
            </a>
          </div>
        </div>

        {items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map(item => (
                <QuickCard key={item.id} item={item} ctaLabel="Reservar tour" detailRoute="tour" />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <a href="/tours" className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow font-semibold">
                  Ver más tours
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No hay tours destacados disponibles en este momento.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ToursShowcaseDynamic;
