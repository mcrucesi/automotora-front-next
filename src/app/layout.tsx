import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers/Providers'
import '../styles/tokens.css'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AutoDealer - Sistema de Gestión de Vehículos',
  description: 'Sistema de gestión de concesionario de autos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-bg-light text-text-main`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
