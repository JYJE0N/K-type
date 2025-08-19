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
  const getRemaining = (): number => {
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


  // 완전히 비활성화된 상태 - 아무것도 렌더링하지 않음
  return null
  
  // 주석처리된 기존 코드들
  /*
  return (
    <div className={`stats-calculator ${className}`}>

      // 미니멀 버전 (비활성화)
      <div className="flex justify-center items-center gap-8 py-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary tabular-nums">
            {liveStats.charactersTyped}
          </div>
          <div className="text-sm text-text-secondary">현재위치</div>
        </div>
        
        <div className="w-px h-12 bg-text-secondary opacity-30"></div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-primary tabular-nums">
            {liveStats.charactersTyped + remaining}
          </div>
          <div className="text-sm text-text-secondary">총문자</div>
        </div>
        
        <div className="w-px h-12 bg-text-secondary opacity-30"></div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-typing-incorrect tabular-nums">
            {liveStats.errorsCount}
          </div>
          <div className="text-sm text-text-secondary">실수</div>
        </div>
        
        <div className="w-px h-12 bg-text-secondary opacity-30"></div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-typing-accent tabular-nums">
            <AnimatedNumber value={liveStats.accuracy} />%
          </div>
          <div className="text-sm text-text-secondary">정확도</div>
        </div>
      </div>
    </div>
  )
  */
}