import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import TourFormModal from '../components/TourFormModal';

interface Tour {
  id: string;
  name: string;
  description: string;
  location: string;
  city: string;
  price: number;
  duration: string;
  difficulty: string;
  max_people: number;
  rating: number;
  reviews_count: number;
  includes: string[];
  featured: boolean;
  active: boolean;
  created_at: string;
}

const AdminTours = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTours(data || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este tour?')) return;

    try {
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchTours();
    } catch (error) {
      console.error('Error deleting tour:', error);
      alert('Error al eliminar el tour');
    }
  };

  const handleEdit = (tour: Tour) => {
    setSelectedTour(tour);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedTour(null);
    setShowModal(true);
  };

  const handleModalClose = (refreshData?: boolean) => {
    setShowModal(false);
    setSelectedTour(null);
    if (refreshData) {
      fetchTours();
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tours')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchTours();
    } catch (error) {
      console.error('Error updating tour:', error);
    }
  };

  const filteredTours = tours.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Gestión de Tours</h1>
          <p className="text-xs lg:text-sm text-gray-600 mt-1">Administra todos los tours del sistema</p>
        </div>
        <button
          onClick={handleCreate}
          className="w-full sm:w-auto bg-yellow-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Nuevo Tour
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <p className="text-gray-500 text-xs sm:text-sm">Total</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{tours.length}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <p className="text-gray-500 text-xs sm:text-sm">Activos</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">
            {tours.filter(t => t.active).length}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <p className="text-gray-500 text-xs sm:text-sm">Destacados</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600">
            {tours.filter(t => t.featured).length}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <p className="text-gray-500 text-xs sm:text-sm">Inactivos</p>
          <p className="text-xl sm:text-2xl font-bold text-red-600">
            {tours.filter(t => !t.active).length}
          </p>
        </div>
      </div>

      {/* Vista de tarjetas para móvil */}
      <div className="lg:hidden space-y-3">
        {filteredTours.map((tour) => (
          <div key={tour.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start gap-3 mb-2">
              <h3 className="font-semibold text-gray-800 text-sm leading-tight flex-1 line-clamp-2">
                {tour.name}
              </h3>
              <button
                onClick={() => toggleActive(tour.id, tour.active)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                  tour.active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tour.active ? '✓ Activo' : '○ Inactivo'}
              </button>
            </div>
            
            {tour.featured && (
              <span className="inline-flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium mb-2">
                ⭐ Destacado
              </span>
            )}
            
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-3">
              <div>
                <p className="text-xs text-gray-500">Ubicación</p>
                <p className="text-sm font-medium text-gray-800">{tour.city}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Duración</p>
                <p className="text-sm font-medium text-gray-800">{tour.duration}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Precio</p>
                <p className="text-base font-bold text-yellow-600">
                  ${tour.price.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Dificultad</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  tour.difficulty === 'fácil' ? 'bg-green-100 text-green-700' :
                  tour.difficulty === 'moderado' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {tour.difficulty}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => handleEdit(tour)}
                className="flex-1 px-3 py-2 text-green-600 bg-green-50 rounded-lg text-xs font-medium hover:bg-green-100 active:bg-green-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5 flex-shrink-0" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(tour.id)}
                className="px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Vista desktop (tabla) */}
      <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dificultad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTours.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">{tour.name}</p>
                      {tour.featured && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mt-1 inline-block">
                          Destacado
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {tour.city}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {tour.duration}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                    ${tour.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      tour.difficulty === 'fácil' ? 'bg-green-100 text-green-800' :
                      tour.difficulty === 'moderado' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tour.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(tour.id, tour.active)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tour.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tour.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(tour)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tour.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sin resultados */}
      {filteredTours.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
          <p className="text-gray-500 text-sm sm:text-base">No se encontraron tours</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TourFormModal
          tour={selectedTour}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default AdminTours;
