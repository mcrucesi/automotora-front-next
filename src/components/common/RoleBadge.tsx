/**
 * RoleBadge Component
 * Badge visual para mostrar el rol de un usuario
 */

import { UserRole, ROLE_LABELS, ROLE_COLORS } from '@/types/roles';
import { Shield, Crown, Users, User, Eye } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const ICON_COMPONENTS = {
  [UserRole.SUPERADMIN]: Shield,
  [UserRole.ADMIN]: Crown,
  [UserRole.SALES_LEADER]: Users,
  [UserRole.SELLER]: User,
  [UserRole.AUDITOR]: Eye,
};

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

const ICON_SIZES = {
  sm: 12,
  md: 14,
  lg: 16,
};

export function RoleBadge({
  role,
  size = 'md',
  showIcon = true,
  className = '',
}: RoleBadgeProps) {
  // Convertir a UserRole si es string
  const userRole = role as UserRole;

  // Verificar si es un rol válido
  if (!Object.values(UserRole).includes(userRole)) {
    return (
      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md border border-gray-300">
        {role}
      </span>
    );
  }

  const label = ROLE_LABELS[userRole] || role;
  const colors = ROLE_COLORS[userRole];
  const IconComponent = ICON_COMPONENTS[userRole];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-md border
        ${colors.bg} ${colors.text} ${colors.border}
        ${SIZE_CLASSES[size]}
        ${className}
      `}
    >
      {showIcon && IconComponent && (
        <IconComponent size={ICON_SIZES[size]} className="flex-shrink-0" />
      )}
      <span>{label}</span>
    </span>
  );
}
