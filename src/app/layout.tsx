import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '한글타입 - 한글 타자연습',
  description: '한글을 위한 타자연습 사이트. 실시간 통계와 정확한 한글 IME 처리로 효과적인 타자 연습을 경험하세요.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
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