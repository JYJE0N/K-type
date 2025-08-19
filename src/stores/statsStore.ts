import { create } from 'zustand'
import { LiveStats, Keystroke, Mistake, TextType } from '@/types'

interface StatsStore {
  liveStats: LiveStats
  
  // 통계 계산 액션
  calculateStats: (
    keystrokes: Keystroke[],
    mistakes: Mistake[],
    startTime: Date | null,
    currentIndex?: number,
    currentTime?: Date,
    textType?: TextType
  ) => void
  
  resetStats: () => void
  
  // 개별 통계 계산 유틸리티
  calculateWPM: (keystrokes: Keystroke[], timeElapsed: number, textType?: TextType) => number
  calculateRawWPM: (keystrokes: Keystroke[], timeElapsed: number) => number
  calculateCPM: (keystrokes: Keystroke[], timeElapsed: number) => number
  calculateAccuracy: (keystrokes: Keystroke[]) => number
  calculateConsistency: (keystrokes: Keystroke[]) => number
}

const initialStats: LiveStats = {
  wpm: 0,
  rawWpm: 0,
  cpm: 0,
  rawCpm: 0,
  accuracy: 100,
  consistency: 100,
  timeElapsed: 0,
  charactersTyped: 0,
  errorsCount: 0
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  liveStats: initialStats,

  // 실시간 통계 계산 (개선된 버전)
  calculateStats: (keystrokes, mistakes, startTime, currentIndex = 0, currentTime = new Date(), textType = 'words') => {
    if (!startTime) {
      set({ liveStats: initialStats })
      return
    }

    const timeElapsed = (currentTime.getTime() - startTime.getTime()) / 1000 // 초 단위
    
    // 0.5초 이상부터 통계 계산 (더 빠른 피드백)
    if (timeElapsed < 0.5) {
      return
    }

    const minutes = timeElapsed / 60
    
    // 실제 키스트로크 수 사용 (한글 자모 포함)
    const keystrokesCount = keystrokes.length
    const mistakeCount = mistakes.length
    const correctKeystrokes = keystrokes.filter(k => k.correct).length
    
    // 개선된 CPM 계산: Raw CPM을 기본으로 하고 정확도로 보정
    const rawCpm = minutes > 0 ? Math.round(keystrokesCount / minutes) : 0
    const accuracyRate = keystrokesCount > 0 ? correctKeystrokes / keystrokesCount : 1
    
    // CPM: Raw CPM을 더 관대하게 계산 (300타 이상 가능하게)
    const cpm = Math.round(rawCpm * Math.max(0.85, accuracyRate)) // 최소 85%는 유지
    
    // WPM 계산: 실제 완성된 문자 수 기준
    const rawWpm = minutes > 0 ? Math.round(currentIndex / 5 / minutes) : 0
    const wpm = Math.round(rawWpm * Math.max(0.85, accuracyRate))
    
    // 정확도 계산 (키스트로크 기준)
    const accuracy = keystrokesCount > 0 ? 
      Math.round((correctKeystrokes / keystrokesCount) * 100) : 100

    // 일관성 계산 (키스트로크 기준)
    const mistakeRate = keystrokesCount > 0 ? mistakeCount / keystrokesCount : 0
    const consistency = Math.round(100 - (mistakeRate * 60)) // 실수 영향 완화

    console.log(`🚀 개선된 통계 (${textType}):`, {
      timeElapsed: timeElapsed.toFixed(2),
      charactersCompleted: currentIndex,
      keystrokesCount,
      correctKeystrokes,
      mistakes: mistakeCount,
      rawCpm, cpm, rawWpm, wpm,
      accuracyRate: (accuracyRate * 100).toFixed(1) + '%',
      accuracy,
      consistency
    })

    set({
      liveStats: {
        wpm: Math.max(0, wpm),
        rawWpm: Math.max(0, rawWpm),
        cpm: Math.max(0, cpm),
        rawCpm: Math.max(0, rawCpm),
        accuracy: Math.max(0, Math.min(100, accuracy)),
        consistency: Math.max(0, Math.min(100, consistency)),
        timeElapsed,
        charactersTyped: keystrokesCount,
        errorsCount: mistakeCount
      }
    })
  },

  resetStats: () => {
    set({ liveStats: initialStats })
  },

  // WPM 계산 (개선된 방식)
  calculateWPM: (keystrokes, timeElapsed, textType = 'words') => {
    if (timeElapsed === 0 || keystrokes.length === 0) return 0
    
    const totalCharacters = keystrokes.length
    const correctCharacters = keystrokes.filter(k => k.correct).length
    const minutes = timeElapsed / 60
    
    if (minutes <= 0) return 0
    
    // Raw WPM 계산
    const rawWpm = Math.round(totalCharacters / 5 / minutes)
    const accuracyRate = correctCharacters / totalCharacters
    
    // 정확도 보정을 통한 최종 WPM (최소 85% 보장)
    return Math.round(rawWpm * Math.max(0.85, accuracyRate))
  },

  // Raw WPM 계산 (오타 포함)
  calculateRawWPM: (keystrokes, timeElapsed) => {
    if (timeElapsed === 0) return 0
    
    const totalCharacters = keystrokes.length
    const minutes = timeElapsed / 60
    
    return minutes > 0 ? Math.round(totalCharacters / 5 / minutes) : 0
  },

  // CPM 계산 (개선된 방식)
  calculateCPM: (keystrokes, timeElapsed) => {
    if (timeElapsed === 0 || keystrokes.length === 0) return 0
    
    const totalCharacters = keystrokes.length
    const correctCharacters = keystrokes.filter(k => k.correct).length
    const minutes = timeElapsed / 60
    
    if (minutes <= 0) return 0
    
    // Raw CPM 계산
    const rawCpm = Math.round(totalCharacters / minutes)
    const accuracyRate = correctCharacters / totalCharacters
    
    // 정확도 보정을 통한 최종 CPM (최소 85% 보장)
    return Math.round(rawCpm * Math.max(0.85, accuracyRate))
  },

  // 정확도 계산
  calculateAccuracy: (keystrokes) => {
    if (keystrokes.length === 0) return 100
    
    const correctCount = keystrokes.filter(k => k.correct).length
    return Math.max(0, Math.min(100, Math.round((correctCount / keystrokes.length) * 100)))
  },

  // 일관성 계산
  calculateConsistency: (keystrokes) => {
    if (keystrokes.length < 10) return 100
    
    // 간단한 일관성 계산: 정확한 타이핑의 비율
    const correctCount = keystrokes.filter(k => k.correct).length
    return Math.max(0, Math.min(100, Math.round((correctCount / keystrokes.length) * 100)))
  }
}))