'use client'

import { useEffect } from 'react'
import { Layout } from '@/components/ui/Layout'
import { TypingEngine } from '@/components/core/TypingEngine'
import { ClientOnly } from '@/components/ClientOnly'
import { ThemeInitializer } from '@/components/ThemeInitializer'
import { useSettingsStore, initializeTheme } from '@/stores/settingsStore'
import { useTypingStore } from '@/stores/typingStore'
import { getLanguagePack } from '@/modules/languages'
import { TextGenerator } from '@/utils/textGenerator'
import { StatsCalculator } from '@/components/core/StatsCalculator'

export default function Home() {
  const { language, textType, testTarget, testMode } = useSettingsStore()
  const { setTargetText, resetTest } = useTypingStore()

  // 테마 초기화
  useEffect(() => {
    initializeTheme()
  }, [])

  // 언어 또는 설정 변경 시 새로운 텍스트 생성
  useEffect(() => {
    const languagePack = getLanguagePack(language)
    if (!languagePack) return

    const textGenerator = new TextGenerator(languagePack)
    
    // 단어 수 계산 (시간 모드의 경우 예상 WPM 기반)
    let wordCount = testTarget
    if (testMode === 'time') {
      // 평균 WPM 40 기준으로 단어 수 계산
      wordCount = Math.max(50, Math.floor((testTarget / 60) * 40))
    }

    const newText = textGenerator.generateText(textType, { wordCount })
    setTargetText(newText)
    resetTest()
  }, [language, textType, testTarget, testMode, setTargetText, resetTest])

  return (
    <>
      <ThemeInitializer />
      <Layout>
      {/* 메인 컨테이너 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)' }}>
        
        {/* 섹션 1: 메인 타이핑 영역 */}
        <section className="w-full">
          <ClientOnly 
            fallback={
              <div className="animate-pulse">
                <div className="h-20 bg-surface rounded-lg mb-6"></div>
                <div className="h-40 bg-surface rounded-lg"></div>
              </div>
            }
          >
            <TypingEngine className="w-full" />
          </ClientOnly>
        </section>
          
        {/* 섹션 2: 간단한 실시간 통계만 */}
        <section className="w-full">
          <div className="card">
            <div className="card-content">
              <ClientOnly fallback={<div className="h-32 bg-background rounded animate-pulse"></div>}>
                <StatsCalculator />
              </ClientOnly>
            </div>
          </div>
        </section>


      </div>
    </Layout>
    </>
  )
}