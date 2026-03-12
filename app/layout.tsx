import React from "react"
import type { Metadata } from 'next'
import { Manrope, Poppins, IBM_Plex_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { PagePreloader } from '@/components/page-preloader'
import './globals.css'

const _manrope = Manrope({ subsets: ["latin", "cyrillic"], weight: ["700"] });
const _poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"] });
const _ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin", "cyrillic"], weight: ["700"] });

export const metadata: Metadata = {
  title: 'Rampartx - P2P маркетплейс цифровых товаров',
  description: 'Безопасная торговля цифровыми товарами без посредников и рисков. P2P маркетплейс с защитой сделок и низкими комиссиями.',
  generator: 'v0.app',
  icons: {
    icon: '/shield.png',
    apple: '/shield.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className="dark">
      <body className={`font-sans antialiased`}>
        <PagePreloader />
        {children}
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}
