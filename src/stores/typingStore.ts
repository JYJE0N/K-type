import { create } from 'zustand'
import { Keystroke, Mistake } from '@/types'
import { isKoreanJamo } from '@/utils/koreanIME'

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

// Utility to check if this is a duplicate input
function isDuplicateInput(state: TypingStore, key: string): boolean {
  const now = Date.now()
  const timeDiff = now - state.lastProcessedTime
  
  // If same character within 50ms, likely a duplicate
  if (state.lastProcessedChar === key && timeDiff < 50) {
    console.log(`⚠️ Duplicate input detected: "${key}" within ${timeDiff}ms`)
    return true
  }
  
  return false
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

  // Set target text
  setTargetText: (text: string) => set({ 
    targetText: text,
    currentIndex: 0,
    userInput: '',
    keystrokes: [],
    mistakes: [],
    lastProcessedChar: null,
    lastProcessedTime: 0
  }),

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
    lastProcessedTime: 0
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

    // Skip Korean jamo
    if (isKoreanJamo(key)) {
      console.log(`🔤 Ignoring Korean jamo: "${key}"`)
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