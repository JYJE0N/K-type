'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useTypingStore } from '@/stores/typingStore'

interface InputHandlerProps {
  onKeyPress: (key: string) => void
  onBackspace: () => void
  onTestStart: () => void
  onCompositionChange?: (isComposing: boolean) => void
  disabled?: boolean
  className?: string
}

export function InputHandler({
  onKeyPress,
  onBackspace,
  onTestStart,
  onCompositionChange,
  disabled = false,
  className = ''
}: InputHandlerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hasStarted = useRef(false)
  const lastProcessedLength = useRef(0)
  const isComposing = useRef(false)
  
  // 완료 상태 및 타겟 텍스트 확인
  const { isCompleted, targetText, currentIndex } = useTypingStore()

  // 입력 포커스 유지
  const maintainFocus = useCallback(() => {
    console.log('🎯 maintainFocus called:', { hasInput: !!inputRef.current, disabled, isCompleted })
    if (inputRef.current && !disabled && !isCompleted) {
      inputRef.current.focus()
      console.log('✅ Input focused')
    } else {
      console.log('❌ Focus not applied:', { hasInput: !!inputRef.current, disabled, isCompleted })
    }
  }, [disabled, isCompleted])

  // Input 이벤트 처리 (영어 입력 지원)
  const handleInput = useCallback((event: React.FormEvent<HTMLInputElement>) => {
    console.log('📝 InputHandler state check:', { disabled, isCompleted, targetTextLength: targetText.length })
    if (disabled || isCompleted) {
      console.log('❌ Input blocked:', { disabled, isCompleted })
      return
    }
    
    const target = event.target as HTMLInputElement
    const value = target.value
    const currentLength = value.length
    
    console.log('📝 Input Event:', { 
      value: value.substring(Math.max(0, value.length - 10)), // 마지막 10자만 표시
      currentLength, 
      lastProcessed: lastProcessedLength.current,
      hasStarted: hasStarted.current,
      isComposing: isComposing.current
    })
    
    // IME 조합 중일 때는 처리하지 않음 (한글 조합 중)
    if (isComposing.current) {
      console.log('🎭 Skipping input during composition')
      return
    }
    
    // 영어나 기타 직접 입력 처리 (IME 사용하지 않는 문자들)
    if (currentLength > lastProcessedLength.current) {
      const newChars = value.slice(lastProcessedLength.current)
      
      console.log('✨ New non-composition characters:', {
        newChars,
        newCharsArray: newChars.split('').map(c => `${c}(${c.charCodeAt(0)})`),
        length: newChars.length
      })
      
      for (const char of newChars) {
        // 유효한 타이핑 문자인지 확인 (제어 문자 제외, 스페이스는 handleKeyDown에서 처리)
        if (char.length === 1 && char.charCodeAt(0) >= 32 && char !== ' ') {
          console.log(`🎯 Processing direct input: "${char}" (${char.charCodeAt(0)})`)
          
          // 첫 번째 유효한 입력 시 테스트 시작
          if (!hasStarted.current) {
            console.log('🚀 Starting test with direct input...')
            onTestStart()
            hasStarted.current = true
          }
          
          onKeyPress(char)
        }
      }
      
      lastProcessedLength.current = currentLength
    }
    
    // input이 너무 길어지면 정리
    if (currentLength > 20) {
      target.value = ''
      lastProcessedLength.current = 0
    }
  }, [disabled, isCompleted, onKeyPress, onTestStart, targetText.length])

  // 키보드 이벤트 핸들러 (백스페이스만)
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('⌨️ KeyDown event received:', { key: event.key, disabled, isCompleted })
    if (disabled || isCompleted) {
      console.log('❌ KeyDown blocked:', { disabled, isCompleted })
      return
    }

    const key = event.key
    
    console.log('🔑 KeyDown Event:', {
      key,
      code: event.code,
      keyCode: event.keyCode,
      which: event.which,
      isComposing: event.nativeEvent.isComposing,
      location: event.location,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey
    })

    // 백스페이스 처리
    if (key === 'Backspace') {
      event.preventDefault()
      console.log('🔙 Backspace pressed')
      onBackspace()
      
      // input 값과 추적 길이 조정
      const target = event.target as HTMLInputElement
      target.value = '' // input 완전히 초기화
      lastProcessedLength.current = 0
      return
    }
    
    // 한글 자모 및 조합 중간 상태 체크
    const isKoreanJamo = (char: string) => {
      const code = char.charCodeAt(0)
      return (
        (code >= 0x3131 && code <= 0x314F) || // 한글 호환 자모
        (code >= 0x1100 && code <= 0x11FF) || // 한글 자모
        (code >= 0x3130 && code <= 0x318F) || // 한글 호환 자모 확장
        (code >= 0xA960 && code <= 0xA97F)    // 한글 확장-A
      )
    }

    // 한글 자모는 키스트로크로 처리하지 않음 (테스트 시작은 Shift+Tab으로만)
    if (isKoreanJamo(key)) {
      console.log('🔤 Ignoring Korean jamo (test starts with Shift+Tab only):', key, `(${key.charCodeAt(0)})`)
      event.preventDefault()
      return
    }

    // 기능 키들과 내비게이션 키들 무시 (하지만 Enter, Tab은 허용)
    const ignoredKeys = [
      'Escape', 'CapsLock', 'Control', 'Alt', 'Meta',
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
      'Home', 'End', 'PageUp', 'PageDown', 'Insert', 'Delete',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'NumLock', 'ScrollLock', 'Pause', 'PrintScreen'
    ]
    
    // Shift 키 단독으로는 무시하지만, Shift + 다른 키 조합은 허용
    if (ignoredKeys.includes(key) || (key === 'Shift' && !event.ctrlKey && !event.altKey && !event.metaKey)) {
      event.preventDefault()
      return
    }

    // Shift+Tab으로 테스트 시작 (실제 문자로 처리하지 않음)
    if (key === 'Tab' && event.shiftKey) {
      event.preventDefault()
      
      if (!hasStarted.current) {
        console.log('🚀 Starting test with Shift+Tab (no character processing)')
        onTestStart()
        hasStarted.current = true
      }
      
      // Shift+Tab은 테스트 시작 신호일 뿐, 실제 문자로 처리하지 않음
      return
    }
    
    // 일반 Enter와 Tab은 테스트가 시작된 후에만 처리
    if (key === 'Enter' || key === 'Tab') {
      if (!hasStarted.current) {
        console.log('❌ Test not started. Use Shift+Tab to start.')
        event.preventDefault()
        return
      }
      
      event.preventDefault()
      
      // 특수 키를 문자로 변환하여 처리
      const specialChar = key === 'Enter' ? '\n' : '\t'
      onKeyPress(specialChar)
      return
    }
    
    // 기타 모든 인쇄 가능한 문자 처리 (테스트가 시작된 후에만)
    if (key.length === 1) {
      if (!hasStarted.current) {
        console.log('❌ Test not started. Use Shift+Tab to start.')
        event.preventDefault()
        return
      }
      
      // IME 조합 중일 때는 keydown에서 처리하지 않음 (composition에서 처리됨)
      if (isComposing.current) {
        console.log('🎭 Skipping keydown during composition:', key)
        event.preventDefault()
        return
      }
      
      event.preventDefault()
      onKeyPress(key)
      return
    }
  }, [disabled, isCompleted, onBackspace, onKeyPress, onTestStart])

  // Composition 이벤트 핸들러들 (IME 분석용)
  const handleCompositionStart = useCallback((event: React.CompositionEvent) => {
    isComposing.current = true
    onCompositionChange?.(true)
    console.log('🎭 CompositionStart:', {
      data: event.data,
      isComposing: isComposing.current
    })
  }, [onCompositionChange])

  const handleCompositionUpdate = useCallback((event: React.CompositionEvent) => {
    console.log('🎭 CompositionUpdate:', {
      data: event.data,
      isComposing: isComposing.current
    })
  }, [])

  const processComposedText = useCallback((composedText: string) => {
    // 완성된 문자들을 하나씩 처리
    for (const char of composedText) {
      const charCode = char.charCodeAt(0)
      
      // 자모 및 조합 중간 상태가 아닌 완성된 문자만 처리 (공백 포함)
      const isKoreanJamo = (
        (charCode >= 0x3131 && charCode <= 0x314F) || // 한글 호환 자모
        (charCode >= 0x1100 && charCode <= 0x11FF) || // 한글 자모
        (charCode >= 0x3130 && charCode <= 0x318F) || // 한글 호환 자모 확장
        (charCode >= 0xA960 && charCode <= 0xA97F)    // 한글 확장-A
      )
      
      if (char.length === 1 && charCode >= 32 && !isKoreanJamo) {
        console.log(`🎯 Processing composed character: "${char}" (${charCode})`)
        onKeyPress(char)
      } else if (isKoreanJamo) {
        console.log(`🔤 Skipping Korean jamo in composition: "${char}" (${charCode})`)
      }
    }
  }, [onKeyPress])

  const handleCompositionEnd = useCallback((event: React.CompositionEvent) => {
    isComposing.current = false
    onCompositionChange?.(false)
    const composedText = event.data
    
    console.log('🎭 CompositionEnd:', {
      data: composedText,
      isComposing: isComposing.current,
      composedChars: composedText?.split('').map(c => `${c}(${c.charCodeAt(0)})`).join(', '),
      targetTextStart: targetText.substring(0, 10),
      currentIndex
    })
    
    // 완성된 문자가 있으면 직접 처리 (테스트가 시작된 경우에만)
    if (composedText && composedText.length > 0) {
      if (!hasStarted.current) {
        console.log('❌ Test not started. Use Shift+Tab to start. Ignoring composition:', composedText)
      } else {
        processComposedText(composedText)
      }
      
      // input 필드 정리
      if (inputRef.current) {
        inputRef.current.value = ''
      }
      lastProcessedLength.current = 0
    }
  }, [targetText, currentIndex, processComposedText, onCompositionChange])

  // disabled 상태 변경 시 시작 상태 리셋
  useEffect(() => {
    console.log('🔄 State changed:', { disabled, isCompleted })
    if (disabled || isCompleted) {
      hasStarted.current = false
      lastProcessedLength.current = 0
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } else {
      // 활성화될 때 포커스 시도
      setTimeout(() => maintainFocus(), 100)
    }
  }, [disabled, isCompleted, maintainFocus])

  // 포커스 유지
  useEffect(() => {
    maintainFocus()
  }, [maintainFocus])

  return (
    <div className={`input-handler ${className} relative cursor-text`} onClick={maintainFocus}>
      {/* 한글 입력을 위한 투명 input */}
      <input
        ref={inputRef}
        type="text"
        className="absolute inset-0 w-full h-full bg-transparent border-none text-transparent"
        style={{ 
          caretColor: 'transparent',
          outline: 'none',
          fontSize: '1px',
          zIndex: 10,
          cursor: 'text'
        }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionUpdate={handleCompositionUpdate}
        onCompositionEnd={handleCompositionEnd}
        disabled={disabled || isCompleted}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        tabIndex={1}
      />
      
      {/* 상태 표시 */}
      {!disabled && !isCompleted && !hasStarted.current && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 bg-background bg-opacity-80 backdrop-blur-sm">
          <div className="text-text-secondary text-sm px-4 py-2 bg-surface rounded-lg border border-text-secondary border-opacity-20">
            <kbd className="bg-typing-accent text-background px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-typing-accent text-background px-2 py-1 rounded text-xs font-mono">Tab</kbd> 으로 시작하세요
          </div>
        </div>
      )}
    </div>
  )
}

// 입력 지연시간 측정을 위한 유틸리티 훅
export function useInputLatency() {
  const lastInputTime = useRef<number>(0)
  const latencyHistory = useRef<number[]>([])

  const measureLatency = useCallback(() => {
    const now = performance.now()
    const latency = now - lastInputTime.current
    
    if (lastInputTime.current > 0 && latency < 1000) {
      latencyHistory.current.push(latency)
      
      if (latencyHistory.current.length > 100) {
        latencyHistory.current.shift()
      }
    }
    
    lastInputTime.current = now
    
    return latency
  }, [])

  const getAverageLatency = useCallback(() => {
    const history = latencyHistory.current
    if (history.length === 0) return 0
    
    return history.reduce((sum, latency) => sum + latency, 0) / history.length
  }, [])

  const resetLatencyHistory = useCallback(() => {
    latencyHistory.current = []
    lastInputTime.current = 0
  }, [])

  return {
    measureLatency,
    getAverageLatency,
    resetLatencyHistory
  }
}