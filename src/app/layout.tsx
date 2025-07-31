import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Trackly - Gestão de Horas',
  description: 'Aplicação para gestão inteligente de horas trabalhadas',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <main className="mx-auto max-w-7xl pt-24 pb-8 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">{children}</div>
            </main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
