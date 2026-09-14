import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Edit, Trash2, Search, Calendar, DollarSign } from 'lucide-react';
import PropertyFormModal from '../components/admin/PropertyFormModal';
import PropertyCalendar from '../components/admin/PropertyCalendar';
import AdminPropertyPricing from '../components/admin/AdminPropertyPricing';

interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  city: string;
  price_per_night: number;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  property_type: string;
  featured: boolean;
  active: boolean;
  amenities: string[];
  created_at: string;
  property_images?: Array<{
    id: string;
    image_url: string;
    display_order: number;
  }>;  
}

const AdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarProperty, setCalendarProperty] = useState<Property | null>(null);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [pricingProperty, setPricingProperty] = useState<Property | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(
            id,
            image_url,
            display_order
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta propiedad?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error al eliminar la propiedad');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchProperties();
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  const handleOpenCreate = () => {
    setSelectedProperty(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (property: Property) => {
    setSelectedProperty(property);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  const handleSave = () => {
    fetchProperties();
  };

  const handleOpenCalendar = (property: Property) => {
    setCalendarProperty(property);
    setIsCalendarOpen(true);
  };

  const handleCloseCalendar = () => {
    setIsCalendarOpen(false);
    setCalendarProperty(null);
  };

  const handleOpenPricing = (property: Property) => {
    setPricingProperty(property);
    setIsPricingOpen(true);
  };

  const handleClosePricing = () => {
    setIsPricingOpen(false);
    setPricingProperty(null);
  };

  const filteredProperties = properties.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Gestión de Propiedades</h1>
          <p className="text-xs lg:text-sm text-gray-600 mt-1">Administra todas las propiedades del sistema</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Nueva Propiedad
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
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <p className="text-gray-500 text-xs sm:text-sm">Total</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{properties.length}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <p className="text-gray-500 text-xs sm:text-sm">Activas</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">
            {properties.filter(p => p.active).length}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <p className="text-gray-500 text-xs sm:text-sm">Destacadas</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600">
            {properties.filter(p => p.featured).length}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <p className="text-gray-500 text-xs sm:text-sm">Inactivas</p>
          <p className="text-xl sm:text-2xl font-bold text-red-600">
            {properties.filter(p => !p.active).length}
          </p>
        </div>
      </div>

      {/* Vista de tarjetas para móvil y tabla para desktop */}
      {/* Vista móvil */}
      <div className="lg:hidden space-y-3">
        {filteredProperties.map((property) => {
          const firstImage = property.property_images && property.property_images.length > 0
            ? property.property_images.sort((a, b) => a.display_order - b.display_order)[0]
            : null;
          
          return (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex gap-3 p-3">
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {firstImage ? (
                    <img
                      src={firstImage.image_url}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center px-1">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 flex-1">
                      {property.name}
                    </h3>
                    <button
                      onClick={() => toggleActive(property.id, property.active)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                        property.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {property.active ? '✓' : '○'}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-xs text-gray-500">{property.city}</p>
                    <span className="text-gray-300">•</span>
                    <p className="text-xs text-gray-500 capitalize">{property.property_type}</p>
                  </div>
                  
                  {property.featured && (
                    <span className="inline-flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium mb-1.5">
                      ⭐ Destacada
                    </span>
                  )}
                  
                  <p className="text-base font-bold text-blue-600 mb-2">
                    ${property.price_per_night.toLocaleString()}
                    <span className="text-xs font-normal text-gray-500">/noche</span>
                  </p>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenPricing(property)}
                      className="flex-1 px-2 py-1.5 text-blue-600 bg-blue-50 rounded-lg text-xs font-medium hover:bg-blue-100 active:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="hidden xs:inline">Precios</span>
                    </button>
                    <button
                      onClick={() => handleOpenCalendar(property)}
                      className="flex-1 px-2 py-1.5 text-purple-600 bg-purple-50 rounded-lg text-xs font-medium hover:bg-purple-100 active:bg-purple-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="hidden xs:inline">Cal.</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(property)}
                      className="flex-1 px-2 py-1.5 text-green-600 bg-green-50 rounded-lg text-xs font-medium hover:bg-green-100 active:bg-green-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="hidden xs:inline">Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vista desktop (tabla) */}
      <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imagen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propiedad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio/Noche
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacidad
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
              {filteredProperties.map((property) => {
                const firstImage = property.property_images && property.property_images.length > 0
                  ? property.property_images.sort((a, b) => a.display_order - b.display_order)[0]
                  : null;
                
                return (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {firstImage ? (
                        <img
                          src={firstImage.image_url}
                          alt={property.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-xs text-center px-1">
                          Sin imagen
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">{property.name}</p>
                      {property.featured && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mt-1 inline-block">
                          Destacada
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {property.city}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                    {property.property_type}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                    ${property.price_per_night.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {property.guests} huéspedes
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(property.id, property.active)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        property.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {property.active ? 'Activa' : 'Inactiva'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenPricing(property)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Configurar precios"
                      >
                        <DollarSign className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleOpenCalendar(property)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Ver calendario"
                      >
                        <Calendar className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(property)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sin resultados */}
      {filteredProperties.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
          <p className="text-gray-500 text-sm sm:text-base">No se encontraron propiedades</p>
        </div>
      )}

      {/* Modal de Formulario */}
      <PropertyFormModal
        property={modalMode === 'edit' ? selectedProperty : undefined}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      {/* Calendario de Propiedad */}
      {calendarProperty && (
        <PropertyCalendar
          propertyId={calendarProperty.id}
          propertyName={calendarProperty.name}
          isOpen={isCalendarOpen}
          onClose={handleCloseCalendar}
        />
      )}

      {/* Configuración de Precios */}
      {isPricingOpen && pricingProperty && (
        <AdminPropertyPricing
          propertyId={pricingProperty.id}
          propertyName={pricingProperty.name}
          onClose={handleClosePricing}
        />
      )}
    </div>
  );
};

export default AdminProperties;
