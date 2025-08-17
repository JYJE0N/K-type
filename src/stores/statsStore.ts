import { create } from 'zustand'
import { LiveStats, Keystroke, Mistake } from '@/types'

interface StatsStore {
  liveStats: LiveStats
  
  // 통계 계산 액션
  calculateStats: (
    keystrokes: Keystroke[],
    mistakes: Mistake[],
    startTime: Date | null,
    currentIndex?: number,
    currentTime?: Date
  ) => void
  
  resetStats: () => void
  
  // 개별 통계 계산 유틸리티
  calculateWPM: (keystrokes: Keystroke[], timeElapsed: number) => number
  calculateRawWPM: (keystrokes: Keystroke[], timeElapsed: number) => number
  calculateCPM: (keystrokes: Keystroke[], timeElapsed: number) => number
  calculateCPMByKeystrokes: (keystrokes: Keystroke[], timeElapsed: number) => number
  calculateRawCPM: (keystrokes: Keystroke[], timeElapsed: number) => number
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
  calculateStats: (keystrokes, mistakes, startTime, currentIndex = 0, currentTime = new Date()) => {
    if (!startTime || keystrokes.length === 0) {
      set({ liveStats: initialStats })
      return
    }

    const timeElapsed = (currentTime.getTime() - startTime.getTime()) / 1000 // 초 단위
    const store = get()
    
    // 실제 타이핑한 문자 수는 currentIndex 사용 (실제 진행된 문자 위치)
    const actualCharactersTyped = currentIndex
    
    const wpm = store.calculateWPM(keystrokes, timeElapsed)
    const rawWpm = store.calculateRawWPM(keystrokes, timeElapsed)
    // CPM은 실제 키스트로크 기준으로 계산 (백스페이스 제외)
    const cpm = store.calculateCPMByKeystrokes(keystrokes, timeElapsed)
    const rawCpm = store.calculateRawCPM(keystrokes, timeElapsed)
    const accuracy = store.calculateAccuracy(keystrokes)
    const consistency = store.calculateConsistency(keystrokes)
    
    const liveStats: LiveStats = {
      wpm,
      rawWpm,
      cpm,
      rawCpm,
      accuracy,
      consistency,
      timeElapsed,
      charactersTyped: actualCharactersTyped, // 실제 진행된 문자 수
      errorsCount: mistakes.length
    }

    set({ liveStats })
  },

  // 통계 리셋
  resetStats: () => set({ liveStats: initialStats }),

  // WPM 계산 (오타 제외)
  calculateWPM: (keystrokes, timeElapsed) => {
    if (timeElapsed === 0) return 0
    
    const correctKeystrokes = keystrokes.filter(k => k.correct)
    const correctWords = correctKeystrokes.length / 5 // 표준: 5문자 = 1단어
    const minutes = timeElapsed / 60
    
    return minutes > 0 ? Math.round(correctWords / minutes) : 0
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
    
    console.log('📊 CPM 계산:', {
      totalKeystrokes: keystrokes.length,
      correctKeystrokes: correctKeystrokes.length,
      timeElapsed: timeElapsed.toFixed(2),
      minutes: minutes.toFixed(2),
      calculatedCPM: minutes > 0 ? Math.round(correctKeystrokes.length / minutes) : 0
    })
    
    return minutes > 0 ? Math.round(correctKeystrokes.length / minutes) : 0
  },

  // CPM 계산 (실제 유효한 키스트로크 기준)
  calculateCPMByKeystrokes: (keystrokes, timeElapsed) => {
    if (timeElapsed === 0) return 0
    
    // 백스페이스 제외한 유효한 키스트로크만 카운트
    const validKeystrokes = keystrokes.filter(k => k.key !== 'Backspace')
    const minutes = timeElapsed / 60
    
    console.log('📊 CPM (키스트로크 기준) 계산:', {
      totalKeystrokes: keystrokes.length,
      validKeystrokes: validKeystrokes.length,
      backspaceCount: keystrokes.length - validKeystrokes.length,
      timeElapsed: timeElapsed.toFixed(2),
      minutes: minutes.toFixed(2),
      calculatedCPM: minutes > 0 ? Math.round(validKeystrokes.length / minutes) : 0
    })
    
    return minutes > 0 ? Math.round(validKeystrokes.length / minutes) : 0
  },

  // Raw CPM 계산 (오타 포함)
  calculateRawCPM: (keystrokes, timeElapsed) => {
    if (timeElapsed === 0) return 0
    
    const minutes = timeElapsed / 60
    
    console.log('📊 Raw CPM 계산:', {
      totalKeystrokes: keystrokes.length,
      timeElapsed: timeElapsed.toFixed(2), 
      minutes: minutes.toFixed(2),
      calculatedRawCPM: minutes > 0 ? Math.round(keystrokes.length / minutes) : 0
    })
    
    return minutes > 0 ? Math.round(keystrokes.length / minutes) : 0
  },

  // 정확도 계산
  calculateAccuracy: (keystrokes) => {
    if (keystrokes.length === 0) return 100
    
    // 백스페이스 및 한글 자모 제외한 실제 문자 입력만 필터링
    const characterKeystrokes = keystrokes.filter(k => {
      if (k.key === 'Backspace') return false
      
      // 한글 자모 및 조합 중간 상태 필터링
      const charCode = k.key.charCodeAt(0)
      const isKoreanJamo = (
        (charCode >= 0x3131 && charCode <= 0x314F) || // 한글 호환 자모
        (charCode >= 0x1100 && charCode <= 0x11FF) || // 한글 자모
        (charCode >= 0x3130 && charCode <= 0x318F) || // 한글 호환 자모 확장
        (charCode >= 0xA960 && charCode <= 0xA97F)    // 한글 확장-A
      )
      
      return !isKoreanJamo
    })
    if (characterKeystrokes.length === 0) return 100
    
    const correctCount = characterKeystrokes.filter(k => k.correct).length
    const accuracy = Math.round((correctCount / characterKeystrokes.length) * 100)
    
    console.log('📊 정확도 계산 상세:', {
      totalKeystrokes: keystrokes.length,
      characterKeystrokes: characterKeystrokes.length,
      backspaceCount: keystrokes.length - characterKeystrokes.length,
      correctCount,
      incorrectCount: characterKeystrokes.length - correctCount,
      accuracy,
      keystrokeSample: characterKeystrokes.slice(-10).map(k => ({ key: k.key, correct: k.correct }))
    })
    
    return accuracy
  },

  // 일관성 계산 (키 입력 간격의 일정성)
  calculateConsistency: (keystrokes) => {
    if (keystrokes.length < 3) return 100

    const intervals = keystrokes
      .slice(1) // 첫 번째 제외 (timeDelta가 0)
      .map(k => k.timeDelta)
      .filter(delta => delta > 0 && delta < 1000) // 1초 이상 간격은 제외

    if (intervals.length < 2) return 100

    // 표준편차 계산
    const mean = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length
    const standardDeviation = Math.sqrt(variance)

    // 일관성 점수 (표준편차가 낮을수록 높은 점수)
    // 50ms 표준편차를 기준으로 100점에서 차감
    const consistencyScore = Math.max(0, 100 - (standardDeviation / 2))
    
    return Math.round(consistencyScore)
  }
}))

// 실시간 업데이트를 위한 훅
export const useStatsUpdater = () => {
  const calculateStats = useStatsStore(state => state.calculateStats)
  
  return (
    keystrokes: Keystroke[],
    mistakes: Mistake[],
    startTime: Date | null,
    currentIndex?: number
  ) => {
    calculateStats(keystrokes, mistakes, startTime, currentIndex)
  }
}