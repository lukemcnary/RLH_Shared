import type { Metadata } from 'next'
import './globals.css'
import { TopNav } from '@/components/top-nav'

export const metadata: Metadata = {
  title: 'RangelineOS',
  description: 'Construction project management for Rangeline Homes',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full flex flex-col overflow-hidden">
        <TopNav />
        <main
          className="flex-1 min-h-0 overflow-hidden"
          style={{ backgroundColor: 'var(--background)' }}
        >
          {children}
        </main>
      </body>
    </html>
  )
}
