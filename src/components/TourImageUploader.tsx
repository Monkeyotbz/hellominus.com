import { useState, useEffect } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Star } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface TourImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface TourImageUploaderProps {
  tourId: string;
}

const TourImageUploader = ({ tourId }: TourImageUploaderProps) => {
  const [images, setImages] = useState<TourImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tourId) {
      fetchImages();
    }
  }, [tourId]);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('tour_images')
        .select('*')
        .eq('tour_id', tourId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0 || !tourId) return;

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} no es una imagen válida`);
          continue;
        }

        // Validar tamaño (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} es muy grande. Máximo 5MB`);
          continue;
        }

        // Generar nombre único para el archivo
        const fileExt = file.name.split('.').pop();
        const fileName = `${tourId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Subir a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('tour-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert(`Error al subir ${file.name}`);
          continue;
        }

        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('tour-images')
          .getPublicUrl(fileName);

        // Calcular siguiente display_order
        const maxOrder = images.length > 0 
          ? Math.max(...images.map(img => img.display_order))
          : -1;

        // Insertar en base de datos
        const { data: newImage, error: dbError } = await supabase
          .from('tour_images')
          .insert({
            tour_id: tourId,
            image_url: urlData.publicUrl,
            display_order: maxOrder + 1
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          alert(`Error al guardar ${file.name} en la base de datos`);
          continue;
        }

        if (newImage) {
          setImages(prev => [...prev, newImage]);
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error al procesar las imágenes');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('¿Eliminar esta imagen?')) return;

    try {
      // Obtener la imagen para eliminar del storage
      const imageToDelete = images.find(img => img.id === imageId);
      if (!imageToDelete) return;

      // Extraer el path del storage de la URL
      const url = new URL(imageToDelete.image_url);
      const pathParts = url.pathname.split('/');
      const storagePath = pathParts.slice(pathParts.indexOf('tour-images') + 1).join('/');

      // Eliminar de storage
      const { error: storageError } = await supabase.storage
        .from('tour-images')
        .remove([storagePath]);

      if (storageError) {
        console.error('Storage error:', storageError);
      }

      // Eliminar de base de datos
      const { error: dbError } = await supabase
        .from('tour_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      setImages(images.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error al eliminar la imagen');
    }
  };

  const setAsPrimary = async (imageId: string) => {
    try {
      const imageToPromote = images.find(img => img.id === imageId);
      if (!imageToPromote) return;

      // Actualizar todas las imágenes: la seleccionada a 0, el resto incrementar
      const updates = images.map(img => ({
        id: img.id,
        display_order: img.id === imageId ? 0 : img.display_order + 1
      }));

      for (const update of updates) {
        await supabase
          .from('tour_images')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      // Actualizar estado local
      setImages(prev => 
        prev
          .map(img => ({
            ...img,
            display_order: img.id === imageId ? 0 : img.display_order + 1
          }))
          .sort((a, b) => a.display_order - b.display_order)
      );
    } catch (error) {
      console.error('Error setting primary image:', error);
      alert('Error al establecer imagen principal');
    }
  };

  if (!tourId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          Guarda el tour primero para poder subir imágenes.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          id="tour-image-upload"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <label
          htmlFor="tour-image-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-sm text-gray-600">Subiendo imágenes...</p>
            </>
          ) : (
            <>
              <Upload className="text-gray-400" size={48} />
              <p className="text-sm text-gray-600">
                <span className="text-blue-600 font-semibold">Haz clic para subir</span> o arrastra imágenes aquí
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, WEBP (máx. 5MB por imagen)</p>
            </>
          )}
        </label>
      </div>

      {/* Images Gallery */}
      {images.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">
            Imágenes ({images.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all"
              >
                <img
                  src={image.image_url}
                  alt={`Tour image ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                
                {/* Primary Badge */}
                {image.display_order === 0 && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                    <Star size={12} fill="white" />
                    Principal
                  </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {image.display_order !== 0 && (
                    <button
                      onClick={() => setAsPrimary(image.id)}
                      className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                      title="Establecer como principal"
                    >
                      <Star size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <ImageIcon className="mx-auto text-gray-400 mb-2" size={48} />
          <p className="text-sm text-gray-600">
            No hay imágenes todavía. Sube algunas para mostrar el tour.
          </p>
        </div>
      )}
    </div>
  );
};

export default TourImageUploader;
