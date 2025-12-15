import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
}) => {
  return (
    <div
      className={`
        p-5 bg-bg-card rounded-xl shadow-base border border-gray-100
        ${hover ? 'transition-all duration-300 hover:shadow-lg hover:scale-[1.01]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
