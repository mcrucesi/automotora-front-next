"use client";

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui';
import { apiClient } from '@/lib/api/client';
import { Upload, X, AlertCircle } from 'lucide-react';
import type { UploadImageResponse } from '@/types/vehicle';
import type { ApiResponse } from '@/types/auth';

interface ImageUploaderProps {
  vehicleId: string;
  onSuccess: () => void;
}

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const ImageUploader = ({ vehicleId, onSuccess }: ImageUploaderProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);

    // Validar cantidad
    if (files.length > MAX_FILES) {
      setError(`Solo puedes subir hasta ${MAX_FILES} imágenes a la vez`);
      return;
    }

    // Validar tipo y tamaño
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        invalidFiles.push(`${file.name}: formato no permitido`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name}: excede 5MB`);
        return;
      }
      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      setError(`Archivos inválidos:\n${invalidFiles.join('\n')}`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);

      // Generar previews
      const previewUrls = validFiles.map(file => URL.createObjectURL(file));
      setPreviews(previewUrls);
    }
  };

  const handleRemoveFile = (index: number) => {
    // Liberar URL del preview
    URL.revokeObjectURL(previews[index]);

    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Por favor selecciona al menos una imagen');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // IMPORTANTE: NO establecer Content-Type manualmente
      // El navegador lo hace automáticamente con el boundary correcto
      await apiClient.post<ApiResponse<UploadImageResponse>>(
        `/vehicles/${vehicleId}/images`,
        formData
      );

      // Limpiar estado
      selectedFiles.forEach((_, index) => {
        URL.revokeObjectURL(previews[index]);
      });
      setSelectedFiles([]);
      setPreviews([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error uploading images:', err);
      const errorMessage = err.response?.data?.error?.message || 'Error al subir las imágenes';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Área de selección de archivos */}
      <div
        className="border-2 border-dashed border-border-subtle rounded-lg p-6 text-center hover:border-primary-main transition-colors cursor-pointer"
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <Upload className="w-12 h-12 mx-auto mb-4 text-text-subtle" />
        <p className="text-text-main font-medium mb-2">
          Selecciona imágenes para subir
        </p>
        <p className="text-sm text-text-subtle">
          JPG, PNG o WEBP (máx. 5MB cada una, hasta {MAX_FILES} imágenes)
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-text-main">
            {selectedFiles.length} {selectedFiles.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-border-subtle">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="mt-1 text-xs text-text-subtle truncate">
                  {selectedFiles[index].name}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                previews.forEach(preview => URL.revokeObjectURL(preview));
                setSelectedFiles([]);
                setPreviews([]);
                setError(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
            >
              {uploading ? 'Subiendo...' : `Subir ${selectedFiles.length} ${selectedFiles.length === 1 ? 'imagen' : 'imágenes'}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
