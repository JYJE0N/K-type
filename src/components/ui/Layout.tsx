'use client'

import { ReactNode } from 'react'
import { Header } from './Header'

interface LayoutProps {
  children: ReactNode
  className?: string
}

export function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className={`layout min-h-screen bg-background text-text-primary ${className}`}>
      {/* 헤더 */}
      <Header />
      
      {/* 메인 컨텐츠 */}
      <main className="main-content">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
      
      {/* 푸터 */}
      <footer className="footer mt-auto border-t border-text-secondary border-opacity-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <div className="text-sm text-text-secondary">
              © 2024 Key Types. 오픈소스 타자연습 사이트
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <button className="hover:text-text-primary transition-colors">
                도움말
              </button>
              <button className="hover:text-text-primary transition-colors">
                정보
              </button>
              <a 
                href="https://github.com/your-username/key-types" 
                className="hover:text-text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}