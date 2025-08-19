'use client'

import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface LayoutProps {
  children: ReactNode
  className?: string
}

export function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className={`layout min-h-screen bg-background text-text-primary flex flex-col ${className}`}>
      {/* 헤더 */}
      <Header />
      
      {/* 메인 컨텐츠 - 중앙 정렬 적용 */}
      <main className="main-content flex-1 flex justify-center" style={{ padding: 'var(--spacing-2xl) var(--spacing-xl)' }}>
        <div className="w-full max-w-5xl">
          {children}
        </div>
      </main>
      
      {/* 푸터 */}
      <Footer />
    </div>
  )
}