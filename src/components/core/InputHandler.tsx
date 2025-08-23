'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useTypingStore } from '@/stores/typingStore'
import { IMEHandler, isKoreanJamo, getBrowserType, isCompletedKorean } from '@/utils/koreanIME'

interface InputHandlerProps {
  onKeyPress: (key: string) => void
  onBackspace: () => void
  onTestStart: () => void
  onResume?: () => void
  onPause?: () => void
  onRestart?: () => void
  onCompositionChange?: (isComposing: boolean) => void
  disabled?: boolean
  className?: string
}

export function InputHandler({
  onKeyPress,
  onBackspace,
  onTestStart,
  onResume,
  onPause,
  onRestart,
  onCompositionChange,
  disabled = false,
  className = ''
}: InputHandlerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const imeHandler = useRef(new IMEHandler())
  const processedInputRef = useRef<Set<string>>(new Set())
  const browserType = useRef(getBrowserType())
  
  // State for test start
  const [testStarted, setTestStarted] = useState(false)
  const [showStartHint, setShowStartHint] = useState(true)
  
  const { isCompleted, isActive, isCountingDown, isPaused, setCompositionState } = useTypingStore()

  // Focus management
  const maintainFocus = useCallback(() => {
    if (inputRef.current && !disabled && !isCompleted) {
      inputRef.current.focus()
      console.log('🎯 Focus maintained')
    } else {
      console.log('❌ Cannot maintain focus:', { hasInput: !!inputRef.current, disabled, isCompleted })
    }
  }, [disabled, isCompleted])

  // Auto-start test on first valid input
  const handleTestStart = useCallback(() => {
    if (!testStarted && !isActive) {
      console.log('🚀 Auto-starting test')
      onTestStart()
      setTestStarted(true)
      setShowStartHint(false)
    }
  }, [testStarted, isActive])

  // Process character input (unified handler)
  const processCharacter = useCallback((char: string) => {
    // Skip only incomplete Korean jamo, allow completed Korean characters (가-힣)
    if (isKoreanJamo(char) && !isCompletedKorean(char)) {
      console.log(`🔤 Skipping incomplete Korean jamo: "${char}"`)
      return
    }

    // Check for duplicate processing
    const now = Date.now()
    const charId = `${char}-${Math.floor(now / 100)}` // 100ms window
    if (processedInputRef.current.has(charId)) {
      console.log(`⚠️ Duplicate character detected, skipping: "${char}"`)
      return
    }

    // Auto-start test on first character
    if (!testStarted && !isCountingDown && !isActive) {
      handleTestStart()
      // 첫 글자도 처리할 수 있도록 return 제거
      // 카운트다운이 끝나면 아래 로직에서 처리됨
    }

    // 상태를 다시 한번 확인 (React 동기화 문제 해결)
    const currentStore = useTypingStore.getState()
    const actualIsActive = currentStore.isActive
    const actualIsCountingDown = currentStore.isCountingDown
    
    console.log(`🔍 State check: hook(${isActive},${isCountingDown}) vs store(${actualIsActive},${actualIsCountingDown})`)
    
    // 테스트가 활성화된 상태에만 키 입력 처리 (스토어 직접 확인)
    if (actualIsActive && !actualIsCountingDown) {
      console.log(`✅ Processing character: "${char}" (${char.charCodeAt(0)})`)
      onKeyPress(char)
    } else {
      console.log(`⏸️ Skipping key input - isActive: ${actualIsActive}, isCountingDown: ${actualIsCountingDown}, testStarted: ${testStarted}`)
    }
    
    // Mark as processed (clear after 200ms to prevent memory leak)
    processedInputRef.current.add(charId)
    setTimeout(() => {
      processedInputRef.current.delete(charId)
    }, 200)
  }, [testStarted, onKeyPress])

  // Handle direct input (for non-IME characters)
  const handleInput = useCallback((event: React.FormEvent<HTMLInputElement>) => {
    if (disabled || isCompleted) return
    
    const target = event.target as HTMLInputElement
    const value = target.value
    
    // Skip if IME is composing
    if (imeHandler.current.isComposing()) {
      console.log('🎭 Skipping input during IME composition')
      return
    }
    
    // Process only the last character for direct input
    if (value.length > 0) {
      const lastChar = value[value.length - 1]
      
      // Only process if it's not an incomplete Korean jamo and is a valid character
      if (lastChar && lastChar.charCodeAt(0) >= 32 && !(isKoreanJamo(lastChar) && !isCompletedKorean(lastChar))) {
        processCharacter(lastChar)
      }
      
      // Clear input to prevent accumulation
      target.value = ''
    }
  }, [disabled, isCompleted])

  // Handle keyboard events (전역 이벤트 처리 제외 문자만)
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || isCompleted) return

    const key = event.key
    
    // ESC 키: 일시정지/중단 (직접 처리)
    if (key === 'Escape') {
      event.preventDefault();
      const currentState = useTypingStore.getState()
      
      if (currentState.isActive && !currentState.isPaused) {
        // 첫 번째 ESC: 일시정지
        console.log('⏸️ ESC pressed - pausing test');
        if (onPause) {
          onPause();
        }
      } else if (currentState.isPaused) {
        // 두 번째 ESC: 중단
        console.log('⏹️ ESC pressed - stopping test');
        if (onRestart) {
          onRestart();
        }
      } else if (currentState.isCountingDown) {
        // 카운트다운 중: 즉시 중단
        console.log('⏹️ ESC pressed during countdown - stopping test');
        if (onRestart) {
          onRestart();
        }
      }
      return;
    }
    
    // Shift+Enter: 새로고침 (직접 처리)
    if (event.shiftKey && key === 'Enter') {
      event.preventDefault();
      if (onRestart) {
        onRestart();
      }
      return;
    }

    // Backspace 처리
    if (key === 'Backspace') {
      event.preventDefault()
      onBackspace()
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    
    // Enter, Tab 처리
    if (key === 'Enter' || key === 'Tab') {
      event.preventDefault()
      if (!testStarted && !isCountingDown && !isActive) {
        handleTestStart()
        // 첫 글자도 처리할 수 있도록 return 제거
      }
      if (isActive && !isCountingDown) {
        processCharacter(key === 'Enter' ? '\n' : '\t')
      }
      return
    }
    
    // 스페이스 처리  
    if (key === ' ') {
      event.preventDefault()
      if (!testStarted && !isCountingDown && !isActive) {
        handleTestStart()
        // 첫 글자도 처리할 수 있도록 return 제거
      }
      if (isActive && !isCountingDown && !imeHandler.current.isComposing()) {
        processCharacter(' ')
      }
      return
    }
    
    // ASCII 문자 처리
    if (key.length === 1 && !imeHandler.current.isComposing()) {
      const charCode = key.charCodeAt(0)
      if (charCode < 128 && charCode >= 32) {
        event.preventDefault()
        if (!testStarted && !isCountingDown && !isActive) {
          handleTestStart()
          // 첫 글자도 처리할 수 있도록 return 제거
        }
        if (isActive && !isCountingDown) {
          processCharacter(key)
        }
      }
    }
  }, [disabled, isCompleted, testStarted, isCountingDown, isActive, isPaused, onBackspace, onResume])

  // Composition event handlers (for IME)
  const handleCompositionStart = useCallback((event: React.CompositionEvent) => {
    console.log('🎭 Composition started:', event.data)
    imeHandler.current.startComposition()
    setCompositionState(true, event.data || '')
    onCompositionChange?.(true)
    
    // Hide start hint when user starts typing
    if (showStartHint) {
      setShowStartHint(false)
    }
  }, [onCompositionChange, showStartHint])

  const handleCompositionUpdate = useCallback((event: React.CompositionEvent) => {
    console.log('🎭 Composition update:', event.data)
    imeHandler.current.updateComposition(event.data || '')
    setCompositionState(true, event.data || '')
  }, [])

  const handleCompositionEnd = useCallback((event: React.CompositionEvent) => {
    console.log('🎭 Composition ended:', event.data)
    
    const composedText = event.data || ''
    const newChars = imeHandler.current.endComposition(composedText)
    setCompositionState(false, '')
    onCompositionChange?.(false)
    
    // Auto-start if this is the first input
    if (!testStarted && newChars.length > 0) {
      handleTestStart()
    }
    
    // Process each new character
    for (const char of newChars) {
      processCharacter(char)
    }
    
    // Clear input field
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [testStarted, onCompositionChange])

  // Handle click to focus and start test
  const handleContainerClick = useCallback(() => {
    console.log('🖱️ Container clicked!', { testStarted, isActive, disabled, isCompleted, isPaused })
    if (disabled || isCompleted) {
      console.log('❌ Click blocked by disabled/completed check')
      return
    }
    
    // 일시정지 상태에서 클릭하면 해제
    if (isPaused && onResume) {
      console.log('▶️ Resuming from pause via click')
      onResume()
      return
    }
    
    maintainFocus()
    
    // Start test if not started
    if (!testStarted && !isActive) {
      console.log('🚀 Starting test from click')
      handleTestStart()
    } else {
      console.log('❌ Cannot start test:', { testStarted, isActive })
    }
    
    // Hide hint when clicked
    if (showStartHint) {
      setShowStartHint(false)
    }
  }, [showStartHint, testStarted, isActive, isPaused, handleTestStart, onResume])

  // Reset when test state changes
  useEffect(() => {
    if (disabled || isCompleted) {
      setTestStarted(false)
      setShowStartHint(true)
      imeHandler.current.reset()
      processedInputRef.current.clear()
      
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } else if (!isActive) {
      setTestStarted(false)
      setShowStartHint(true)
    }
  }, [disabled, isCompleted, isActive])

  // Initial focus and maintain focus + Global ESC handler
  useEffect(() => {
    const timer = setTimeout(() => {
      maintainFocus()
      console.log('🎯 Initial focus set')
    }, 100)
    
    // 페이지 클릭 시에도 포커스 유지
    const handlePageClick = () => {
      if (!disabled && !isCompleted) {
        setTimeout(() => maintainFocus(), 10)
      }
    }
    
    // 더 강력한 전역 ESC 키 처리 (모든 키보드에서 동작)
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // ESC 키에 대한 다중 조건 체크
      if (event.key === 'Escape' || event.keyCode === 27 || event.which === 27) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        
        const currentState = useTypingStore.getState()
        console.log('🔥 Global ESC detected from:', (event.target as HTMLElement)?.tagName || 'unknown', 'KeyCode:', event.keyCode)
        
        if (currentState.isActive && !currentState.isPaused) {
          // 첫 번째 ESC: 일시정지
          console.log('⏸️ Global ESC - pausing test')
          if (onPause) {
            onPause()
          }
        } else if (currentState.isPaused) {
          // 두 번째 ESC: 중단
          console.log('⏹️ Global ESC - stopping test')
          if (onRestart) {
            onRestart()
          }
        } else if (currentState.isCountingDown) {
          // 카운트다운 중: 즉시 중단
          console.log('⏹️ Global ESC during countdown - stopping test')
          if (onRestart) {
            onRestart()
          }
        }
      }
    }
    
    // 다중 이벤트 리스너 등록 (최대 호환성)
    document.addEventListener('click', handlePageClick)
    document.addEventListener('keydown', handleGlobalKeyDown, { capture: true })
    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true })
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handlePageClick)
      document.removeEventListener('keydown', handleGlobalKeyDown, { capture: true })
      window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true })
    }
  }, [disabled, isCompleted, onPause, onRestart])

  // Browser-specific adjustments
  useEffect(() => {
    console.log(`🌐 Browser detected: ${browserType.current}`)
    
    // Add browser-specific event listeners if needed
    if (browserType.current === 'firefox') {
      // Firefox-specific handling
      console.log('🦊 Firefox-specific IME handling enabled')
    } else if (browserType.current === 'safari') {
      // Safari-specific handling
      console.log('🧭 Safari-specific IME handling enabled')
    }
  }, [])

  return (
    <div 
      className={`input-handler ${className} relative`} 
      style={{ pointerEvents: 'auto' }}
      onClick={handleContainerClick}
    >
      {/* Hidden input for IME */}
      <input
        ref={inputRef}
        type="text"
        className="absolute inset-0 w-full h-full opacity-0"
        style={{ 
          caretColor: 'transparent',
          outline: 'none',
          fontSize: '1px',
          zIndex: 50,
          cursor: 'text',
          pointerEvents: 'auto'
        }}
        onClick={handleContainerClick}
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
        tabIndex={0}
        aria-label="Typing input field"
      />
      
    </div>
  )
}

