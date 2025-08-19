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
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
          rel="preload"
        />
        <link
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 테마 초기화 - 페이지 로드 전에 실행
              (function() {
                try {
                  const stored = localStorage.getItem('typing-settings');
                  const settings = stored ? JSON.parse(stored) : null;
                  const theme = settings?.state?.theme || 'dark';
                  
                  // 다크 테마가 아닌 경우에만 속성 설정
                  if (theme !== 'dark') {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                } catch (e) {
                  // 기본 다크 테마 사용
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}