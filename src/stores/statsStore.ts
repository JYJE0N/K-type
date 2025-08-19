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

  // 실시간 통계 계산
  calculateStats: (keystrokes, mistakes, startTime, currentIndex = 0, currentTime = new Date(), textType = 'words') => {
    if (!startTime) {
      set({ liveStats: initialStats })
      return
    }

    const timeElapsed = (currentTime.getTime() - startTime.getTime()) / 1000 // 초 단위
    
    // 최소 1초는 지나야 통계 계산
    if (timeElapsed < 1) {
      return
    }

    const minutes = timeElapsed / 60
    
    // 실제 타이핑한 문자 수 사용 (currentIndex가 실제 진행률)
    const charactersTyped = currentIndex
    const correctCharacters = charactersTyped - mistakes.length
    
    // CPM 계산 (올바르게 타이핑한 문자 수 기준)
    const cpm = minutes > 0 ? Math.round(correctCharacters / minutes) : 0
    const rawCpm = minutes > 0 ? Math.round(charactersTyped / minutes) : 0
    
    // WPM 계산 (5문자 = 1단어 기준)
    const wpm = minutes > 0 ? Math.round(correctCharacters / 5 / minutes) : 0
    const rawWpm = minutes > 0 ? Math.round(charactersTyped / 5 / minutes) : 0
    
    // 정확도 계산
    const accuracy = charactersTyped > 0 ? Math.round((correctCharacters / charactersTyped) * 100) : 100

    // 일관성 계산 (실수 비율 기반)
    const consistency = charactersTyped > 0 ? 
      Math.max(0, 100 - Math.round((mistakes.length / charactersTyped) * 100)) : 100

    console.log(`📊 통계 업데이트 (${textType}):`, {
      timeElapsed: timeElapsed.toFixed(2),
      charactersTyped,
      correctCharacters,
      mistakes: mistakes.length,
      keystrokesCount: keystrokes.length,
      wpm,
      cpm,
      accuracy
    })

    set({
      liveStats: {
        wpm,
        rawWpm,
        cpm,
        rawCpm,
        accuracy: Math.max(0, Math.min(100, accuracy)), // 0-100 범위 보장
        consistency: Math.max(0, Math.min(100, consistency)), // 0-100 범위 보장
        timeElapsed,
        charactersTyped,
        errorsCount: mistakes.length
      }
    })
  },

  resetStats: () => {
    set({ liveStats: initialStats })
  },

  // WPM 계산 (실제 문자 수 기준)
  calculateWPM: (keystrokes, timeElapsed, textType = 'words') => {
    if (timeElapsed === 0) return 0
    
    const correctCharacters = keystrokes.filter(k => k.correct).length
    const minutes = timeElapsed / 60
    
    // 모든 텍스트 타입에 대해 표준 5자 = 1단어 기준 사용
    return minutes > 0 ? Math.round(correctCharacters / 5 / minutes) : 0
  },

  // Raw WPM 계산 (오타 포함)
  calculateRawWPM: (keystrokes, timeElapsed) => {
    if (timeElapsed === 0) return 0
    
    const totalCharacters = keystrokes.length
    const minutes = timeElapsed / 60
    
    return minutes > 0 ? Math.round(totalCharacters / 5 / minutes) : 0
  },

  // CPM 계산 (오타 제외)
  calculateCPM: (keystrokes, timeElapsed) => {
    if (timeElapsed === 0) return 0
    
    const correctCharacters = keystrokes.filter(k => k.correct).length
    const minutes = timeElapsed / 60
    
    return minutes > 0 ? Math.round(correctCharacters / minutes) : 0
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