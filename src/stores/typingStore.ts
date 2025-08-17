import { create } from 'zustand'
import { Keystroke, Mistake } from '@/types'

interface TypingStore {
  // 상태
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

  // 액션
  setTargetText: (text: string) => void
  setUserInput: (input: string) => void
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

// 공통 키스트로크 처리 함수
function processKeyStroke(state: TypingStore, key: string, currentChar: string, isCorrect: boolean, currentTime: number) {
  const lastKeystroke = state.keystrokes[state.keystrokes.length - 1]
  const timeDelta = lastKeystroke ? currentTime - lastKeystroke.timestamp : 0

  // 키스트로크 추가
  const keystroke: Keystroke = {
    key,
    timestamp: currentTime,
    correct: isCorrect,
    timeDelta
  }

  // 실수 기록
  if (!isCorrect) {
    const mistake: Mistake = {
      position: state.currentIndex,
      expected: currentChar,
      actual: key,
      timestamp: currentTime
    }
    useTypingStore.setState(state => ({ 
      mistakes: [...state.mistakes, mistake]
    }))
  }

  // 한글 자모 및 조합 중간 상태는 userInput에 추가하지 않음
  const charCode = key.charCodeAt(0)
  const isKoreanJamo = (
    (charCode >= 0x3131 && charCode <= 0x314F) || // 한글 호환 자모
    (charCode >= 0x1100 && charCode <= 0x11FF) || // 한글 자모
    (charCode >= 0x3130 && charCode <= 0x318F) || // 한글 호환 자모 확장
    (charCode >= 0xA960 && charCode <= 0xA97F)    // 한글 확장-A
  )
  
  // 상태 업데이트 (맞든 틀렸든 다음 문자로 진행)
  useTypingStore.setState(state => ({
    keystrokes: [...state.keystrokes, keystroke],
    // currentIndex는 항상 증가 (오타여도 다음 문자로 진행)
    currentIndex: isKoreanJamo ? state.currentIndex : state.currentIndex + 1,
    // userInput은 올바른 경우에만 추가, 틀린 경우 실제 입력된 문자 저장
    userInput: isKoreanJamo ? state.userInput : state.userInput + key
  }))

  // 텍스트 완료 시 즉시 완료 처리
  if (isCorrect && state.currentIndex + 1 >= state.targetText.length) {
    console.log('🏁 마지막 문자 완성으로 테스트 완료')
    setTimeout(() => {
      useTypingStore.getState().completeTest()
    }, 50) // 약간의 지연 후 완료 처리
  }
}

export const useTypingStore = create<TypingStore>((set, get) => ({
  // 초기 상태
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

  // 타겟 텍스트 설정
  setTargetText: (text: string) => set({ 
    targetText: text,
    currentIndex: 0,
    userInput: '',
    keystrokes: [],
    mistakes: []
  }),

  // 사용자 입력 설정
  setUserInput: (input: string) => set({ userInput: input }),

  // 테스트 시작
  startTest: () => set({ 
    isActive: true,
    isPaused: false,
    startTime: new Date(),
    endTime: null
  }),

  // 테스트 일시정지
  pauseTest: () => set({ isPaused: true }),

  // 테스트 재개
  resumeTest: () => set({ isPaused: false }),

  // 테스트 리셋
  resetTest: () => set({
    isActive: false,
    isPaused: false,
    isCompleted: false,
    currentIndex: 0,
    userInput: '',
    startTime: null,
    endTime: null,
    keystrokes: [],
    mistakes: []
  }),

  // 테스트 완료
  completeTest: () => {
    const state = get()
    const endTime = new Date()
    
    // 최종 통계 계산
    if (state.startTime) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useStatsStore } = require('@/stores/statsStore')
      const { calculateStats } = useStatsStore.getState()
      calculateStats(state.keystrokes, state.mistakes, state.startTime, state.currentIndex, endTime)
      console.log('🏁 테스트 완료 - 최종 통계 계산됨')
    }
    
    set({
      isActive: false,
      isPaused: false,
      isCompleted: true,
      endTime
    })
  },

  // 키 입력 처리
  handleKeyPress: (key: string) => {
    const state = get()
    
    // 테스트가 완료되었거나 일시정지된 경우 무시
    if (state.isCompleted || state.isPaused) return

    // 한글 자모 및 조합 중간 상태는 키스트로크로 처리하지 않음
    const charCode = key.charCodeAt(0)
    const isKoreanJamo = (
      (charCode >= 0x3131 && charCode <= 0x314F) || // 한글 호환 자모
      (charCode >= 0x1100 && charCode <= 0x11FF) || // 한글 자모
      (charCode >= 0x3130 && charCode <= 0x318F) || // 한글 호환 자모 확장
      (charCode >= 0xA960 && charCode <= 0xA97F)    // 한글 확장-A
    )
    
    if (isKoreanJamo) {
      console.log('🔤 Ignoring Korean jamo keystroke (waiting for composition):', key, `(${charCode})`)
      return
    }

    // 테스트가 시작되지 않았다면 자동으로 시작
    if (!state.isActive && !state.startTime) {
      console.log('🚀 Auto-starting test with first key press')
      get().startTest()
      // 상태 다시 가져오기
      const updatedState = get()
      const currentTime = Date.now()
      
      // 현재 위치의 예상 문자 계산
      const expectedChar = updatedState.targetText[updatedState.currentIndex]
      const isCorrect = key === expectedChar
      
      console.log('🔤 handleKeyPress called (after auto-start):', { 
        key: `"${key}"`, 
        keyCharCode: key.charCodeAt(0),
        isActive: updatedState.isActive, 
        currentIndex: updatedState.currentIndex, 
        targetText: updatedState.targetText.substring(0, 20) + '...', 
        currentChar: `"${expectedChar}"`,
        currentCharCode: expectedChar ? expectedChar.charCodeAt(0) : 'undefined',
        isCorrect,
        userInputLength: updatedState.userInput.length,
        keyLength: key.length,
        currentCharLength: expectedChar ? expectedChar.length : 0
      })
      
      // 나머지 로직은 업데이트된 상태로 진행
      processKeyStroke(updatedState, key, expectedChar, isCorrect, currentTime)
      return
    }

    const currentTime = Date.now()
    
    // 현재 위치의 예상 문자 계산
    const expectedChar = state.targetText[state.currentIndex]
    const isCorrect = key === expectedChar
    
    console.log('🔍 Current state analysis:', {
      currentIndex: state.currentIndex,
      expectedChar: `"${expectedChar}"`,
      inputKey: `"${key}"`,
      targetPreview: state.targetText.substring(state.currentIndex, state.currentIndex + 10),
      isCorrect
    })
    
    console.log('🔤 handleKeyPress called:', { 
      key: `"${key}"`, 
      keyCharCode: key.charCodeAt(0),
      isActive: state.isActive, 
      currentIndex: state.currentIndex, 
      targetText: state.targetText.substring(0, 20) + '...', 
      currentChar: `"${expectedChar}"`,
      currentCharCode: expectedChar ? expectedChar.charCodeAt(0) : 'undefined',
      isCorrect,
      strictEqual: key === expectedChar,
      keyType: typeof key,
      currentCharType: typeof expectedChar,
      keyLength: key.length,
      currentCharLength: expectedChar ? expectedChar.length : 0
    })
    
    processKeyStroke(state, key, expectedChar, isCorrect, currentTime)
  },

  // 백스페이스 처리 (실수 수정)
  handleBackspace: () => {
    const state = get()
    
    console.log('🔙 handleBackspace called:', {
      currentIndex: state.currentIndex,
      userInputLength: state.userInput.length,
      userInputLast: state.userInput.slice(-5),
      isCompleted: state.isCompleted,
      canBackspace: state.currentIndex > 0 && !state.isCompleted
    })
    
    // userInput에 문자가 있으면 삭제 허용 (currentIndex가 0이어도)
    if ((state.currentIndex <= 0 && state.userInput.length === 0) || state.isCompleted) {
      console.log('❌ Backspace blocked: no input to delete or completed')
      return
    }

    // 현재 시간
    const currentTime = Date.now()
    const lastKeystroke = state.keystrokes[state.keystrokes.length - 1]
    const timeDelta = lastKeystroke ? currentTime - lastKeystroke.timestamp : 0

    // 백스페이스 키스트로크 추가
    const keystroke: Keystroke = {
      key: 'Backspace',
      timestamp: currentTime,
      correct: false, // 백스페이스는 정정이므로 오타로 간주
      timeDelta
    }

    console.log('✅ Processing backspace:', {
      fromIndex: state.currentIndex,
      toIndex: state.currentIndex - 1,
      removingChar: state.userInput.slice(-1)
    })

    set(state => ({
      keystrokes: [...state.keystrokes, keystroke],
      currentIndex: Math.max(0, state.currentIndex - 1),
      // userInput은 현재 인덱스까지의 올바른 문자들
      userInput: state.targetText.substring(0, Math.max(0, state.currentIndex - 1))
    }))
  },

  // 현재 문자 가져오기
  getCurrentChar: () => {
    const { targetText, currentIndex } = get()
    return targetText[currentIndex] || ''
  },

  // 진행률 계산
  getProgress: () => {
    const { currentIndex, targetText } = get()
    return targetText.length > 0 ? (currentIndex / targetText.length) * 100 : 0
  },

  // 현재 문자가 올바른지 확인
  isCurrentCharCorrect: () => {
    const { targetText, userInput, currentIndex } = get()
    if (currentIndex >= userInput.length) return true
    return targetText[currentIndex] === userInput[currentIndex]
  }
}))