import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import ImageUploader from './ImageUploader';

interface PropertyFormModalProps {
  property?: any; // Si existe, es edición; si no, es creación
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const PropertyFormModal = ({ property, isOpen, onClose, onSave }: PropertyFormModalProps) => {
  const [loading, setLoading] = useState(false);
  const [propertyImages, setPropertyImages] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    city: '',
    price_per_night: '',
    bedrooms: '1',
    bathrooms: '1',
    guests: '2',
    property_type: 'apartamento',
    featured: false,
    active: true,
    amenities: [] as string[],
  });

  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || '',
        description: property.description || '',
        location: property.location || '',
        city: property.city || '',
        price_per_night: property.price_per_night?.toString() || '',
        bedrooms: property.bedrooms?.toString() || '1',
        bathrooms: property.bathrooms?.toString() || '1',
        guests: property.guests?.toString() || '2',
        property_type: property.property_type || 'apartamento',
        featured: property.featured || false,
        active: property.active !== false,
        amenities: property.amenities || [],
      });
      
      // Cargar imágenes si existen
      if (property.property_images) {
        setPropertyImages(property.property_images);
      } else {
        fetchPropertyImages(property.id);
      }
    } else {
      // Reset para crear nueva
      setFormData({
        name: '',
        description: '',
        location: '',
        city: '',
        price_per_night: '',
        bedrooms: '1',
        bathrooms: '1',
        guests: '2',
        property_type: 'apartamento',
        featured: false,
        active: true,
        amenities: [],
      });
      setPropertyImages([]);
    }
  }, [property]);

  const fetchPropertyImages = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('display_order');

      if (error) throw error;
      setPropertyImages(data || []);
    } catch (error) {
      console.error('Error fetching property images:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        city: formData.city,
        price_per_night: parseFloat(formData.price_per_night),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        guests: parseInt(formData.guests),
        property_type: formData.property_type,
        featured: formData.featured,
        active: formData.active,
        amenities: formData.amenities,
      };

      if (property) {
        // Actualizar propiedad existente
        const { error } = await supabase
          .from('properties')
          .update(dataToSave)
          .eq('id', property.id);

        if (error) throw error;
      } else {
        // Crear nueva propiedad y obtener el ID
        const { data: newProperty, error } = await supabase
          .from('properties')
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;
        
        // Si se creó correctamente, actualizar el estado para mostrar el uploader
        if (newProperty) {
          // Recargar la página con la nueva propiedad para poder agregar imágenes
          onSave();
          // No cerramos el modal, permitimos agregar imágenes
          return;
        }
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()],
      });
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {property ? 'Editar Propiedad' : 'Nueva Propiedad'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Hotel Opera Medellín Centro"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Descripción detallada de la propiedad..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Centro, Medellín"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad *
                </label>
                <select
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Seleccionar ciudad</option>
                  <option value="Medellín">Medellín</option>
                  <option value="Cartagena">Cartagena</option>
                  <option value="Jardín">Jardín</option>
                  <option value="Jericó">Jericó</option>
                  <option value="San Jerónimo">San Jerónimo</option>
                  <option value="Pitalito">Pitalito</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Propiedad *
                </label>
                <select
                  required
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="hotel">Hotel</option>
                  <option value="apartamento">Apartamento</option>
                  <option value="casa">Casa</option>
                  <option value="cabaña">Cabaña</option>
                  <option value="hostal">Hostal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio por Noche (COP) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formData.price_per_night}
                  onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="280000"
                />
              </div>
            </div>
          </div>

          {/* Capacidad */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacidad</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Habitaciones
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Baños
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Huéspedes
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Amenidades */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenidades</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Ej: WiFi gratis, Piscina..."
              />
              <button
                type="button"
                onClick={addAmenity}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Imágenes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Imágenes</h3>
            <ImageUploader
              propertyId={property?.id || null}
              existingImages={propertyImages}
              onImagesChange={() => {
                if (property?.id) {
                  fetchPropertyImages(property.id);
                }
              }}
            />
          </div>

          {/* Estado */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado</h3>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700">Destacada</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Activa</span>
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {property ? 'Guardar Cambios' : 'Crear Propiedad'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyFormModal;
