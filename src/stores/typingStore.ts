import { create } from 'zustand'
import { Keystroke, Mistake } from '@/types'
import { isKoreanJamo } from '@/utils/koreanIME'
import { useStatsStore } from '@/stores/statsStore'

interface TypingStore {
  // State
  isActive: boolean
  isPaused: boolean
  isCompleted: boolean
  currentIndex: number
  targetText: string
  userInput: string
  startTime: Date | null
  endTime: Date | null
  keystrokes: Keystroke[]
  mistakes: Mistake[]
  
  // Tracking for duplicate prevention
  lastProcessedChar: string | null
  lastProcessedTime: number

  // MonkeyType 스타일 단어 추적
  textWords: string[]
  completedWords: number
  currentWordIndex: number

  // Actions
  setTargetText: (text: string) => void
  startTest: () => void
  pauseTest: () => void
  resumeTest: () => void
  resetTest: () => void
  completeTest: () => void
  handleKeyPress: (key: string) => void
  handleBackspace: () => void
  getCurrentChar: () => string
  getProgress: () => number
  isCurrentCharCorrect: () => boolean
}

// Utility to check if this is a duplicate input (더 관대하게 수정)
function isDuplicateInput(state: TypingStore, key: string): boolean {
  const now = Date.now()
  const timeDiff = now - state.lastProcessedTime
  
  // 중복 방지를 매우 관대하게: 5ms 이하 + 동일 문자일 때만  
  if (state.lastProcessedChar === key && timeDiff < 5) {
    console.log(`⚠️ Duplicate input detected: "${key}" within ${timeDiff}ms`)
    return true
  }
  
  return false
}

// Check completed words (MonkeyType style)
function checkCompletedWords(state: TypingStore): number {
  if (state.textWords.length === 0) return 0
  
  let completedWords = 0
  let currentPos = 0
  
  for (const word of state.textWords) {
    const wordEnd = currentPos + word.length
    
    // 현재 단어가 완전히 타이핑되었는지 확인
    if (state.currentIndex >= wordEnd) {
      const typedWord = state.userInput.substring(currentPos, wordEnd)
      if (typedWord === word) {
        completedWords++
      }
    } else {
      break // 아직 완성되지 않은 단어가 나오면 중단
    }
    
    currentPos = wordEnd + 1 // 공백 포함
  }
  
  return completedWords
}

// Process a valid keystroke
function processKeystroke(
  state: TypingStore, 
  key: string, 
  expectedChar: string, 
  isCorrect: boolean
): Partial<TypingStore> {
  const currentTime = Date.now()
  const lastKeystroke = state.keystrokes[state.keystrokes.length - 1]
  const timeDelta = lastKeystroke ? currentTime - lastKeystroke.timestamp : 0

  // Create keystroke record
  const keystroke: Keystroke = {
    key,
    timestamp: currentTime,
    correct: isCorrect,
    timeDelta
  }

  // Create mistake record if incorrect
  const mistakes = isCorrect ? state.mistakes : [
    ...state.mistakes,
    {
      position: state.currentIndex,
      expected: expectedChar,
      actual: key,
      timestamp: currentTime
    }
  ]

  // Update state
  return {
    keystrokes: [...state.keystrokes, keystroke],
    mistakes,
    currentIndex: state.currentIndex + 1,
    userInput: state.userInput + key,
    lastProcessedChar: key,
    lastProcessedTime: currentTime
  }
}

