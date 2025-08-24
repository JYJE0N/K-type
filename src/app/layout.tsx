import type { Metadata } from 'next'
import './globals.css'


export const metadata: Metadata = {
  title: '월루타자기 | 한글 타자 연습',
  description: '직장인을 위한 한글 타자 연습 사이트',
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
                  // localStorage에서 저장된 설정 불러오기
                  const stored = localStorage.getItem('typing-settings');
                  let theme = 'light'; // 기본값
                  
                  if (stored) {
                    const parsed = JSON.parse(stored);
                    theme = parsed.state?.theme || 'light';
                  }
                  
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.setAttribute('data-theme-loaded', 'true');
                  
                  console.log('Theme initialized:', theme);
                } catch (e) {
                  // 기본 라이트 테마 사용
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.setAttribute('data-theme-loaded', 'true');
                  console.log('Fallback theme set: light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen text-text-primary antialiased" style={{ backgroundColor: 'var(--color-background)' }}>
        {children}
      </body>
    </html>
  )
}