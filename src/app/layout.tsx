import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { SessionProvider } from '@/components/SessionProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Glow — Period & Fertility Tracker',
  description:
    'Track your period, ovulation, and fertility with Glow — a free, open-source health app designed for women.',
  keywords: ['period tracker', 'fertility', 'ovulation', 'women health', 'cycle tracking'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7c3aed',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="h-full antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
