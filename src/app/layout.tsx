import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Key Types - 타자연습',
  description: '몽키타이프 스타일의 미니멀 타자연습 사이트',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background text-text-primary font-mono antialiased">
        {children}
      </body>
    </html>
  )
}