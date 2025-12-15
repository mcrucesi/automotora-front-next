"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui";
import { UserRole, ROLE_LABELS, ROLE_HIERARCHY } from "@/types/roles";
import type { CreateUserDto, User, ManagerOption } from "@/types/user";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/lib/utils/toast";

interface UserFormProps {
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const UserForm = ({ user, onSuccess, onCancel }: UserFormProps) => {
  const { user: currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<
    Array<{ id: string; name: string; code: string }>
  >([]);
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [tenants, setTenants] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const [formData, setFormData] = useState<CreateUserDto>({
    email: user?.email || "",
    password: "",
    fullName: user?.fullName || "",
    role: user?.role || UserRole.SELLER,
    tenantId: user?.tenantId || currentUser?.tenantId || undefined,
    locationId: user?.locationId || undefined,
    managerId: user?.managerId || undefined,
  });

  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch locations when component mounts or tenant changes
  useEffect(() => {
    const fetchLocations = async () => {
      const targetTenantId = formData.tenantId || currentUser?.tenantId;

      if (!targetTenantId) {
        setLocations([]);
        return;
      }

      setIsLoadingLocations(true);
      try {
        // Use tenant-specific endpoint to get filtered locations
        const response = await apiClient.get(`/tenants/${targetTenantId}/locations`);
        setLocations(response.data || []);

        if (response.data?.length === 0) {
          showToast.error("No hay sucursales disponibles para esta automotora");
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
        showToast.error("Error al cargar las sucursales");
        setLocations([]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [formData.tenantId, currentUser?.tenantId]);

  // Fetch potential managers when role is SELLER
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        // Get users with SALES_LEADER or ADMIN roles
        const response = await apiClient.get("/auth/users", {
          params: {
            role: [UserRole.SALES_LEADER, UserRole.ADMIN].join(","),
          },
        });
        setManagers(response.data || []);
      } catch (err) {
        console.error("Error fetching managers:", err);
      }
    };

    if (formData.role === UserRole.SELLER) {
      fetchManagers();
    }
  }, [formData.role]);

  // Fetch tenants if current user is SUPERADMIN
  useEffect(() => {
    const fetchTenants = async () => {
      if (currentUser?.role !== UserRole.SUPERADMIN) {
        return;
      }

      setIsLoadingTenants(true);
      try {
        const response = await apiClient.get("/tenants");
        setTenants(response.data || []);

        if (response.data?.length === 0) {
          showToast.error("No hay automotoras disponibles");
        }
      } catch (err) {
        console.error("Error fetching tenants:", err);
        showToast.error("Error al cargar las automotoras");
        setTenants([]);
      } finally {
        setIsLoadingTenants(false);
      }
    };

    fetchTenants();
  }, [currentUser?.role]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Clear locationId when tenant changes
    if (name === "tenantId") {
      setFormData((prev) => ({
        ...prev,
        tenantId: value === "" ? undefined : value,
        locationId: undefined, // Reset location when tenant changes
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : value,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validations
      if (!user && !formData.password) {
        throw new Error("La contraseña es requerida");
      }

      if (!user && formData.password !== confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }

      if (!user && formData.password && formData.password.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres");
      }

      // Prepare data
      const submitData: any = { ...formData };

      // Remove undefined fields
      if (!submitData.locationId) delete submitData.locationId;
      if (!submitData.managerId) delete submitData.managerId;
      if (!submitData.tenantId) delete submitData.tenantId;

      // For SUPERADMIN role, tenantId should be null
      if (formData.role === UserRole.SUPERADMIN) {
        submitData.tenantId = undefined;
        delete submitData.tenantId;
      }

      console.log("Datos a enviar:", submitData);

      if (user) {
        // Update user - password is optional
        const updateData = { ...submitData };
        if (!updateData.password) delete updateData.password;
        await apiClient.patch(`/auth/users/${user.id}`, updateData);
        showToast.success("Usuario actualizado exitosamente");
      } else {
        // Create user via register endpoint
        await apiClient.post("/auth/register", submitData);
        showToast.success("Usuario creado exitosamente");
      }

      onSuccess();
    } catch (err: any) {
      console.error("Error completo:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        "Error al guardar el usuario";
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine which roles the current user can create
  const getAvailableRoles = (): UserRole[] => {
    if (!currentUser) return [];

    if (currentUser.role === UserRole.SUPERADMIN) {
      // SUPERADMIN can only create ADMIN users
      return [UserRole.ADMIN];
    }

    if (currentUser.role === UserRole.ADMIN) {
      // ADMIN can create any role except SUPERADMIN
      return [
        UserRole.ADMIN,
        UserRole.SALES_LEADER,
        UserRole.SELLER,
        UserRole.AUDITOR,
      ];
    }

    return [];
  };

  const availableRoles = getAvailableRoles();

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
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              placeholder="Juan Pérez García"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={!!user} // Email cannot be changed
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="juan.perez@automotora.com"
            />
          </div>
        </div>
      </div>

      {/* Contraseña (solo para crear nuevo usuario) */}
      {!user && (
        <div>
          <h3 className="text-lg font-semibold text-text-main mb-4">
            Contraseña
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                placeholder="Confirmar contraseña"
              />
            </div>
          </div>
        </div>
      )}

      {/* Rol y Asignaciones */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">
          Rol y Asignaciones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={!!user} // Role cannot be changed after creation
              className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            {user && (
              <p className="mt-1 text-xs text-text-subtle">
                El rol no puede ser modificado una vez creado
              </p>
            )}
          </div>

          {/* Tenant Selection (only for SUPERADMIN) */}
          {currentUser?.role === UserRole.SUPERADMIN &&
            formData.role !== UserRole.SUPERADMIN && (
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Automotora <span className="text-red-500">*</span>
                </label>
                <select
                  name="tenantId"
                  value={formData.tenantId || ""}
                  onChange={handleChange}
                  required
                  disabled={isLoadingTenants}
                  className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {isLoadingTenants
                      ? "Cargando automotoras..."
                      : "Seleccionar automotora..."}
                  </option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

          {/* Location Selection (for roles that need it) */}
          {formData.role !== UserRole.SUPERADMIN &&
            formData.role !== UserRole.ADMIN && (
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Sucursal{" "}
                  {formData.role === UserRole.SALES_LEADER && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <select
                  name="locationId"
                  value={formData.locationId || ""}
                  onChange={handleChange}
                  required={formData.role === UserRole.SALES_LEADER}
                  disabled={isLoadingLocations}
                  className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {isLoadingLocations
                      ? "Cargando sucursales..."
                      : "Seleccionar sucursal..."}
                  </option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.code})
                    </option>
                  ))}
                </select>
                {currentUser?.role === UserRole.SUPERADMIN &&
                  !formData.tenantId && (
                    <p className="mt-1 text-xs text-amber-600">
                      Primero seleccione una automotora
                    </p>
                  )}
              </div>
            )}

          {/* Manager Selection (only for SELLER role) */}
          {formData.role === UserRole.SELLER && (
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Reporta a (Manager)
              </label>
              <select
                name="managerId"
                value={formData.managerId || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
              >
                <option value="">Sin asignar...</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.fullName} - {ROLE_LABELS[manager.role]}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-text-subtle">
                Opcional: Asignar un líder de ventas o administrador
              </p>
            </div>
          )}
        </div>
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
          {isSubmitting ? "Guardando..." : user ? "Actualizar" : "Crear"}{" "}
          Usuario
        </Button>
      </div>
    </form>
  );
};
