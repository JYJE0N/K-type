'use client'

import { useEffect } from 'react'
import { Layout } from '@/components/ui/Layout'
import { TypingEngine } from '@/components/core/TypingEngine'
import { ClientOnly } from '@/components/ClientOnly'
import { KeyboardTest } from '@/components/debug/KeyboardTest'
import { useSettingsStore, initializeTheme } from '@/stores/settingsStore'
import { useTypingStore } from '@/stores/typingStore'
import { getLanguagePack } from '@/modules/languages'
import { TextGenerator } from '@/utils/textGenerator'

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
    console.log('Generated new text (useEffect):', { 
      newText: newText.substring(0, 50) + '...', 
      length: newText.length, 
      language, 
      textType, 
      wordCount,
      firstChar: `"${newText[0]}"(${newText[0] ? newText[0].charCodeAt(0) : 'undefined'})`,
      firstFewChars: newText.substring(0, 10).split('').map(c => `"${c}"(${c.charCodeAt(0)})`).join(', ')
    })
    setTargetText(newText)
    resetTest()
  }, [language, textType, testTarget, testMode, setTargetText, resetTest])

  const generateNewText = () => {
    const languagePack = getLanguagePack(language)
    if (!languagePack) return

    const textGenerator = new TextGenerator(languagePack)
    let wordCount = testTarget
    if (testMode === 'time') {
      wordCount = Math.max(50, Math.floor((testTarget / 60) * 40))
    }

    const newText = textGenerator.generateText(textType, { wordCount })
    setTargetText(newText)
    resetTest()
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* 메인 타이핑 영역 */}
        <ClientOnly 
          fallback={
            <div className="space-y-8">
              <div className="animate-pulse">
                <div className="h-20 bg-surface rounded-lg mb-6"></div>
                <div className="h-40 bg-surface rounded-lg"></div>
              </div>
            </div>
          }
        >
          <div className="space-y-8">
            <TypingEngine className="w-full" />
            
            {/* 새로운 텍스트 생성 버튼 */}
            <div className="flex justify-center">
              <button
                onClick={generateNewText}
                className="px-6 py-2 bg-surface hover:bg-typing-accent hover:text-background transition-colors rounded-lg text-text-primary border border-text-secondary border-opacity-20 hover:border-transparent"
              >
                새로운 텍스트 생성
              </button>
            </div>
          </div>
        </ClientOnly>

        {/* 사용법 안내 (처음 방문자용) */}
        <div className="mt-16 p-6 bg-surface rounded-lg border border-text-secondary border-opacity-20">
          <h2 className="text-xl font-semibold mb-4 text-typing-accent">사용법</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-text-secondary">
            <div>
              <h3 className="font-medium text-text-primary mb-2">🎯 테스트 시작</h3>
              <ul className="space-y-1">
                <li>• 텍스트 영역을 클릭하거나 아무 키나 눌러 시작</li>
                <li>• 화면에 표시된 텍스트를 정확히 입력</li>
                <li>• 실수 시 백스페이스로 수정 가능</li>
                <li>• <strong>Shift + Enter</strong>: 새로운 텍스트로 재시작</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-text-primary mb-2">⚙️ 설정 변경</h3>
              <ul className="space-y-1">
                <li>• 상단에서 언어, 테마, 테스트 모드 선택</li>
                <li>• 시간 기반 또는 단어 수 기반 테스트</li>
                <li>• 단어, 구두점, 숫자, 문장 중 선택</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 키보드 테스트 (개발용) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8">
            <KeyboardTest />
          </div>
        )}

        {/* 개발 정보 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-surface rounded-lg text-xs text-text-secondary">
            <h3 className="font-medium mb-2">개발 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>언어: {language}</div>
              <div>텍스트 타입: {textType}</div>
              <div>테스트 모드: {testMode}</div>
              <div>목표: {testTarget}{testMode === 'time' ? '초' : '단어'}</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}