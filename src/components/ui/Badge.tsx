import React from 'react';

type BadgeVariant = 'primary' | 'accent' | 'success' | 'error' | 'warning' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'text-primary-700 bg-primary-100',
  accent: 'text-accent-700 bg-accent-100',
  success: 'text-green-700 bg-success-light',
  error: 'text-red-700 bg-red-100',
  warning: 'text-yellow-700 bg-yellow-100',
  gray: 'text-gray-700 bg-gray-100',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  return (
    <span
      className={`
        inline-block px-2 py-0.5 rounded-full
        text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