export const useTypingStore = create<TypingStore>((set, get) => ({
  // Initial state
  isActive: false,
  isPaused: false,
  isCompleted: false,
  currentIndex: 0,
  targetText: '',
  userInput: '',
  startTime: null,
  endTime: null,
  keystrokes: [],
  mistakes: [],
  lastProcessedChar: null,
  lastProcessedTime: 0,
  textWords: [],
  completedWords: 0,
  currentWordIndex: 0,

  // Set target text
  setTargetText: (text: string) => {
    // 텍스트를 단어로 분할 (MonkeyType 방식)
    const words = text.split(' ').filter(word => word.trim().length > 0)
    
    set({ 
      targetText: text,
      currentIndex: 0,
      userInput: '',
      keystrokes: [],
      mistakes: [],
      lastProcessedChar: null,
      lastProcessedTime: 0,
      textWords: words,
      completedWords: 0,
      currentWordIndex: 0
    })
    
    console.log('📝 텍스트 설정:', {
      text: text.substring(0, 50) + '...',
      totalWords: words.length,
      words: words.slice(0, 5)
    })
  },

  // Start test
  startTest: () => {
    const state = get()
    if (state.isActive) {
      console.log('⚠️ Test already active, skipping start')
      return
    }
    
    set({ 
      isActive: true,
      isPaused: false,
      startTime: new Date(),
      endTime: null
    })
    
    console.log('✅ Test started')
  },

  // Pause test
  pauseTest: () => set({ isPaused: true }),

  // Resume test
  resumeTest: () => set({ isPaused: false }),

  // Reset test
  resetTest: () => set({
    isActive: false,
    isPaused: false,
    isCompleted: false,
    currentIndex: 0,
    userInput: '',
    startTime: null,
    endTime: null,
    keystrokes: [],
    mistakes: [],
    lastProcessedChar: null,
    lastProcessedTime: 0,
    completedWords: 0,
    currentWordIndex: 0
  }),

  // Complete test
  completeTest: () => {
    const state = get()
    const endTime = new Date()
    
    // Calculate final stats
    if (state.startTime) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useStatsStore } = require('@/stores/statsStore')
      const { calculateStats } = useStatsStore.getState()
      calculateStats(state.keystrokes, state.mistakes, state.startTime, state.currentIndex, endTime)
      console.log('✅ Test completed - Final stats calculated')
    }
    
    set({
      isActive: false,
      isPaused: false,
      isCompleted: true,
      endTime
    })
  },

  // Handle key press
  handleKeyPress: (key: string) => {
    const state = get()
    
    // Check test state
    if (state.isCompleted || state.isPaused) {
      console.log('❌ Input blocked: test completed or paused')
      return
    }

    // 한글 자모는 기록하되, 진행은 하지 않음 (CPM 계산용)
    if (isKoreanJamo(key)) {
      console.log(`🔤 Recording Korean jamo for CPM: "${key}"`)
      const currentTime = Date.now()
      const lastKeystroke = state.keystrokes[state.keystrokes.length - 1]
      const timeDelta = lastKeystroke ? currentTime - lastKeystroke.timestamp : 0
      
      // 한글 자모도 키스트로크로 기록 (타이핑 노력으로 인정)
      const jamoKeystroke: Keystroke = {
        key,
        timestamp: currentTime,
        correct: true, // 한글 조합 과정의 모든 키스트로크를 유효한 타이핑으로 인정
        timeDelta
      }
      
      set({ 
        keystrokes: [...state.keystrokes, jamoKeystroke],
        lastProcessedChar: key,
        lastProcessedTime: currentTime
      })
      
      // 통계 업데이트
      useStatsStore.getState().calculateStats(
        [...state.keystrokes, jamoKeystroke],
        state.mistakes,
        state.startTime,
        state.currentIndex
      )
      return
    }

    // Check for duplicate input
    if (isDuplicateInput(state, key)) {
      return
    }

    // Auto-start test if not active
    if (!state.isActive && !state.startTime) {
      console.log('🚀 Auto-starting test')
      get().startTest()
    }

    // Get expected character
    const expectedChar = state.targetText[state.currentIndex]
    if (!expectedChar) {
      console.log('⚠️ No more characters to type')
      return
    }

    // Check if correct
    const isCorrect = key === expectedChar
    
    console.log('🔤 Processing keystroke:', { 
      key: `"${key}"`,
      expected: `"${expectedChar}"`,
      isCorrect,
      currentIndex: state.currentIndex
    })
    
    // Process the keystroke
    const updates = processKeystroke(state, key, expectedChar, isCorrect)
    set(updates)
    
    // 단어 완성 체크
    const newState = { ...state, ...updates }
    const newCompletedWords = checkCompletedWords(newState)
    
    if (newCompletedWords > state.completedWords) {
      console.log(`🎯 단어 완성! ${state.completedWords} → ${newCompletedWords}`)
      set({ completedWords: newCompletedWords })
      newState.completedWords = newCompletedWords
    }
    
    // MonkeyType 스타일 통계 계산
    const avgCharsPerWord = state.textWords.length > 0 
      ? state.targetText.replace(/\s/g, '').length / state.textWords.length 
      : 4
      
    const monkeyTypeCPM = useStatsStore.getState().calculateMonkeyTypeCPM(
      newState.completedWords,
      avgCharsPerWord,
      (Date.now() - (state.startTime?.getTime() || Date.now())) / 1000
    )
    
    const monkeyTypeWPM = useStatsStore.getState().calculateMonkeyTypeWPM(
      newState.completedWords,
      (Date.now() - (state.startTime?.getTime() || Date.now())) / 1000
    )
    
    // 기존 통계도 유지하면서 MonkeyType 스타일도 같이 계산
    useStatsStore.getState().calculateStats(
      newState.keystrokes, 
      newState.mistakes, 
      newState.startTime, 
      newState.currentIndex
    )
    
    console.log(`📊 MonkeyType vs 기존: CPM ${monkeyTypeCPM} vs ${useStatsStore.getState().liveStats.cpm}, WPM ${monkeyTypeWPM} vs ${useStatsStore.getState().liveStats.wpm}`)
    
    // Check for completion
    const newIndex = updates.currentIndex || state.currentIndex
    if (newIndex >= state.targetText.length) {
      console.log('🏁 Text completed')
      setTimeout(() => get().completeTest(), 50)
    }
  },

  // Handle backspace
  handleBackspace: () => {
    const state = get()
    
    if (state.currentIndex <= 0 || state.isCompleted) {
      console.log('❌ Cannot backspace: at start or completed')
      return
    }

    const currentTime = Date.now()
    const lastKeystroke = state.keystrokes[state.keystrokes.length - 1]
    const timeDelta = lastKeystroke ? currentTime - lastKeystroke.timestamp : 0

    // Create backspace keystroke
    const keystroke: Keystroke = {
      key: 'Backspace',
      timestamp: currentTime,
      correct: false,
      timeDelta
    }

    console.log('🔙 Processing backspace:', {
      fromIndex: state.currentIndex,
      toIndex: state.currentIndex - 1
    })

    set(state => ({
      keystrokes: [...state.keystrokes, keystroke],
      currentIndex: Math.max(0, state.currentIndex - 1),
      userInput: state.userInput.slice(0, -1),
      lastProcessedChar: 'Backspace',
      lastProcessedTime: currentTime
    }))
  },

  // Get current character
  getCurrentChar: () => {
    const { targetText, currentIndex } = get()
    return targetText[currentIndex] || ''
  },

  // Get progress
  getProgress: () => {
    const { currentIndex, targetText } = get()
    return targetText.length > 0 ? (currentIndex / targetText.length) * 100 : 0
  },

  // Check if current character is correct
  isCurrentCharCorrect: () => {
    const { targetText, userInput, currentIndex } = get()
    if (currentIndex >= userInput.length) return true
    return targetText[currentIndex] === userInput[currentIndex]
  }
}))