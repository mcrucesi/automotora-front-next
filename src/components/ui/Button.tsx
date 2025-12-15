import React from 'react';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 hover:bg-primary-700 text-white shadow-base hover:shadow-lg focus:ring-primary-100',
  accent: 'bg-accent-500 hover:bg-accent-700 text-white shadow-base hover:shadow-lg focus:ring-accent-100',
  outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-100',
  ghost: 'text-primary-500 hover:bg-primary-50 focus:ring-primary-100',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <button
      disabled={disabled}
      className={`
        flex items-center justify-center rounded-lg font-bold
        transition-all duration-200
        focus:outline-none focus:ring-4
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
