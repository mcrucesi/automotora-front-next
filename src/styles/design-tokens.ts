/**
 * Design Tokens - Martín Pescador Theme
 * Sistema de diseño inspirado en el Martín Pescador (Kingfisher)
 *
 * Uso:
 * import { colors, shadows, radius } from '@/styles/design-tokens';
 */

// ============================================
// COLORES
// ============================================

export const colors = {
  // Colores Primarios (Azul/Turquesa del Martín Pescador)
  primary: {
    100: '#BEE3FF',  // Azul muy claro
    500: '#0077B6',  // Azul intenso principal
    700: '#005080',  // Azul oscuro para hover
  },

  // Colores de Acento (Naranja/Rust del pecho del ave)
  accent: {
    100: '#FFE3D4',  // Naranja muy claro
    500: '#F27036',  // Naranja vibrante
    700: '#CC5929',  // Naranja oscuro para hover
  },

  // Colores de Estado
  success: {
    DEFAULT: '#38A169',
    light: '#D4F7DF',
  },
  error: '#E53E3E',
  warning: '#ECC94B',

  // Colores Neutros
  bg: {
    light: '#f8fafc',  // Fondo general
    card: '#ffffff',   // Fondo de tarjetas
  },
  text: {
    main: '#1e293b',    // Texto principal
    subtle: '#64748b',  // Texto secundario
  },

  // Grises
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// ============================================
// SOMBRAS
// ============================================

export const shadows = {
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// ============================================
// RADIOS DE BORDE
// ============================================

export const radius = {
  base: '0.5rem',   // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  full: '9999px',   // Circular
};

// ============================================
// ESPACIADO
// ============================================

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
};

// ============================================
// TIPOGRAFÍA
// ============================================

export const fontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem',// 30px
  '4xl': '2.25rem', // 36px
};

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};

// ============================================
// TRANSICIONES
// ============================================

export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};

// ============================================
// BREAKPOINTS
// ============================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================
// Z-INDEX
// ============================================

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// ============================================
// HELPERS - COLORES POR CONTEXTO
// ============================================

export const vehicleStatusColors = {
  available: {
    bg: colors.success.DEFAULT,
    text: '#ffffff',
    badge: 'bg-success text-white',
  },
  reserved: {
    bg: colors.warning,
    text: '#1f2937',
    badge: 'bg-warning text-gray-900',
  },
  sold: {
    bg: colors.error,
    text: '#ffffff',
    badge: 'bg-error text-white',
  },
  maintenance: {
    bg: colors.gray[500],
    text: '#ffffff',
    badge: 'bg-gray-500 text-white',
  },
};

export const crmStageColors = {
  new: {
    bg: colors.primary[100],
    text: colors.primary[700],
    badge: 'bg-primary-100 text-primary-700',
  },
  contacted: {
    bg: '#dbeafe',
    text: '#1e40af',
    badge: 'bg-blue-100 text-blue-700',
  },
  qualified: {
    bg: colors.accent[100],
    text: colors.accent[700],
    badge: 'bg-accent-100 text-accent-700',
  },
  negotiating: {
    bg: '#fef3c7',
    text: '#92400e',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  closed_won: {
    bg: colors.success.DEFAULT,
    text: '#ffffff',
    badge: 'bg-success text-white',
  },
  closed_lost: {
    bg: colors.gray[200],
    text: colors.gray[600],
    badge: 'bg-gray-200 text-gray-600',
  },
};

// ============================================
// HELPERS - FUNCIONES ÚTILES
// ============================================

/**
 * Obtiene el color de badge según el estado del vehículo
 */
export const getVehicleStatusBadge = (status: keyof typeof vehicleStatusColors) => {
  return vehicleStatusColors[status]?.badge || 'bg-gray-200 text-gray-600';
};

/**
 * Obtiene el color de badge según el stage del CRM
 */
export const getCrmStageBadge = (stage: keyof typeof crmStageColors) => {
  return crmStageColors[stage]?.badge || 'bg-gray-200 text-gray-600';
};

/**
 * Obtiene el color de texto según el estado del vehículo
 */
export const getVehicleStatusTextColor = (status: keyof typeof vehicleStatusColors) => {
  return vehicleStatusColors[status]?.text || colors.text.main;
};

/**
 * Obtiene el color de fondo según el stage del CRM
 */
export const getCrmStageBgColor = (stage: keyof typeof crmStageColors) => {
  return crmStageColors[stage]?.bg || colors.gray[200];
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  colors,
  shadows,
  radius,
  spacing,
  fontSize,
  fontWeight,
  transitions,
  breakpoints,
  zIndex,
  vehicleStatusColors,
  crmStageColors,
  getVehicleStatusBadge,
  getCrmStageBadge,
  getVehicleStatusTextColor,
  getCrmStageBgColor,
};
