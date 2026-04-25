import './globals.css'
import React from 'react'

export const metadata = {
  title: 'FormIQ: The Arena',
  description: 'Beginner-friendly fitness game',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <div className="app-shell">
          {children}
        </div>
      </body>
    </html>
  )
}
