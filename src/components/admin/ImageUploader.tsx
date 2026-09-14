import { useState, useEffect } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Star } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface PropertyImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface ImageUploaderProps {
  propertyId: string | null;
  existingImages: PropertyImage[];
  onImagesChange: () => void;
}

const ImageUploader = ({ propertyId, existingImages, onImagesChange }: ImageUploaderProps) => {
  const [images, setImages] = useState<PropertyImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setImages(existingImages);
  }, [existingImages]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0 || !propertyId) return;

    setUploading(true);
    const newImages: PropertyImage[] = [];

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
        const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Subir a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          alert(`Error subiendo ${file.name}`);
          continue;
        }

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        // Guardar en la base de datos
        const nextOrder = images.length + newImages.length;
        const { data: imageData, error: dbError } = await supabase
          .from('property_images')
          .insert({
            property_id: propertyId,
            image_url: publicUrl,
            display_order: nextOrder
          })
          .select()
          .single();

        if (dbError) {
          console.error('Error saving image to DB:', dbError);
          alert(`Error guardando ${file.name} en la base de datos`);
          continue;
        }

        newImages.push(imageData);
      }

      setImages([...images, ...newImages]);
      onImagesChange();
    } catch (error) {
      console.error('Error in file upload:', error);
      alert('Error subiendo imágenes');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: string, imageUrl: string) => {
    if (!confirm('¿Eliminar esta imagen?')) return;

    try {
      // Extraer el path del storage de la URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/property-images/');
      const filePath = pathParts[1];

      // Eliminar del storage
      await supabase.storage
        .from('property-images')
        .remove([filePath]);

      // Eliminar de la base de datos
      const { error } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setImages(images.filter(img => img.id !== imageId));
      onImagesChange();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error eliminando la imagen');
    }
  };

  const setAsPrimary = async (imageId: string) => {
    try {
      const imageIndex = images.findIndex(img => img.id === imageId);
      if (imageIndex === -1) return;

      // Reordenar: la seleccionada va primero
      const reorderedImages = [...images];
      const [selectedImage] = reorderedImages.splice(imageIndex, 1);
      reorderedImages.unshift(selectedImage);

      // Actualizar orden en la base de datos
      for (let i = 0; i < reorderedImages.length; i++) {
        await supabase
          .from('property_images')
          .update({ display_order: i })
          .eq('id', reorderedImages[i].id);
      }

      setImages(reorderedImages);
      onImagesChange();
    } catch (error) {
      console.error('Error setting primary image:', error);
      alert('Error estableciendo imagen principal');
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

  if (!propertyId) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <ImageIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
        <p className="text-sm text-blue-700">
          Primero guarda la propiedad para poder agregar imágenes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Zona de subida */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-yellow-500 bg-yellow-50'
            : 'border-gray-300 hover:border-yellow-400'
        }`}
      >
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading}
        />
        <label
          htmlFor="image-upload"
          className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {uploading ? (
            <Loader2 className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          )}
          <p className="text-sm text-gray-600 mb-1">
            {uploading ? 'Subiendo imágenes...' : 'Arrastra imágenes aquí o haz clic para seleccionar'}
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, WEBP hasta 5MB</p>
        </label>
      </div>

      {/* Galería de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images
            .sort((a, b) => a.display_order - b.display_order)
            .map((image, index) => (
              <div
                key={image.id}
                className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={image.image_url}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay con acciones */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3" fill="white" />
                      Principal
                    </div>
                  )}
                  
                  <button
                    onClick={() => setAsPrimary(image.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-semibold hover:bg-yellow-600"
                  >
                    Principal
                  </button>
                  
                  <button
                    onClick={() => deleteImage(image.id, image.image_url)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No hay imágenes aún. Sube la primera imagen.
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
