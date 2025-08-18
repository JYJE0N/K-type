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
      <main className="main-content py-8 flex-1 flex justify-center">
        <div className="w-full max-w-5xl px-4">
          {children}
        </div>
      </main>
      
      {/* 푸터 */}
      <Footer />
    </div>
  )
}