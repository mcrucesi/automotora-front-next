import React from 'react';
import { UserRole, ROLE_LABELS, ROLE_COLORS } from '@/types/roles';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

/**
 * Badge component for displaying user roles with appropriate colors
 */
export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  const colors = ROLE_COLORS[role];
  const label = ROLE_LABELS[role];

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full
        text-xs font-medium border
        ${colors.bg} ${colors.text} ${colors.border}
        ${className}
      `}
    >
      {label}
    </span>
  );
};
