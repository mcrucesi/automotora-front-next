"use client";

import { useState } from "react";
import { Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { RoleBadge } from "./RoleBadge";
import type { User } from "@/types/user";
import { formatDate } from "@/lib/utils/date";
import { usePermissions } from "@/hooks/usePermissions";

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  isLoading?: boolean;
}

export const UserList = ({
  users,
  onEdit,
  onDelete,
  isLoading,
}: UserListProps) => {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("users", "canEdit");
  const canDelete = hasPermission("users", "canDelete");
  console.log(users);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-subtle text-lg">No hay usuarios registrados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border-subtle">
        <thead className="bg-surface-secondary">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">
              Usuario
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">
              Sucursal
            </th>
            {/* <th className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">
              Reporta a
            </th> */}
            <th className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">
              Estado
            </th>
            {/* <th className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">
              Creado
            </th> */}
            {(canEdit || canDelete) && (
              <th className="px-6 py-3 text-right text-xs font-medium text-text-subtle uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-border-subtle">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-surface-hover transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-sm">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-text-main">
                      {user.fullName}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-text-main">{user.email}</div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <RoleBadge role={user.role} />
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-text-main">
                  {user.location ? (
                    <>
                      {user.location.name}
                      <span className="text-text-subtle text-xs ml-1">
                        ({user.location.code})
                      </span>
                    </>
                  ) : (
                    <span className="text-text-subtle italic">-</span>
                  )}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-text-main">
                  {user.manager ? (
                    <>
                      {user.manager.fullName}
                      <span className="text-text-subtle text-xs block">
                        {user.manager.email}
                      </span>
                    </>
                  ) : (
                    <span className="text-text-subtle italic">-</span>
                  )}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                {user.isActive ? (
                  <Badge
                    variant="success"
                    className="inline-flex items-center gap-1"
                  >
                    <UserCheck className="w-3 h-3" />
                    Activo
                  </Badge>
                ) : (
                  <Badge
                    variant="error"
                    className="inline-flex items-center gap-1"
                  >
                    <UserX className="w-3 h-3" />
                    Inactivo
                  </Badge>
                )}
              </td>

              {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-text-subtle">
                {formatDate(user.createdAt)}
              </td> */}

              {(canEdit || canDelete) && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {canEdit && (
                      <button
                        onClick={() => onEdit(user)}
                        className="text-primary-600 hover:text-primary-900 transition-colors p-2 hover:bg-primary-50 rounded-md"
                        title="Editar usuario"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => onDelete(user)}
                        className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded-md"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
