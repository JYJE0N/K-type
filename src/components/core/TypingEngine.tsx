'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useTypingStore } from '@/stores/typingStore'
import { useStatsStore } from '@/stores/statsStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { TextRenderer } from './TextRenderer'
import { InputHandler } from './InputHandler'
import { StatsCalculator } from './StatsCalculator'
import { TestResult } from './TestResult'
import { getLanguagePack } from '@/modules/languages'
import { TextGenerator } from '@/utils/textGenerator'

interface TypingEngineProps {
  className?: string
}

export function TypingEngine({ className = '' }: TypingEngineProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isComposing = useRef(false)
  const [currentTime, setCurrentTime] = useState(0)
  
  // Store 상태
  const {
    isActive,
    isPaused,
    isCompleted,
    targetText,
    currentIndex,
    userInput,
    keystrokes,
    mistakes,
    startTime,
    resetTest,
    setTargetText,
    getCurrentChar,
    getProgress
  } = useTypingStore()
  
  const { calculateStats, resetStats } = useStatsStore()
  const { language, textType, testMode, testTarget } = useSettingsStore()

  // 테스트 재시작 핸들러 (새로운 텍스트 생성)
  const handleRestart = useCallback(() => {
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
    console.log('🔄 Generated new text via Shift+Enter:', { 
      newText: newText.substring(0, 50) + '...', 
      length: newText.length, 
      language, 
      textType, 
      wordCount 
    })
    
    setTargetText(newText)
    resetTest()
    resetStats()
  }, [language, textType, testMode, testTarget, setTargetText, resetTest, resetStats])

  // IME 조합 상태 변경 핸들러
  const handleCompositionChange = useCallback((composing: boolean) => {
    isComposing.current = composing
    console.log('🎭 Composition state changed:', composing)
  }, [])

  // 타이머 업데이트
  useEffect(() => {
    if (isActive && !isPaused && !isCompleted && startTime) {
      timerRef.current = setInterval(() => {
        setCurrentTime((Date.now() - startTime.getTime()) / 1000)
      }, 100) // 100ms마다 업데이트
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isActive, isPaused, isCompleted, startTime])

  // 실시간 통계 업데이트 (IME 조합 중에는 업데이트 안함)
  useEffect(() => {
    if (isActive && !isPaused && !isCompleted && !isComposing.current) {
      intervalRef.current = setInterval(() => {
        if (!isComposing.current) {
          calculateStats(keystrokes, mistakes, startTime, currentIndex)
        }
      }, 500) // 500ms마다 업데이트
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, isPaused, isCompleted, keystrokes, mistakes, startTime, calculateStats, currentIndex])

  // 테스트 모드에 따른 완료 조건 확인
  useEffect(() => {
    if (!isActive || isPaused || isCompleted) return

    // 텍스트를 모두 완성한 경우
    if (currentIndex >= targetText.length) {
      console.log('🏁 텍스트 완성으로 테스트 완료')
      useTypingStore.getState().completeTest()
      return
    }

    if (testMode === 'time' && startTime) {
      const elapsed = (Date.now() - startTime.getTime()) / 1000
      if (elapsed >= testTarget) {
        console.log('🏁 시간 초과로 테스트 완료')
        useTypingStore.getState().completeTest()
      }
    } else if (testMode === 'words') {
      const wordsTyped = Math.floor(currentIndex / 5) // 5문자 = 1단어
      if (wordsTyped >= testTarget) {
        console.log('🏁 목표 단어 수 달성으로 테스트 완료')
        useTypingStore.getState().completeTest()
      }
    }
  }, [isActive, isPaused, isCompleted, currentIndex, startTime, testMode, testTarget, targetText.length])

  // Shift+Enter 단축키 처리
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      console.log('🔍 Global keydown:', { 
        key: event.key, 
        shiftKey: event.shiftKey, 
        ctrlKey: event.ctrlKey,
        altKey: event.altKey 
      })
      
      // Shift+Enter 조합 감지
      if (event.shiftKey && event.key === 'Enter') {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        console.log('🚀 Shift+Enter detected - Restarting test')
        
        // 테스트 재시작
        handleRestart()
        return false // 이벤트 처리 완전 중단
      }
    }

    // 전역 키보드 이벤트 리스너 등록 (capture phase에서 먼저 처리)
    document.addEventListener('keydown', handleGlobalKeyDown, { capture: true })
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, { capture: true })
    }
  }, [handleRestart])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      resetStats()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [resetStats])

  // 진행률 계산
  const progress = getProgress()
  const currentChar = getCurrentChar()
  

  return (
    <div className={`typing-engine ${className}`}>
      {/* 통계 표시 */}
      <div className="mb-6">
        <StatsCalculator />
      </div>

      {/* 메인 타이핑 영역 */}
      <div className="relative">
        {/* 시간 표시 (인풋 필드 위) */}
        {isActive && !isPaused && !isCompleted && (
          <div className="mb-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface rounded-lg border border-text-secondary border-opacity-20">
              <div className="w-3 h-3 bg-typing-accent rounded-full animate-pulse"></div>
              <div className="text-lg font-mono font-bold text-typing-accent">
                {(() => {
                  const mins = Math.floor(currentTime / 60)
                  const secs = Math.floor(currentTime % 60)
                  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
                })()}
              </div>
            </div>
          </div>
        )}
        {/* 텍스트 렌더러 */}
        <TextRenderer
          text={targetText}
          currentIndex={currentIndex}
          userInput={userInput}
          mistakes={mistakes.map(m => m.position)}
          className="mb-4"
        />

        {/* 입력 핸들러 (숨겨진 인풋) */}
        <InputHandler
          onKeyPress={useTypingStore.getState().handleKeyPress}
          onBackspace={useTypingStore.getState().handleBackspace}
          onTestStart={useTypingStore.getState().startTest}
          onCompositionChange={handleCompositionChange}
          disabled={false}
          className="absolute inset-0 cursor-text"
        />

        {/* 상태 오버레이 */}
        {!isActive && !isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-center">
              <p className="text-lg mb-2">타이핑을 시작하려면 클릭하세요</p>
              <p className="text-sm text-text-secondary">아무 키나 눌러 시작할 수 있습니다</p>
              <p className="text-xs text-text-secondary mt-2">
                <span className="bg-surface px-2 py-1 rounded">Shift + Enter</span> 새로운 텍스트로 시작
              </p>
            </div>
          </div>
        )}

        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-center">
              <p className="text-lg mb-2">일시정지됨</p>
              <p className="text-sm text-text-secondary">계속하려면 아무 키나 누르세요</p>
            </div>
          </div>
        )}

      </div>

      {/* 테스트 완료 결과 */}
      {isCompleted && (
        <div className="mt-6">
          <TestResult 
            onRestart={handleRestart}
          />
        </div>
      )}

      {/* 현재 문자 힌트 */}
      {isActive && !isPaused && !isCompleted && currentChar && (
        <div className="mt-4 text-center">
          <span className="text-sm text-text-secondary">다음 문자: </span>
          <span className="text-lg font-bold text-typing-current">
            {currentChar === ' ' ? '⎵' : currentChar}
          </span>
        </div>
      )}

      {/* 개발용 디버그 정보 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-surface rounded text-xs text-text-secondary">
          <div>Index: {currentIndex}/{targetText.length}</div>
          <div>Active: {isActive ? 'Yes' : 'No'}</div>
          <div>Paused: {isPaused ? 'Yes' : 'No'}</div>
          <div>Completed: {isCompleted ? 'Yes' : 'No'}</div>
          <div>Keystrokes: {keystrokes.length}</div>
          <div>Mistakes: {mistakes.length}</div>
        </div>
      )}
    </div>
  )
}