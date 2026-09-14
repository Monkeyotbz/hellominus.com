import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Upload, X, Check } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onUploadComplete: (url: string) => void;
}

export default function AvatarUpload({ currentAvatarUrl, onUploadComplete }: AvatarUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen');
        return;
      }

      // Validar tamaño (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen no puede pesar más de 2MB');
        return;
      }

      // Generar nombre único
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      // Subir a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      // Actualizar profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      onUploadComplete(avatarUrl);
      // Eliminado alert para una mejor UX
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error al subir la imagen. Verifica que sea menor a 2MB.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <input
        type="file"
        id="avatar-upload"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      <label
        htmlFor="avatar-upload"
        className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-lg text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-lg z-10"
      >
        {uploading ? (
          <div className="animate-spin">⏳</div>
        ) : (
          <Camera className="w-4 h-4" />
        )}
      </label>
    </div>
  );
}
