import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PopStreet Bakes MiniPOS',
  description: 'Point of Sale System for PopStreet Bakes',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`} style={{background: 'linear-gradient(135deg, #FFE1E0 0%, #F49BAB 30%, #9B7EBD 70%, #7F55B1 100%)'}}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
} 