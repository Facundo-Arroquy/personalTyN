import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trainer & Nutrición — Facundo',
  description: 'Seguimiento personalizado de entrenamiento y dieta',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
