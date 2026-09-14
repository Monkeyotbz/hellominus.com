import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import TourDetail from '../components/TourDetail';
import { quickTours } from '../data/showcases';

const TourDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tour = quickTours.find((t) => t.id === id);

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tour no encontrado</h1>
          <p className="text-gray-600 mb-6">El tour que buscas no existe.</p>
          <button
            onClick={() => navigate('/properties')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver a explorar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="fixed top-20 left-4 z-40 bg-white hover:bg-gray-100 p-2 rounded-full shadow-lg transition flex items-center gap-2 px-4"
      >
        <ChevronLeft className="w-6 h-6 text-gray-900" />
        <span className="hidden sm:inline text-gray-900 font-semibold">Atrás</span>
      </button>
      <TourDetail
        item={tour}
        duration="2 días"
        groupSize="2-10 personas"
      />
    </>
  );
};

export default TourDetailPage;
