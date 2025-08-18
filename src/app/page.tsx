'use client'

import { useEffect } from 'react'
import { Layout } from '@/components/ui/Layout'
import { TypingEngine } from '@/components/core/TypingEngine'
import { ClientOnly } from '@/components/ClientOnly'
import { useSettingsStore, initializeTheme } from '@/stores/settingsStore'
import { useTypingStore } from '@/stores/typingStore'
import { getLanguagePack } from '@/modules/languages'
import { TextGenerator } from '@/utils/textGenerator'
import { StatsCalculator } from '@/components/core/StatsCalculator'
import { CPMGraph } from '@/components/core/CPMGraph'
import { Play, Settings, Circle, RotateCcw } from 'lucide-react'

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
      {/* 메인 컨테이너 - Layout에서 이미 중앙정렬 처리됨 */}
      <div className="space-y-8">
        
        {/* 섹션 1: 메인 타이핑 영역 */}
        <section className="flex flex-col items-center space-y-8">
          {/* 타이핑 엔진 - 표준 너비 */}
          <div className="w-full">
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
          </div>
          
          {/* 포인트 버튼 - 새 텍스트 */}
          <button
            onClick={generateNewText}
            className="px-6 py-3 bg-typing-accent text-background hover:bg-typing-accent/90 active:bg-typing-accent/80 focus:ring-2 focus:ring-typing-accent/50 transition-all duration-200 rounded-md text-base font-semibold shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            새로운 텍스트
          </button>
        </section>
          
        {/* 섹션 2: 그래프 카드들 - 가운데 정렬 */}
        <section className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface rounded-md p-6 border border-text-secondary border-opacity-20">
              <h3 className="text-xl font-bold text-white mb-4">실시간 통계</h3>
              <ClientOnly fallback={<div className="h-64 bg-background rounded animate-pulse"></div>}>
                <StatsCalculator />
              </ClientOnly>
            </div>
            
            <div className="bg-surface rounded-md p-6 border border-text-secondary border-opacity-20">
              <h3 className="text-xl font-bold text-white mb-4">CPM 그래프</h3>
              <div className="h-64">
                <ClientOnly fallback={<div className="h-full bg-background rounded animate-pulse"></div>}>
                  <CPMGraph />
                </ClientOnly>
              </div>
            </div>
          </div>
        </section>

        {/* 섹션 3: 사용법 안내 - 가운데 정렬 */}
        <section className="w-full">
          <div className="p-6 bg-surface rounded-md border border-text-secondary border-opacity-20">
            <h2 className="text-xl font-bold mb-6 text-white text-left">사용법</h2>
            <div className="grid md:grid-cols-2 gap-8 text-base text-white">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Play className="w-4 h-4 text-white" />
                  <h3 className="text-base font-semibold text-white">테스트 시작</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Circle className="w-2 h-2 text-white mt-2 flex-shrink-0" fill="currentColor" />
                    <span className="text-white">텍스트 영역을 클릭하거나 아무 키나 눌러 시작</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-2 h-2 text-white mt-2 flex-shrink-0" fill="currentColor" />
                    <span className="text-white">화면에 표시된 텍스트를 정확히 입력</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-2 h-2 text-white mt-2 flex-shrink-0" fill="currentColor" />
                    <span className="text-white">실수 시 백스페이스로 수정 가능</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-2 h-2 text-white mt-2 flex-shrink-0" fill="currentColor" />
                    <span className="text-white">
                      <kbd className="px-2 py-1 bg-surface border border-text-secondary border-opacity-30 rounded text-xs font-mono text-white">Shift</kbd> + <kbd className="px-2 py-1 bg-surface border border-text-secondary border-opacity-30 rounded text-xs font-mono text-white">Enter</kbd>: 새로운 텍스트로 재시작
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-4 h-4 text-white" />
                  <h3 className="text-base font-semibold text-white">설정 변경</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Circle className="w-2 h-2 text-white mt-2 flex-shrink-0" fill="currentColor" />
                    <span className="text-white">상단에서 언어, 테마, 테스트 모드 선택</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-2 h-2 text-white mt-2 flex-shrink-0" fill="currentColor" />
                    <span className="text-white">시간 기반 또는 단어 수 기반 테스트</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-2 h-2 text-white mt-2 flex-shrink-0" fill="currentColor" />
                    <span className="text-white">단어, 구두점, 숫자, 문장 중 선택</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 섹션 4: 개발 정보 (개발용) - 가운데 정렬 */}
        {process.env.NODE_ENV === 'development' && (
          <section className="w-full">
            <div className="p-6 bg-surface rounded-md border border-text-secondary border-opacity-20">
              <h3 className="text-xl font-bold text-white mb-4 text-left">개발 정보</h3>
              <div className="grid grid-cols-2 gap-4 text-base text-white">
                <div>언어: <span className="font-medium text-white">{language}</span></div>
                <div>텍스트 타입: <span className="font-medium text-white">{textType}</span></div>
                <div>테스트 모드: <span className="font-medium text-white">{testMode}</span></div>
                <div>목표: <span className="font-medium text-white">{testTarget}{testMode === 'time' ? '초' : '단어'}</span></div>
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}