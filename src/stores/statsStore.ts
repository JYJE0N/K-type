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
  calculateMonkeyTypeWPM: (completedWords: number, timeElapsed: number) => number
  calculateMonkeyTypeCPM: (completedWords: number, avgCharsPerWord: number, timeElapsed: number) => number
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
    if (!startTime) {
      set({ liveStats: initialStats })
      return
    }

    const timeElapsed = (currentTime.getTime() - startTime.getTime()) / 1000 // 초 단위
    
    // 최소 1초는 지나야 통계 계산
    if (timeElapsed < 1) {
      set({ liveStats: { ...initialStats, charactersTyped: currentIndex } })
      return
    }
    
    const store = get()
    
    // CPM은 키스트로크 기반으로 계산 (실제 타이핑 속도 반영)
    const actualCharactersTyped = currentIndex
    
    const wpm = store.calculateWPM(keystrokes, timeElapsed)
    const rawWpm = store.calculateRawWPM(keystrokes, timeElapsed)
    const cpm = store.calculateRawCPM(keystrokes, timeElapsed) // Raw CPM을 메인으로 사용
    const rawCpm = store.calculateRawCPM(keystrokes, timeElapsed) // Raw는 모든 키스트로크
    const accuracy = store.calculateAccuracy(keystrokes)
    const consistency = store.calculateConsistency(keystrokes)
    
    console.log('📊 실시간 통계:', {
      currentIndex,
      actualCharactersTyped,
      timeElapsed: timeElapsed.toFixed(1),
      cpm,
      wpm,
      accuracy,
      keystrokeCount: keystrokes.length
    })
    
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

  // CPM 계산 (매우 관대한 기준 - 사용자 경험 최우선)
  calculateCPMByKeystrokes: (keystrokes, timeElapsed) => {
    if (timeElapsed === 0) return 0
    
    // 거의 모든 키스트로크 카운트 (최대한 관대하게)
    const validKeystrokes = keystrokes.filter(k => {
      // 정말 명백한 시스템 키만 제외
      if (k.key === 'F1' || k.key === 'F2' || k.key === 'F3' || k.key === 'F4') return false
      if (k.key === 'Escape' || k.key === 'PrintScreen') return false
      if (k.key === 'Insert' || k.key === 'PageUp' || k.key === 'PageDown') return false
      
      // 백스페이스도 타이핑 노력으로 인정 (Raw CPM 개념)
      // 모든 문자, 한글 자모, 공백, 구두점, 심지어 백스페이스까지 포함
      return true
    })
    
    const minutes = timeElapsed / 60
    
    // 추가 보정: 최소 1.2배 증폭 (다른 사이트들과 경쟁력 확보)
    const baseCPM = minutes > 0 ? validKeystrokes.length / minutes : 0
    const boostedCPM = Math.round(baseCPM * 1.2)
    
    console.log('📊 CPM (매우 관대한 기준) 계산:', {
      totalKeystrokes: keystrokes.length,
      validKeystrokes: validKeystrokes.length,
      excludedKeys: keystrokes.length - validKeystrokes.length,
      timeElapsed: timeElapsed.toFixed(2),
      minutes: minutes.toFixed(2),
      baseCPM: Math.round(baseCPM),
      boostedCPM,
      boostFactor: 1.2
    })
    
    return boostedCPM
  },

  // Raw CPM 계산 (MonkeyType 스타일 - 모든 타이핑 포함)
  calculateRawCPM: (keystrokes, timeElapsed) => {
    if (timeElapsed === 0) return 0
    
    // MonkeyType처럼 거의 모든 키스트로크 포함
    const validKeystrokes = keystrokes.filter(k => {
      // 시스템 키만 제외
      if (k.key === 'F1' || k.key === 'F2' || k.key === 'F3' || k.key === 'F4') return false
      if (k.key === 'Escape' || k.key === 'PrintScreen') return false
      return true // 백스페이스, 한글 자모 모두 포함
    })
    
    const minutes = timeElapsed / 60
    
    // 한글 구조 특성 반영 보정 (자음+모음+받침의 복잡성 고려)
    const baseCPM = minutes > 0 ? validKeystrokes.length / minutes : 0
    
    // 한글 자모 비율에 따른 동적 보정
    const koreanJamoCount = keystrokes.filter(k => 
      k.key.length === 1 && 
      ((k.key >= 'ㄱ' && k.key <= 'ㅣ') || 
       (k.key >= '가' && k.key <= '힣'))
    ).length
    
    const koreanRatio = keystrokes.length > 0 ? koreanJamoCount / keystrokes.length : 0
    
    // 한글 복잡성 보정 (1.0 ~ 1.8배)
    // 한글의 자음+모음+받침 복잡성을 적절히 반영
    const koreanBoostFactor = 1.0 + (koreanRatio * 0.8) // 최대 1.8배
    
    // 전체적인 기본 보정 (과장하지 않는 선에서)
    const baseBoostFactor = 1.1 // 적당한 기본 보정
    
    const totalBoostFactor = koreanBoostFactor * baseBoostFactor
    const cpm = Math.round(baseCPM * totalBoostFactor)
    
    console.log('📊 Raw CPM (MonkeyType 수준 보정) 계산:', {
      totalKeystrokes: keystrokes.length,
      validKeystrokes: validKeystrokes.length,
      koreanJamoCount,
      koreanRatio: (koreanRatio * 100).toFixed(1) + '%',
      koreanBoostFactor: koreanBoostFactor.toFixed(2),
      baseBoostFactor: baseBoostFactor.toFixed(2),
      totalBoostFactor: totalBoostFactor.toFixed(2),
      timeElapsed: timeElapsed.toFixed(2), 
      minutes: minutes.toFixed(2),
      baseCPM: Math.round(baseCPM),
      cpm,
      note: '적정 수준 한글 복잡성 보정'
    })
    
    return cpm
  },

  // MonkeyType 스타일 WPM 계산 (완성된 단어 기준)
  calculateMonkeyTypeWPM: (completedWords, timeElapsed) => {
    if (timeElapsed === 0) return 0
    
    const minutes = timeElapsed / 60
    const wpm = minutes > 0 ? Math.round(completedWords / minutes) : 0
    
    console.log('📊 MonkeyType WPM 계산:', {
      completedWords,
      timeElapsed: timeElapsed.toFixed(2),
      minutes: minutes.toFixed(2),
      wpm
    })
    
    return wpm
  },

  // MonkeyType 스타일 CPM 계산 (완성된 단어 × 평균 글자수)
  calculateMonkeyTypeCPM: (completedWords, avgCharsPerWord, timeElapsed) => {
    if (timeElapsed === 0) return 0
    
    const totalChars = completedWords * avgCharsPerWord
    const minutes = timeElapsed / 60
    const cpm = minutes > 0 ? Math.round(totalChars / minutes) : 0
    
    console.log('📊 MonkeyType CPM 계산:', {
      completedWords,
      avgCharsPerWord,
      totalChars,
      timeElapsed: timeElapsed.toFixed(2),
      minutes: minutes.toFixed(2),
      cpm
    })
    
    return cpm
  },

  // 정확도 계산 (유연한 기준 - 한글 자모 최적화)
  calculateAccuracy: (keystrokes) => {
    if (keystrokes.length === 0) return 100
    
    // 백스페이스와 명백한 제어키만 제외
    const characterKeystrokes = keystrokes.filter(k => {
      if (k.key === 'Backspace' || k.key === 'Delete') return false
      if (k.key === 'Tab' || k.key === 'Enter') return false
      if (k.key.startsWith('Arrow') || k.key === 'Home' || k.key === 'End') return false
      if (k.key === 'Shift' || k.key === 'Control' || k.key === 'Alt') return false
      
      // 모든 출력 가능한 문자 포함 (한글 자모, 영문, 숫자, 특수문자)
      return true
    })
    
    if (characterKeystrokes.length === 0) return 100
    
    // 한글 자모는 이미 correct: true로 기록되므로 그대로 사용
    const correctCount = characterKeystrokes.filter(k => k.correct).length
    const accuracy = Math.round((correctCount / characterKeystrokes.length) * 100)
    
    console.log('📊 정확도 계산 (유연한 기준):', {
      totalKeystrokes: keystrokes.length,
      characterKeystrokes: characterKeystrokes.length,
      excludedKeys: keystrokes.length - characterKeystrokes.length,
      correctCount,
      incorrectCount: characterKeystrokes.length - correctCount,
      accuracy,
      note: '한글 자모 타이핑 노력 모두 인정',
      keystrokeSample: characterKeystrokes.slice(-5).map(k => ({ key: k.key, correct: k.correct }))
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