'use client'

import { ReactNode } from 'react'
import { Footer } from './Footer'
import { StealthManager } from '../stealth/StealthManager'
import { GlobalHeader } from './GlobalHeader'

interface LayoutProps {
  children: ReactNode
  className?: string
}

export function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className={`layout min-h-screen bg-background text-text-primary ${className}`}>
      <StealthManager>
        {/* 전체 레이아웃을 flexbox로 구성 */}
        <div className="min-h-screen flex flex-col">
          {/* 글로벌 헤더 */}
          <GlobalHeader />
          
          {/* 메인 컨텐츠 영역 - flex-1로 남은 공간 모두 차지 */}
          <main className="flex-1 flex flex-col">
            <div className="flex-1 flex justify-center" style={{ padding: 'var(--spacing-2xl) var(--spacing-xl)' }}>
              <div className="w-full max-w-6xl">
                {children}
              </div>
            </div>
          </main>
          
          {/* 푸터 - 항상 하단에 고정 */}
          <Footer />
        </div>
      </StealthManager>
    </div>
  )
}