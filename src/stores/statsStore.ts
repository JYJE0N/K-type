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

    const correctKeystrokes = keystrokes.filter(k => k.correct).length
    const minutes = timeElapsed / 60

    // 텍스트 타입에 따른 WPM 계산
    let wpm = 0
    if (textType === 'sentences' || textType === 'short-sentences' || textType === 'medium-sentences' || textType === 'long-sentences') {
      // 문장의 경우: 실제 완성된 단어 수 기준
      wpm = minutes > 0 ? Math.round(correctKeystrokes / 5 / minutes) : 0
    } else {
      // 단어의 경우: 표준 5자 = 1단어 기준
      wpm = minutes > 0 ? Math.round(correctKeystrokes / 5 / minutes) : 0
    }

    const rawWpm = minutes > 0 ? Math.round(keystrokes.length / 5 / minutes) : 0
    const cpm = minutes > 0 ? Math.round(correctKeystrokes / minutes) : 0
    const rawCpm = minutes > 0 ? Math.round(keystrokes.length / minutes) : 0
    const accuracy = keystrokes.length > 0 ? Math.round((correctKeystrokes / keystrokes.length) * 100) : 100

    // 일관성 계산 (간소화)
    const consistency = keystrokes.length > 10 ? 
      Math.max(0, 100 - (mistakes.length / keystrokes.length) * 100) : 100

    console.log(`📊 통계 업데이트 (${textType}):`, {
      timeElapsed: timeElapsed.toFixed(2),
      keystrokes: keystrokes.length,
      correct: correctKeystrokes,
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
        accuracy: Math.round(accuracy),
        consistency: Math.round(consistency),
        timeElapsed,
        charactersTyped: keystrokes.length,
        errorsCount: mistakes.length
      }
    })
  },

  resetStats: () => {
    set({ liveStats: initialStats })
  },

  // WPM 계산 (텍스트 타입별)
  calculateWPM: (keystrokes, timeElapsed, textType = 'words') => {
    if (timeElapsed === 0) return 0
    
    const correctKeystrokes = keystrokes.filter(k => k.correct)
    const minutes = timeElapsed / 60
    
    if (textType === 'sentences' || textType === 'short-sentences' || textType === 'medium-sentences' || textType === 'long-sentences') {
      // 문장의 경우: 완성된 단어 수 기준
      return minutes > 0 ? Math.round(correctKeystrokes.length / 5 / minutes) : 0
    } else {
      // 단어의 경우: 표준 5자 = 1단어
      return minutes > 0 ? Math.round(correctKeystrokes.length / 5 / minutes) : 0
    }
  },

  // Raw WPM 계산 (오타 포함)
  calculateRawWPM: (keystrokes, timeElapsed) => {
    if (timeElapsed === 0) return 0
    
    const totalWords = keystrokes.length / 5
    const minutes = timeElapsed / 60
    
    return minutes > 0 ? Math.round(totalWords / minutes) : 0
  },

  // CPM 계산 (오타 제외)
  calculateCPM: (keystrokes, timeElapsed) => {
    if (timeElapsed === 0) return 0
    
    const correctKeystrokes = keystrokes.filter(k => k.correct)
    const minutes = timeElapsed / 60
    
    return minutes > 0 ? Math.round(correctKeystrokes.length / minutes) : 0
  },

  // 정확도 계산
  calculateAccuracy: (keystrokes) => {
    if (keystrokes.length === 0) return 100
    
    const correctCount = keystrokes.filter(k => k.correct).length
    return Math.round((correctCount / keystrokes.length) * 100)
  },

  // 일관성 계산
  calculateConsistency: (keystrokes) => {
    if (keystrokes.length < 10) return 100
    
    // 간단한 일관성 계산: 정확한 타이핑의 비율
    const correctCount = keystrokes.filter(k => k.correct).length
    return Math.round((correctCount / keystrokes.length) * 100)
  }
}))