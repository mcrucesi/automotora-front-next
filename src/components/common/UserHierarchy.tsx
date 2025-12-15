/**
 * UserHierarchy Component
 * Muestra la jerarquía del usuario (manager y/o subordinados)
 */

'use client';

import { User } from '@/types/auth';
import { UserRole } from '@/types/roles';
import { RoleBadge } from './RoleBadge';
import { User as UserIcon, ChevronRight, Users } from 'lucide-react';

interface UserHierarchyProps {
  user: User;
  subordinates?: User[];
  compact?: boolean;
}

export function UserHierarchy({
  user,
  subordinates = [],
  compact = false,
}: UserHierarchyProps) {
  const hasManager = !!user.manager;
  const hasSubordinates = subordinates.length > 0;

  if (!hasManager && !hasSubordinates) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {hasManager && (
          <div className="flex items-center gap-1">
            <UserIcon size={14} />
            <span>Reporta a: {user.manager?.fullName}</span>
          </div>
        )}
        {hasSubordinates && (
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{subordinates.length} vendedor{subordinates.length > 1 ? 'es' : ''}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Manager */}
      {hasManager && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserIcon size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Reporta a
            </span>
          </div>
          <div className="flex items-center gap-3 ml-6">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <UserIcon size={20} className="text-primary-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {user.manager?.fullName}
              </div>
              <div className="text-sm text-gray-500">
                {user.manager?.email}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subordinados */}
      {hasSubordinates && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Equipo ({subordinates.length})
            </span>
          </div>
          <div className="space-y-2">
            {subordinates.map((subordinate) => (
              <div
                key={subordinate.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <UserIcon size={16} className="text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {subordinate.fullName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {subordinate.email}
                  </div>
                </div>
                <RoleBadge role={subordinate.role} size="sm" showIcon={false} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Componente simplificado para mostrar cadena jerárquica
 */
export function HierarchyBreadcrumb({ user }: { user: User }) {
  if (!user.manager) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span>{user.manager.fullName}</span>
      <ChevronRight size={14} />
      <span className="font-medium text-gray-900">{user.fullName}</span>
    </div>
  );
}
