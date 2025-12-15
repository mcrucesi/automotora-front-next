"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, X, Star } from "lucide-react";
import toast from "react-hot-toast";

export interface ImageFile {
  file: File;
  preview: string;
  isPrimary: boolean;
}

interface ImageUploaderProps {
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export default function ImageUploader({
  onImagesChange,
  maxImages = 10,
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Validar tipo
    if (!file.type.match(/image\/(jpg|jpeg|png|webp)/)) {
      toast.error(`${file.name}: Solo se permiten imágenes JPG, PNG o WebP`);
      return false;
    }

    // Validar tamaño
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        `${file.name}: El archivo excede el tamaño máximo de ${maxSizeMB}MB`
      );
      return false;
    }

    return true;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const validFiles: ImageFile[] = [];
    const filesArray = Array.from(files);

    // Verificar límite de imágenes
    if (images.length + filesArray.length > maxImages) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    filesArray.forEach((file) => {
      if (validateFile(file)) {
        const preview = URL.createObjectURL(file);
        validFiles.push({
          file,
          preview,
          isPrimary: images.length === 0 && validFiles.length === 0, // Primera imagen es principal
        });
      }
    });

    if (validFiles.length > 0) {
      const newImages = [...images, ...validFiles];
      setImages(newImages);
      onImagesChange(newImages);
      toast.success(`${validFiles.length} imagen(es) agregada(s)`);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input para permitir seleccionar el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    URL.revokeObjectURL(imageToRemove.preview); // Liberar memoria

    const newImages = images.filter((_, i) => i !== index);

    // Si la imagen eliminada era principal y quedan imágenes, hacer principal la primera
    if (imageToRemove.isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }

    setImages(newImages);
    onImagesChange(newImages);
  };

  const setPrimaryImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpg,image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          Arrastra imágenes aquí o <span className="text-blue-600">haz clic para seleccionar</span>
        </p>
        <p className="text-xs text-gray-500">
          Máximo {maxImages} imágenes • {maxSizeMB}MB por archivo • JPG, PNG o WebP
        </p>
      </div>

      {/* Previews Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border-2 border-gray-200"
            >
              {/* Image Preview */}
              <div className="aspect-square bg-gray-100">
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlay con acciones */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  {/* Botón establecer como principal */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrimaryImage(index);
                    }}
                    className={`
                      p-2 rounded-full transition-colors
                      ${
                        image.isPrimary
                          ? "bg-yellow-500 text-white"
                          : "bg-white text-gray-700 hover:bg-yellow-500 hover:text-white"
                      }
                    `}
                    title={image.isPrimary ? "Imagen principal" : "Establecer como principal"}
                  >
                    <Star className="h-4 w-4" fill={image.isPrimary ? "currentColor" : "none"} />
                  </button>

                  {/* Botón eliminar */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Badge principal */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-500 text-white">
                    <Star className="h-3 w-3" fill="currentColor" />
                    Principal
                  </span>
                </div>
              )}

              {/* Nombre del archivo */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-xs text-white truncate">{image.file.name}</p>
                <p className="text-xs text-gray-300">
                  {(image.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      {images.length > 0 && (
        <div className="text-sm text-gray-600">
          {images.length} de {maxImages} imágenes seleccionadas
        </div>
      )}
    </div>
  );
}
