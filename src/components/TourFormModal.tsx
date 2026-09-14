import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import TourImageUploader from './TourImageUploader';

interface Tour {
  id?: string;
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
}

interface TourFormModalProps {
  tour: Tour | null;
  onClose: (refreshData?: boolean) => void;
}

const TourFormModal: React.FC<TourFormModalProps> = ({ tour, onClose }) => {
  const [formData, setFormData] = useState<Tour>({
    name: '',
    description: '',
    location: '',
    city: 'Cartagena',
    price: 0,
    duration: '',
    difficulty: 'Fácil',
    max_people: 10,
    rating: 5.0,
    reviews_count: 0,
    includes: [],
    featured: false,
    active: true,
  });

  const [newInclude, setNewInclude] = useState('');
  const [saving, setSaving] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);

  useEffect(() => {
    if (tour) {
      setFormData(tour);
      setShowImageUploader(true); // Si ya existe, mostrar uploader
    }
  }, [tour]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddInclude = () => {
    if (newInclude.trim()) {
      setFormData(prev => ({
        ...prev,
        includes: [...prev.includes, newInclude.trim()]
      }));
      setNewInclude('');
    }
  };

  const handleRemoveInclude = (index: number) => {
    setFormData(prev => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (tour?.id) {
        // Actualizar tour existente
        const { error } = await supabase
          .from('tours')
          .update({
            name: formData.name,
            description: formData.description,
            location: formData.location,
            city: formData.city,
            price: formData.price,
            duration: formData.duration,
            difficulty: formData.difficulty,
            max_people: formData.max_people,
            rating: formData.rating,
            reviews_count: formData.reviews_count,
            includes: formData.includes,
            featured: formData.featured,
            active: formData.active,
          })
          .eq('id', tour.id);

        if (error) throw error;
        alert('Tour actualizado exitosamente');
      } else {
        // Crear nuevo tour
        const { data, error } = await supabase
          .from('tours')
          .insert([{
            name: formData.name,
            description: formData.description,
            location: formData.location,
            city: formData.city,
            price: formData.price,
            duration: formData.duration,
            difficulty: formData.difficulty,
            max_people: formData.max_people,
            rating: formData.rating,
            reviews_count: formData.reviews_count,
            includes: formData.includes,
            featured: formData.featured,
            active: formData.active,
          }])
          .select()
          .single();

        if (error) throw error;
        
        // Actualizar el formData con el ID para mostrar el ImageUploader
        if (data) {
          setFormData(prev => ({ ...prev, id: data.id }));
          setShowImageUploader(true);
          alert('Tour creado exitosamente. Ahora puedes subir imágenes.');
          return; // No cerrar el modal para permitir subir imágenes
        }
      }

      onClose(true);
    } catch (error) {
      console.error('Error saving tour:', error);
      alert('Error al guardar el tour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {tour ? 'Editar Tour' : 'Crear Nuevo Tour'}
          </h2>
          <button
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Información Básica
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Tour *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Ej: Tour por Cartagena Colonial"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Ej: Centro Histórico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Cartagena">Cartagena</option>
                  <option value="Medellín">Medellín</option>
                  <option value="Jardín">Jardín</option>
                  <option value="Jericó">Jericó</option>
                  <option value="San Jerónimo">San Jerónimo</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Describe la experiencia del tour..."
                />
              </div>
            </div>
          </div>

          {/* Detalles del Tour */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Detalles del Tour
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (COP) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Ej: 4 horas, 1 día completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dificultad *
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Fácil">Fácil</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Difícil">Difícil</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personas Máximo *
                </label>
                <input
                  type="number"
                  name="max_people"
                  value={formData.max_people}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5) *
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  required
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Reseñas
                </label>
                <input
                  type="number"
                  name="reviews_count"
                  value={formData.reviews_count}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Incluye */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Qué Incluye
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newInclude}
                onChange={(e) => setNewInclude(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInclude())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Ej: Transporte, Guía, Almuerzo..."
              />
              <button
                type="button"
                onClick={handleAddInclude}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <FaPlus /> Agregar
              </button>
            </div>

            {formData.includes.length > 0 && (
              <div className="space-y-2">
                {formData.includes.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg"
                  >
                    <span className="text-gray-700">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInclude(index)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Estado */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Estado y Visibilidad
            </h3>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Tour Activo</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Tour Destacado</span>
              </label>
            </div>
          </div>

          {/* Image Uploader - Solo si el tour ya fue creado */}
          {showImageUploader && formData.id && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Imágenes del Tour
              </h3>
              <TourImageUploader tourId={formData.id} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : (tour ? 'Actualizar Tour' : 'Crear Tour')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TourFormModal;
