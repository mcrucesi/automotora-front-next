"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { apiClient } from '@/lib/api/client';
import { Trash2, Star, AlertCircle, Image as ImageIcon } from 'lucide-react';
import type { VehicleImage, VehicleImagesResponse } from '@/types/vehicle';
import type { ApiResponse } from '@/types/auth';

interface ImageGalleryProps {
  vehicleId: string;
  onUpdate?: () => void;
}

export const ImageGallery = ({ vehicleId, onUpdate }: ImageGalleryProps) => {
  const [images, setImages] = useState<VehicleImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, [vehicleId]);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<ApiResponse<VehicleImagesResponse>>(
        `/vehicles/${vehicleId}/images`
      );
      // Asegurarse de que siempre sea un array
      const imageData = response.data?.data || [];
      setImages(Array.isArray(imageData) ? imageData : []);
    } catch (err: any) {
      console.error('Error fetching images:', err);
      // Si el error es 404, significa que no hay imágenes, no es un error real
      if (err.response?.status === 404) {
        setImages([]);
      } else {
        const errorMessage = err.response?.data?.error?.message || 'Error al cargar las imágenes';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
      return;
    }

    setDeletingId(imageId);
    setError(null);

    try {
      await apiClient.delete(`/vehicles/${vehicleId}/images/${imageId}`);
      setImages(prev => prev.filter(img => img.id !== imageId));
      onUpdate?.();
    } catch (err: any) {
      console.error('Error deleting image:', err);
      const errorMessage = err.response?.data?.error?.message || 'Error al eliminar la imagen';
      setError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    setSettingPrimaryId(imageId);
    setError(null);

    try {
      await apiClient.patch(`/vehicles/${vehicleId}/images/${imageId}/primary`);

      // Actualizar el estado local
      setImages(prev =>
        prev.map(img => ({
          ...img,
          isPrimary: img.id === imageId,
        }))
      );
      onUpdate?.();
    } catch (err: any) {
      console.error('Error setting primary image:', err);
      const errorMessage = err.response?.data?.error?.message || 'Error al establecer imagen principal';
      setError(errorMessage);
    } finally {
      setSettingPrimaryId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-text-subtle">Cargando imágenes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 bg-surface-main rounded-lg border border-border-subtle">
        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-text-subtle" />
        <p className="text-text-subtle">No hay imágenes cargadas para este vehículo</p>
        <p className="text-sm text-text-subtle mt-1">
          Usa el formulario de arriba para subir imágenes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-main">
          {images.length} {images.length === 1 ? 'imagen' : 'imágenes'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className={`relative group rounded-lg overflow-hidden border-2 ${
              image.isPrimary ? 'border-primary-main' : 'border-border-subtle'
            }`}
          >
            {/* Badge de imagen principal */}
            {image.isPrimary && (
              <div className="absolute top-2 left-2 z-10">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-main text-white text-xs font-medium rounded">
                  <Star className="w-3 h-3 fill-current" />
                  Principal
                </span>
              </div>
            )}

            {/* Imagen */}
            <div className="aspect-square">
              <img
                src={image.imageUrl}
                alt={`Vehicle image ${image.id}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlay con acciones */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              {/* Botón establecer como principal */}
              {!image.isPrimary && (
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={() => handleSetPrimary(image.id)}
                  disabled={settingPrimaryId === image.id}
                  className="shadow-lg"
                >
                  <Star className="w-4 h-4" />
                </Button>
              )}

              {/* Botón eliminar */}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleDelete(image.id)}
                disabled={deletingId === image.id}
                className="bg-red-500 text-white border-red-500 hover:bg-red-600 shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Indicadores de loading */}
            {(deletingId === image.id || settingPrimaryId === image.id) && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
