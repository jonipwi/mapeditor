import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Game Map Editor',
  description: 'A tablet-optimized game map scene editor and generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}