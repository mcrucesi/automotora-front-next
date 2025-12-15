# AutoDealer - Frontend (Next.js 14)

Sistema de gestión de concesionario de autos construido con Next.js 14, TypeScript y Tailwind CSS.

## 🎨 Sistema de Diseño

Este proyecto utiliza el sistema de diseño **"Martín Pescador"**, inspirado en los colores vibrantes del ave Martín Pescador:

- **Colores Primarios**: Azul/Turquesa (#0077B6)
- **Colores de Acento**: Naranja/Rust (#F27036)
- **Colores de Estado**: Success, Error, Warning

## 📁 Estructura del Proyecto

```
client-car-next/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── (auth)/            # Rutas de autenticación
│   │   │   └── login/
│   │   ├── (dashboard)/       # Rutas del dashboard (con layout compartido)
│   │   │   ├── dashboard/
│   │   │   ├── inventory/
│   │   │   └── crm/
│   │   └── layout.tsx         # Layout raíz
│   ├── components/
│   │   ├── ui/                # Componentes base (Button, Badge, Card)
│   │   ├── layout/            # Header, BottomNav
│   │   └── dashboard/         # KPICard y componentes específicos
│   ├── lib/
│   │   ├── api/               # Cliente API HTTP
│   │   └── utils/             # Utilidades (cn, etc.)
│   ├── hooks/                 # Custom hooks de React
│   ├── contexts/              # Contextos de React
│   └── styles/
│       ├── tokens.css         # Variables CSS del sistema de diseño
│       ├── globals.css        # Estilos globales y utilidades
│       └── design-tokens.ts   # Tokens de diseño en TypeScript
├── public/                    # Archivos estáticos
├── tailwind.config.ts         # Configuración de Tailwind CSS
├── tsconfig.json              # Configuración de TypeScript
└── package.json
```

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Variables de Entorno

Copia el archivo `.env.example` a `.env.local` y configura las variables:

```bash
cp .env.example .env.local
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## 🎨 Componentes UI

### Button

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  Guardar
</Button>
```

Variantes: `primary`, `accent`, `outline`, `ghost`
Tamaños: `sm`, `md`, `lg`

### Badge

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Disponible</Badge>
```

Variantes: `primary`, `accent`, `success`, `error`, `warning`, `gray`

### Card

```tsx
import { Card } from '@/components/ui';

<Card hover>
  <h2>Título</h2>
  <p>Contenido</p>
</Card>
```

### KPICard

```tsx
import { KPICard } from '@/components/dashboard';
import { Users } from 'lucide-react';

<KPICard
  title="Leads"
  value={12}
  unit="Activos"
  icon={Users}
  iconColor="text-indigo-500"
/>
```

## 🎨 Tokens de Diseño

Importa los tokens desde `@/styles/design-tokens`:

```tsx
import { colors, shadows, radius } from '@/styles/design-tokens';

// Usar colores
const primaryColor = colors.primary[500];

// Usar helpers
import { getVehicleStatusBadge } from '@/styles/design-tokens';
const badgeClass = getVehicleStatusBadge('available');
```

## 📱 Responsive Design

El proyecto sigue un enfoque **Mobile First** con los siguientes breakpoints:

- `sm`: 640px - Tablets pequeñas
- `md`: 768px - Tablets
- `lg`: 1024px - Desktop
- `xl`: 1280px - Desktop grande
- `2xl`: 1536px - Pantallas muy grandes

## 🔗 Integración con Backend

El proyecto está configurado para conectarse al backend NestJS ubicado en `../client-car-api/`.

Configurar la URL del API en `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Uso del API Client

```tsx
import { apiClient } from '@/lib/api/client';

// GET request
const vehicles = await apiClient.get('/vehicles');

// POST request
const newVehicle = await apiClient.post('/vehicles', vehicleData);

// PUT request
const updated = await apiClient.put('/vehicles/123', updateData);

// DELETE request
await apiClient.delete('/vehicles/123');
```

## 🎯 Arquitectura

Este proyecto sigue principios de **arquitectura limpia** inspirados en la estructura hexagonal del backend:

- **Separación de responsabilidades**: UI, lógica de negocio, y acceso a datos están claramente separados
- **Componentes reutilizables**: Sistema de diseño consistente
- **Type-safe**: TypeScript en todo el proyecto
- **Performance**: Optimizaciones de Next.js 14 (Server Components, App Router)

## 📦 Tecnologías

- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Utilidades CSS
- **Lucide React**: Iconos
- **React 18**: Biblioteca UI

## 🔄 Próximos Pasos

1. Implementar autenticación (JWT tokens)
2. Conectar con endpoints del backend
3. Añadir manejo de estado global (Zustand/Context API)
4. Implementar formularios con validación
5. Añadir tests (Jest + React Testing Library)
6. Configurar CI/CD

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)

## 📄 Licencia

Este proyecto es privado y confidencial.
