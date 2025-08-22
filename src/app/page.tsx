'use client'

import { useEffect } from 'react'
import { Layout } from '@/components/ui/Layout'
import { TypingEngine } from '@/components/core/TypingEngine'
import { ClientOnly } from '@/components/ClientOnly'
import { ThemeInitializer } from '@/components/ThemeInitializer'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { useSettingsStore, initializeTheme } from '@/stores/settingsStore'
import { useTypingStore } from '@/stores/typingStore'
import { getLanguagePack } from '@/modules/languages'
import { TextGenerator } from '@/utils/textGenerator'

export default function Home() {
  const { language, testTarget, testMode, theme, sentenceLength, sentenceStyle } = useSettingsStore()
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
    
    // 새로운 텍스트 생성 로직 사용
    const newText = textGenerator.generateNewText({
      mode: testMode,
      count: testTarget,
      sentenceLength,
      sentenceStyle
    })
    
    setTargetText(newText)
    resetTest()
  }, [language, testTarget, testMode, theme, sentenceLength, sentenceStyle, setTargetText, resetTest])

  return (
    <>
      <ThemeInitializer />
      <Layout>
      {/* 메인 컨테이너 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)' }}>
        
        {/* 섹션 1: 메인 타이핑 영역 */}
        <section className="w-full">
          {/* 언어 선택 토글 */}
          <div className="flex justify-center mb-6">
            <LanguageToggle />
          </div>
          
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

      </div>
    </Layout>
    </>
  )
}