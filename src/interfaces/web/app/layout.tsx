import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Tipsfy',
  description: 'Gestão de assinaturas para tipsters.',
  icons: {
    icon: '/brand/favicon.svg',
    apple: '/brand/icon-app.svg',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>
}
