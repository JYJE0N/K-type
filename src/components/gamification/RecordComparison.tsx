'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface RecordComparisonProps {
  currentCPM: number
  currentWPM: number  
  currentAccuracy: number
  bestCPM: number
  bestWPM: number
  bestAccuracy: number
  isLive?: boolean
}

export function RecordComparison({ 
  currentCPM, 
  currentWPM, 
  currentAccuracy,
  bestCPM, 
  bestWPM, 
  bestAccuracy,
  isLive = false 
}: RecordComparisonProps) {
  const [celebrations, setCelebrations] = useState<string[]>([])
  
  // 신기록 체크
  useEffect(() => {
    const newCelebrations: string[] = []
    
    if (currentCPM > bestCPM) {
      newCelebrations.push(`신기록! CPM ${currentCPM} (이전: ${bestCPM})`)
    }
    if (currentWPM > bestWPM) {
      newCelebrations.push(`신기록! WPM ${currentWPM} (이전: ${bestWPM})`)
    }
    if (currentAccuracy > bestAccuracy) {
      newCelebrations.push(`신기록! 정확도 ${currentAccuracy}% (이전: ${bestAccuracy}%)`)
    }
    
    if (newCelebrations.length > 0) {
      setCelebrations(newCelebrations)
      // 3초 후 축하 메시지 제거
      setTimeout(() => setCelebrations([]), 3000)
    }
  }, [currentCPM, currentWPM, currentAccuracy, bestCPM, bestWPM, bestAccuracy])
  
  const ComparisonItem = ({ 
    label, 
    current, 
    best, 
    unit = '' 
  }: { 
    label: string
    current: number
    best: number  
    unit?: string
  }) => {
    const diff = current - best
    const isNewRecord = current > best
    const isEqual = current === best
    
    let icon, color, text
    
    if (isNewRecord) {
      icon = <TrendingUp className="w-4 h-4" />
      color = 'text-green-400'
      text = `+${diff}${unit}`
    } else if (isEqual) {
      icon = <Minus className="w-4 h-4" />
      color = 'text-yellow-400'
      text = `${diff}${unit}`
    } else {
      icon = <TrendingDown className="w-4 h-4" />
      color = 'text-red-400'  
      text = `${diff}${unit}`
    }
    
    return (
      <div className="flex items-center justify-between p-3 bg-surface bg-opacity-50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">{label}</span>
          {isLive && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-lg font-bold text-typing-accent">
              {current}{unit}
            </div>
            <div className="text-xs text-text-secondary">
              최고: {best}{unit}
            </div>
          </div>
          
          <div className={`flex items-center gap-1 ${color}`}>
            {icon}
            <span className="text-sm font-medium">{text}</span>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* 축하 메시지 */}
      {celebrations.length > 0 && (
        <div className="space-y-2">
          {celebrations.map((message, index) => (
            <div 
              key={index}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white 
                         p-3 rounded-lg font-bold text-center animate-pulse"
            >
              {message}
            </div>
          ))}
        </div>
      )}
      
      {/* 기록 비교 */}
      <div className="space-y-3">
        <ComparisonItem 
          label="CPM"
          current={currentCPM}
          best={bestCPM}
        />
        
        <ComparisonItem 
          label="WPM" 
          current={currentWPM}
          best={bestWPM}
        />
        
        <ComparisonItem 
          label="정확도"
          current={currentAccuracy}
          best={bestAccuracy}
          unit="%"
        />
      </div>
      
      {/* 목표까지 남은 거리 */}
      <div className="mt-4 p-3 bg-typing-accent bg-opacity-10 rounded-lg">
        <div className="text-sm font-medium text-typing-accent mb-2">
          다음 목표까지
        </div>
        
        {/* CPM 목표 (100단위) */}
        {(() => {
          const nextCPMTarget = Math.ceil(Math.max(currentCPM, bestCPM) / 100) * 100
          const remaining = nextCPMTarget - currentCPM
          
          return remaining > 0 ? (
            <div className="text-sm text-text-secondary">
              {nextCPMTarget} CPM까지 <span className="font-bold text-typing-accent">{remaining}</span> 남음
            </div>
          ) : (
            <div className="text-sm text-green-400">
              {nextCPMTarget} CPM 목표 달성!
            </div>
          )
        })()}
      </div>
    </div>
  )
}