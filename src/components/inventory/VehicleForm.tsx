"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui";
import type { CreateVehicleDto, Vehicle } from "@/types/vehicle";
import type { Location, LocationsListResponse } from "@/types/location";
import type { ApiResponse } from "@/types";
import { apiClient } from "@/lib/api/client";
import { ImageFile } from "../common/ImageUploader"; // Importar el tipo ImageFile
import ImageUploader from "@/components/common/ImageUploader";

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const VehicleForm = ({
  vehicle,
  onSuccess,
  onCancel,
}: VehicleFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  // Agregar estado para imágenes
  const [images, setImages] = useState<ImageFile[]>([]);

  const [formData, setFormData] = useState<CreateVehicleDto>({
    vin: vehicle?.vin || "",
    brand: vehicle?.brand || "",
    model: vehicle?.model || "",
    year: vehicle?.year || new Date().getFullYear(),
    condition: vehicle?.condition || "used",
    price: vehicle?.price || 0,
    cost: vehicle?.cost || 0,
    currency: vehicle?.currency || "USD",
    mileage: vehicle?.mileage || 0,
    color: vehicle?.color || "",
    fuelType: vehicle?.fuelType || "gasoline",
    transmission: vehicle?.transmission || "automatic",
    engineSize: vehicle?.engineSize || "",
    doors: vehicle?.doors || 4,
    seats: vehicle?.seats || 5,
    description: vehicle?.description || "",
    locationId: vehicle?.locationId || "",
    isConsignment: vehicle?.isConsignment || false,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setIsLoadingLocations(true);
      const response = await apiClient.get<ApiResponse<LocationsListResponse>>(
        "/locations"
      );
      // Filtrar solo las sucursales activas
      const activeLocations = response.data.data.filter((loc) => loc.isActive);
      setLocations(activeLocations);
    } catch (err) {
      console.error("Error fetching locations:", err);
      setLocations([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? value === ""
            ? 0
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let vehicleId: string;

      if (vehicle) {
        await apiClient.patch(`/vehicles/${vehicle.id}`, formData);
        vehicleId = vehicle.id;
      } else {
        const response = await apiClient.post("/vehicles", formData);
        vehicleId = response.data.id; // Ajustar según tu estructura de respuesta
      }

      // Subir imágenes si hay
      if (images.length > 0) {
        await uploadImages(vehicleId);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Error al guardar el vehículo");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para subir imágenes después de crear el vehículo
  const uploadImages = async (vehicleId: string) => {
    if (images.length === 0) return;

    const formData = new FormData();
    images.forEach((img) => {
      formData.append("files", img.file);
    });

    const primaryIndex = images.findIndex((img) => img.isPrimary);
    if (primaryIndex !== -1) {
      formData.append("primaryIndex", String(primaryIndex));
    }

    await apiClient.post(`/vehicles/${vehicleId}/images`, formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Información Básica */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Información Básica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              VIN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="1HGBH41JXMN109186"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Marca <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Toyota"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Modelo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Corolla"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Año <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              min="1900"
              max={new Date().getFullYear() + 1}
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Color <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Blanco"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Condición <span className="text-red-500">*</span>
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="new">Nuevo</option>
              <option value="used">Usado</option>
              <option value="certified">Certificado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ubicación */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">Ubicación</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Sucursal
            </label>
            <select
              name="locationId"
              value={formData.locationId}
              onChange={handleChange}
              disabled={isLoadingLocations}
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Sin asignar</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} {location.city ? `- ${location.city}` : ""}
                </option>
              ))}
            </select>
            {isLoadingLocations && (
              <p className="text-xs text-text-subtle mt-1">
                Cargando sucursales...
              </p>
            )}
            {!isLoadingLocations && locations.length === 0 && (
              <p className="text-xs text-text-subtle mt-1">
                No hay sucursales activas. Crea una sucursal primero.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Consignación */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Tipo de Vehículo
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isConsignment"
              name="isConsignment"
              checked={formData.isConsignment}
              onChange={handleChange}
              className="w-4 h-4 text-primary-main bg-gray-100 border-gray-300 rounded focus:ring-primary-main focus:ring-2"
            />
            <label
              htmlFor="isConsignment"
              className="ml-3 text-sm font-medium text-text-main"
            >
              Este vehículo está en consignación
            </label>
          </div>
          {formData.isConsignment && (
            <div className="ml-7 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Los vehículos en consignación requieren
                crear un acuerdo de consignación en la sección de Consignaciones
                después de guardar el vehículo.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Especificaciones */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Especificaciones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Transmisión <span className="text-red-500">*</span>
            </label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="automatic">Automática</option>
              <option value="manual">Manual</option>
              <option value="cvt">CVT</option>
              <option value="semi-automatic">Semi-automática</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Tipo de Combustible <span className="text-red-500">*</span>
            </label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="gasoline">Gasolina</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Eléctrico</option>
              <option value="hybrid">Híbrido</option>
              <option value="plug-in-hybrid">Híbrido Enchufable</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Tamaño del Motor
            </label>
            <input
              type="text"
              name="engineSize"
              value={formData.engineSize}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="2.0L"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Kilometraje <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="50000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Puertas
            </label>
            <input
              type="number"
              name="doors"
              value={formData.doors || ""}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Asientos
            </label>
            <input
              type="number"
              name="seats"
              value={formData.seats || ""}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
          </div>
        </div>
      </div>

      {/* Precios */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Información de Precios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Precio de Venta <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Costo
            </label>
            <input
              type="number"
              name="cost"
              value={formData.cost || ""}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Moneda <span className="text-red-500">*</span>
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="MXN">MXN</option>
              <option value="COP">COP</option>
            </select>
          </div>
        </div>
      </div>
      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">
          Descripción
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
          placeholder="Descripción detallada del vehículo..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imágenes del Vehículo
        </label>
        <ImageUploader
          onImagesChange={setImages}
          maxImages={10}
          maxSizeMB={5}
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : vehicle ? "Actualizar" : "Crear"}{" "}
          Vehículo
        </Button>
      </div>
    </form>
  );
};
