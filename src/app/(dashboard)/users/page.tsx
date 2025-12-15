"use client";

import { useState, useEffect } from "react";
import { Card, Button, Modal } from "@/components/ui";
import { UserForm, UserList, DeleteUserModal } from "@/components/users";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { apiClient } from "@/lib/api/client";
import type { User } from "@/types/user";
import { UserRole, ROLE_LABELS } from "@/types/roles";
import { Plus, Search, Filter, Users as UsersIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiResponse } from "@/types";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Locations for filter
  const [locations, setLocations] = useState<
    Array<{ id: string; name: string; code: string }>
  >([]);

  useEffect(() => {
    fetchUsers();
    fetchLocations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, selectedRole, selectedLocation, showActiveOnly]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response: ApiResponse<User[]> = await apiClient.get("/auth/users");
      setUsers(response.data || []);
    } catch (err) {
      setError("Error al cargar los usuarios");
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response: ApiResponse<
        Array<{ id: string; name: string; code: string }>
      > = await apiClient.get("/locations");
      setLocations(response.data || []);
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
      );
    }

    // Role filter
    if (selectedRole) {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(
        (user) => user.locationId === selectedLocation
      );
    }

    // Active/Inactive filter
    if (showActiveOnly) {
      filtered = filtered.filter((user) => user.isActive);
    }

    setFilteredUsers(filtered);
  };

  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedRole("");
    setSelectedLocation("");
    setShowActiveOnly(true);
  };

  // Get available roles for filter based on current user
  const getAvailableRolesForFilter = (): UserRole[] => {
    if (!currentUser) return [];

    if (currentUser.role === UserRole.SUPERADMIN) {
      // SUPERADMIN can see all users including other SUPERADMINS
      return [
        UserRole.SUPERADMIN,
        UserRole.ADMIN,
        UserRole.SALES_LEADER,
        UserRole.SELLER,
        UserRole.AUDITOR,
      ];
    }

    if (currentUser.role === UserRole.ADMIN) {
      // ADMIN can see all users except SUPERADMIN
      return [
        UserRole.ADMIN,
        UserRole.SALES_LEADER,
        UserRole.SELLER,
        UserRole.AUDITOR,
      ];
    }

    return [];
  };

  const availableRoles = getAvailableRolesForFilter();

  return (
    <PermissionGuard module="users" action="canView">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-text-main flex items-center gap-3">
              <UsersIcon className="w-8 h-8" />
              Gestión de Usuarios
            </h1>
            <p className="text-text-subtle mt-1">
              Total: {filteredUsers.length} de {users.length} usuarios
            </p>
          </div>
          <PermissionGuard module="users" action="canCreate">
            <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
              <Plus size={20} className="mr-2" />
              Nuevo Usuario
            </Button>
          </PermissionGuard>
        </div>

        {/* Filters */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-text-main font-semibold">
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <select
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(e.target.value as UserRole | "")
                  }
                  className="w-full px-4 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                >
                  <option value="">Todos los roles</option>
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              {locations.length > 0 && (
                <div>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                  >
                    <option value="">Todas las sucursales</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name} ({location.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
              {/* Active/Inactive Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-text-main">
                  Solo mostrar usuarios activos
                </span>
              </label>

              {/* Reset Filters */}
              {(searchTerm ||
                selectedRole ||
                selectedLocation ||
                !showActiveOnly) && (
                <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <Card>
            <div className="text-center py-8">
              <p className="text-error">{error}</p>
              <Button
                variant="primary"
                size="sm"
                onClick={fetchUsers}
                className="mt-4"
              >
                Reintentar
              </Button>
            </div>
          </Card>
        )}

        {/* User List */}
        {!error && (
          <Card>
            <UserList
              users={filteredUsers}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
              isLoading={isLoading}
            />
          </Card>
        )}

        {/* Modal Crear Usuario */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Crear Nuevo Usuario"
          size="lg"
        >
          <UserForm
            onSuccess={handleFormSuccess}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>

        {/* Modal Editar Usuario */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Editar Usuario"
          size="lg"
        >
          <UserForm
            user={selectedUser}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </Modal>

        {/* Modal Eliminar Usuario */}
        <DeleteUserModal
          user={selectedUser}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </PermissionGuard>
  );
}
