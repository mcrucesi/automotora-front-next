import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores Primarios (Azul/Turquesa del Martín Pescador)
        primary: {
          100: '#BEE3FF',
          500: '#0077B6',
          700: '#005080',
        },
        // Colores de Acento (Naranja/Rust del pecho del ave)
        accent: {
          100: '#FFE3D4',
          500: '#F27036',
          700: '#CC5929',
        },
        // Colores de Estado
        success: {
          DEFAULT: '#38A169',
          light: '#D4F7DF',
        },
        error: '#E53E3E',
        warning: '#ECC94B',
        // Neutros
        bg: {
          light: '#f8fafc',
          card: '#ffffff',
        },
        text: {
          main: '#1e293b',
          subtle: '#64748b',
        },
      },
      boxShadow: {
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl-custom': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        base: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
    },
  },
  plugins: [],
}

export default config
