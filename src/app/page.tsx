'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Layout } from '@/components/ui/Layout'
import { TypingEngine } from '@/components/core/TypingEngine'
import { ClientOnly } from '@/components/ClientOnly'
import { ThemeInitializer } from '@/components/ThemeInitializer'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { useSettingsStore, initializeTheme } from '@/stores/settingsStore'
import { useTypingStore } from '@/stores/typingStore'
import { getLanguagePack } from '@/modules/languages'
import { TextGenerator } from '@/utils/textGenerator'
import { initDevTools } from '@/utils/devTools'

// URL 파라미터 처리를 위한 별도 컴포넌트
function UrlParamHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const restart = searchParams.get('restart')
    if (restart === 'true') {
      console.log('🔄 URL 파라미터로 새 테스트 시작 요청됨')
      // 약간의 딜레이 후 새 텍스트 생성 트리거
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('typing:restart-test'))
      }, 100)
      
      // URL에서 파라미터 제거 (히스토리 깨끗하게 유지)
      window.history.replaceState({}, '', '/')
    }
  }, [searchParams])

  return null
}

export default function Home() {
  const { language, testTarget, testMode, theme, sentenceLength, sentenceStyle } = useSettingsStore()
  const { setTargetText, resetTest } = useTypingStore()

  // 테마 및 개발자 도구 초기화
  useEffect(() => {
    initializeTheme()
    initDevTools()
  }, [])

  // 모바일 스크롤 제어를 위한 body 클래스 추가/제거
  useEffect(() => {
    document.body.classList.add('typing-page')
    return () => {
      document.body.classList.remove('typing-page')
    }
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
  }, [language, testTarget, testMode, sentenceLength, sentenceStyle, setTargetText, resetTest])

  return (
    <>
      <ThemeInitializer />
      <Suspense fallback={null}>
        <UrlParamHandler />
      </Suspense>
      <Layout>
        {/* 메인 컨테이너 */}
        <div className="p-4 md:p-8">
          <div className="w-full max-w-6xl mx-auto">
            
            {/* 섹션 1: 메인 타이핑 영역 */}
            <section className="w-full">
              {/* 언어 선택 토글 - 모바일에서 고정 위치 */}
              <div className="flex justify-center mb-6 md:mb-8 md:relative md:z-auto mobile-language-toggle">
                <LanguageToggle />
              </div>
              
              <ClientOnly 
                fallback={
                  <div className="animate-pulse">
                    <div className="h-20 rounded-lg mb-6" style={{ backgroundColor: 'var(--color-surface)' }}></div>
                    <div className="h-40 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}></div>
                  </div>
                }
              >
                <TypingEngine className="w-full" />
              </ClientOnly>
            </section>

          </div>
        </div>
      </Layout>
    </>
  )
}