'use client'

import { useEffect, useState } from 'react'
import { useStatsStore } from '@/stores/statsStore'
import { useTypingStore } from '@/stores/typingStore'
import { useSettingsStore } from '@/stores/settingsStore'

interface StatsCalculatorProps {
  className?: string
}

export function StatsCalculator({ className = '' }: StatsCalculatorProps) {
  const { liveStats } = useStatsStore()
  const { isActive, isPaused, startTime } = useTypingStore()
  const { testMode, testTarget } = useSettingsStore()
  
  const [displayTime, setDisplayTime] = useState(0)

  // 시간 표시 업데이트
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && !isPaused && startTime) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime.getTime()) / 1000
        setDisplayTime(elapsed)
      }, 100) // 100ms마다 업데이트 (부드러운 애니메이션)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, isPaused, startTime])

  // 남은 시간/단어 계산
  const getRemaining = () => {
    if (testMode === 'time') {
      return Math.max(0, testTarget - displayTime)
    } else {
      const wordsTyped = Math.floor(liveStats.charactersTyped / 5)
      return Math.max(0, testTarget - wordsTyped)
    }
  }

  // 시간 포맷팅 (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 애니메이션된 숫자 표시
  const AnimatedNumber = ({ value, suffix = '', precision = 0 }: { 
    value: number
    suffix?: string
    precision?: number 
  }) => {
    const [displayValue, setDisplayValue] = useState(value)

    useEffect(() => {
      const difference = value - displayValue
      const increment = difference / 10 // 10단계로 나누어 애니메이션
      
      if (Math.abs(difference) > 0.1) {
        const timer = setTimeout(() => {
          setDisplayValue(prev => prev + increment)
        }, 50)
        return () => clearTimeout(timer)
      } else {
        setDisplayValue(value)
      }
    }, [value, displayValue])

    return (
      <span className="tabular-nums">
        {displayValue.toFixed(precision)}{suffix}
      </span>
    )
  }

  const remaining = getRemaining()
  const isTimeMode = testMode === 'time'


  return (
    <div className={`stats-calculator ${className}`}>
      {/* 핵심 통계 - 원형 그래프들 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-surface rounded-lg">
        {/* 타수 (CPM) - 원형 그래프 */}
        <div className="text-center py-4 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-2">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r="17"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-text-secondary opacity-20"
              />
              <circle
                cx="20"
                cy="20"
                r="17"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 17}`}
                strokeDashoffset={`${2 * Math.PI * 17 * (1 - Math.min(liveStats.cpm / 500, 1))}`}
                className="text-typing-accent transition-all duration-500 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-typing-accent">
                <AnimatedNumber value={liveStats.cpm} />
              </span>
              <span className="text-xs text-text-secondary">CPM</span>
            </div>
          </div>
          <div className="text-sm font-medium text-text-secondary">타수</div>
        </div>

        {/* 정확도 - 원형 그래프 */}
        <div className="text-center py-4 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-2">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r="17"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-text-secondary opacity-20"
              />
              <circle
                cx="20"
                cy="20"
                r="17"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 17}`}
                strokeDashoffset={`${2 * Math.PI * 17 * (1 - liveStats.accuracy / 100)}`}
                className="text-typing-correct transition-all duration-300 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-typing-correct">
                <AnimatedNumber value={liveStats.accuracy} />
              </span>
              <span className="text-xs text-text-secondary">%</span>
            </div>
          </div>
          <div className="text-sm font-medium text-text-secondary">정확도</div>
        </div>

        {/* 진행도 - 원형 그래프 */}
        <div className="text-center py-4 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-2">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r="17"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-text-secondary opacity-20"
              />
              <circle
                cx="20"
                cy="20"
                r="17"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 17}`}
                strokeDashoffset={`${2 * Math.PI * 17 * (1 - (liveStats.charactersTyped / Math.max(liveStats.charactersTyped + remaining, 1)))}`}
                className="text-typing-accent transition-all duration-300"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-typing-accent">
                {Math.round((liveStats.charactersTyped / Math.max(liveStats.charactersTyped + remaining, 1)) * 100)}
              </span>
              <span className="text-xs text-text-secondary">%</span>
            </div>
          </div>
          <div className="text-sm font-medium text-text-secondary">진행도</div>
        </div>

        {/* 남은 단어/시간 - 원형 그래프 */}
        <div className="text-center py-4 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-2">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r="17"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-text-secondary opacity-20"
              />
              <circle
                cx="20"
                cy="20"
                r="17"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 17}`}
                strokeDashoffset={`${2 * Math.PI * 17 * (1 - (remaining / Math.max(testTarget, 1)))}`}
                className="text-text-primary transition-all duration-300"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-text-primary">
                <AnimatedNumber value={remaining} />
              </span>
              <span className="text-xs text-text-secondary">
                {isTimeMode ? 's' : 'w'}
              </span>
            </div>
          </div>
          <div className="text-sm font-medium text-text-secondary">
            {isTimeMode ? '남은 시간' : '남은 단어'}
          </div>
        </div>
      </div>

      {/* 추가 통계 (모바일용 확장 정보) */}
      <div className="lg:hidden mt-4">
        <details className="bg-surface rounded-lg">
          <summary className="p-4 cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            자세한 통계 보기
          </summary>
          <div className="px-4 pb-4 grid grid-cols-2 gap-6 text-center">
            <div className="py-3">
              <div className="text-xl font-bold text-typing-accent mb-1">
                <AnimatedNumber value={liveStats.rawCpm} />
              </div>
              <div className="text-sm font-medium text-text-secondary">Raw 타수</div>
              <div className="text-xs text-text-secondary opacity-70">오타 포함</div>
            </div>
            <div className="py-3">
              <div className="text-xl font-bold text-text-primary mb-1">
                <AnimatedNumber value={liveStats.rawWpm} />
              </div>
              <div className="text-sm font-medium text-text-secondary">Raw WPM</div>
              <div className="text-xs text-text-secondary opacity-70">&nbsp;</div>
            </div>
            <div className="py-3">
              <div className="text-xl font-bold text-text-primary mb-1">
                <AnimatedNumber value={liveStats.consistency} suffix="%" />
              </div>
              <div className="text-sm font-medium text-text-secondary">일관성</div>
              <div className="text-xs text-text-secondary opacity-70">&nbsp;</div>
            </div>
            <div className="py-3">
              <div className="text-xl font-bold text-text-primary mb-1">
                {liveStats.charactersTyped}
              </div>
              <div className="text-sm font-medium text-text-secondary">입력한 문자</div>
              <div className="text-xs text-text-secondary opacity-70">&nbsp;</div>
            </div>
            <div className="py-3">
              <div className="text-xl font-bold text-typing-incorrect mb-1">
                {liveStats.errorsCount}
              </div>
              <div className="text-sm font-medium text-text-secondary">오타</div>
              <div className="text-xs text-text-secondary opacity-70">&nbsp;</div>
            </div>
            <div className="py-3">
              <div className="text-xl font-bold text-text-secondary mb-1">
                <AnimatedNumber value={liveStats.timeElapsed} suffix="초" precision={1} />
              </div>
              <div className="text-sm font-medium text-text-secondary">경과 시간</div>
              <div className="text-xs text-text-secondary opacity-70">&nbsp;</div>
            </div>
          </div>
        </details>
      </div>

    </div>
  )
}