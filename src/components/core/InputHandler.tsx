'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useTypingStore } from '@/stores/typingStore'
import { IMEHandler, isKoreanJamo, getBrowserType, isCompletedKorean } from '@/utils/koreanIME'
import { detectMobile } from '@/utils/mobileDetection'

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

  // Focus management with iOS/iPad specific handling
  const maintainFocus = useCallback(() => {
    if (inputRef.current && !disabled && !isCompleted) {
      // 모바일 환경: 더 강력한 포커스 처리
      const mobileDetection = detectMobile()
      const isMobile = mobileDetection?.isMobile ?? false
      const isIOS = mobileDetection?.isIOS ?? false
      const isAndroid = mobileDetection?.isAndroid ?? false
      
      if (isMobile) {
        // 모바일에서는 사용자 제스처 후에만 가상키보드가 활성화됨
        const input = inputRef.current
        
        // 1단계: readonly 제거 및 기본 속성 설정
        input.removeAttribute('readonly')
        input.setAttribute('inputmode', 'text')
        input.setAttribute('autocomplete', 'off')
        input.setAttribute('autocorrect', 'off')
        input.setAttribute('spellcheck', 'false')
        
        // 안드로이드에서 타입 명시적 설정
        if (isAndroid) {
          input.setAttribute('type', 'text')
        }
        
        // 2단계: 즉시 포커스
        input.focus()
        
        // 3단계: 모바일 Safari/Chrome 특화 키보드 활성화 시퀀스
        setTimeout(() => {
          if (input && document.activeElement === input) {
            // 가상 클릭으로 키보드 강제 활성화 시도
            if (typeof TouchEvent !== 'undefined') {
              const touchEvent = new TouchEvent('touchstart', { bubbles: true, cancelable: true })
              input.dispatchEvent(touchEvent)
            }
            input.click()
            input.focus()
          }
        }, 100)
        
        // 4단계: 최종 검증 및 재시도
        setTimeout(() => {
          if (input && document.activeElement !== input) {
            console.log('⚠️ Mobile keyboard activation failed, retrying...')
            input.focus()
            input.click()
          }
        }, 300)
        
        console.log('📱 Mobile Enhanced keyboard activation sequence', { isIOS, isAndroid })
      } else {
        inputRef.current.focus()
        console.log('🎯 Focus maintained')
      }
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
  }, [testStarted, isActive, onTestStart])

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

    // 모바일에서는 자동 시작 비활성화
    const mobileDetection = detectMobile()
    const isMobile = mobileDetection?.isMobile ?? false
    
    // 데스크톱에서만 자동 시작
    if (!testStarted && !isCountingDown && !isActive && !isMobile) {
      console.log('🚀 Auto-starting test (desktop only)')
      handleTestStart()
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
  }, [testStarted, onKeyPress, isActive, isCountingDown, handleTestStart])

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
  }, [disabled, isCompleted, processCharacter])

  // Handle keyboard events (전역 이벤트 처리 제외 문자만)
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || isCompleted) return

    const key = event.key
    
    // ESC 키: 일시정지/중단 (직접 처리)
    if (key === 'Escape') {
      event.preventDefault();
      console.log('🔥 ESC key detected in handleKeyDown');
      const currentState = useTypingStore.getState()
      console.log('🔍 Current state:', {
        isActive: currentState.isActive,
        isPaused: currentState.isPaused,
        isCountingDown: currentState.isCountingDown
      });
      
      if (currentState.isActive && !currentState.isPaused) {
        // 첫 번째 ESC: 일시정지
        console.log('⏸️ ESC pressed - pausing test');
        if (onPause) {
          console.log('✅ Calling onPause');
          onPause();
        } else {
          console.log('❌ onPause is not available');
        }
      } else if (currentState.isPaused) {
        // 두 번째 ESC: 중단
        console.log('⏹️ ESC pressed - stopping test');
        if (onRestart) {
          console.log('✅ Calling onRestart');
          onRestart();
        } else {
          console.log('❌ onRestart is not available');
        }
      } else if (currentState.isCountingDown) {
        // 카운트다운 중: 즉시 중단
        console.log('⏹️ ESC pressed during countdown - stopping test');
        if (onRestart) {
          console.log('✅ Calling onRestart during countdown');
          onRestart();
        } else {
          console.log('❌ onRestart is not available during countdown');
        }
      } else {
        console.log('⚠️ ESC pressed but no matching state');
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

    // Backspace 처리 - 활성화된 타이핑 중에도 가능
    if (key === 'Backspace') {
      event.preventDefault()
      console.log(`🔙 Backspace pressed - isPaused: ${isPaused}, isActive: ${isActive}, isCountingDown: ${isCountingDown}`)
      
      // 일시정지 상태에서는 재개
      if (isPaused && onResume) {
        console.log('▶️ Resuming from pause via backspace')
        onResume()
        return
      }
      
      // 활성화된 상태에서만 백스페이스 처리
      if (isActive && !isCountingDown) {
        console.log('✅ Calling onBackspace()')
        onBackspace()
      } else {
        console.log(`❌ Backspace blocked - isActive: ${isActive}, isCountingDown: ${isCountingDown}`)
      }
      
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    
    // Enter, Tab 처리
    if (key === 'Enter' || key === 'Tab') {
      event.preventDefault()
      
      // 모바일 환경 감지
      const mobileDetection = detectMobile()
      const isMobile = mobileDetection?.isMobile ?? false
      
      // 데스크톱에서만 자동 시작
      if (!testStarted && !isCountingDown && !isActive && !isMobile) {
        handleTestStart()
      }
      
      if (isActive && !isCountingDown) {
        processCharacter(key === 'Enter' ? '\n' : '\t')
      }
      return
    }
    
    // 스페이스 처리  
    if (key === ' ') {
      event.preventDefault()
      
      // 모바일 환경 감지
      const mobileDetection = detectMobile()
      const isMobile = mobileDetection?.isMobile ?? false
      
      // 데스크톱에서만 자동 시작
      if (!testStarted && !isCountingDown && !isActive && !isMobile) {
        handleTestStart()
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
        
        // 모바일 환경 감지
        const mobileDetection = detectMobile()
        const isMobile = mobileDetection?.isMobile ?? false
        
        // 데스크톱에서만 자동 시작
        if (!testStarted && !isCountingDown && !isActive && !isMobile) {
          handleTestStart()
        }
        
        if (isActive && !isCountingDown) {
          processCharacter(key)
        }
      }
    }
  }, [disabled, isCompleted, testStarted, isCountingDown, isActive, isPaused, onBackspace, onResume, onPause, onRestart, handleTestStart, processCharacter])

  // Composition event handlers (for IME)
  const handleCompositionStart = useCallback((event: React.CompositionEvent) => {
    try {
      console.log('🎭 Composition started:', event.data)
      imeHandler.current.startComposition()
      setCompositionState(true, event.data || '')
      onCompositionChange?.(true)
      
      // Hide start hint when user starts typing
      if (showStartHint) {
        setShowStartHint(false)
      }
    } catch (error) {
      console.error('❌ Error in handleCompositionStart:', error)
    }
  }, [onCompositionChange, showStartHint, setCompositionState])

  const handleCompositionUpdate = useCallback((event: React.CompositionEvent) => {
    try {
      console.log('🎭 Composition update:', event.data)
      imeHandler.current.updateComposition(event.data || '')
      setCompositionState(true, event.data || '')
    } catch (error) {
      console.error('❌ Error in handleCompositionUpdate:', error)
    }
  }, [setCompositionState])

  const handleCompositionEnd = useCallback((event: React.CompositionEvent) => {
    try {
      console.log('🎭 Composition ended:', event.data)
      
      const composedText = event.data || ''
      const newChars = imeHandler.current.endComposition(composedText)
      setCompositionState(false, '')
      onCompositionChange?.(false)
      
      // 모바일 환경 감지
      const mobileDetection = detectMobile()
      const isMobile = mobileDetection?.isMobile ?? false
      
      // 데스크톱에서만 자동 시작
      if (!testStarted && newChars.length > 0 && !isMobile) {
        console.log('🚀 Auto-starting test from IME (desktop only)')
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
    } catch (error) {
      console.error('❌ Error in handleCompositionEnd:', error)
    }
  }, [testStarted, onCompositionChange])

  // Handle click to focus and start test (모바일 최적화)
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
    
    // 모바일 환경 감지
    const mobileDetection = detectMobile()
    const isMobile = mobileDetection?.isMobile ?? false
    
    if (isMobile && !testStarted && !isActive) {
      // 모바일에서는 첫 클릭은 포커스만, 명시적 시작 대기
      console.log('📱 Mobile: Focus only, waiting for explicit start')
      maintainFocus()
      if (showStartHint) {
        setShowStartHint(false)
      }
      return
    }
    
    maintainFocus()
    
    // 데스크톱에서는 클릭으로 시작 가능
    if (!testStarted && !isActive && !isMobile) {
      console.log('🚀 Starting test from click (desktop)')
      handleTestStart()
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

  // Initial focus and maintain focus + Global ESC handler (모바일 최적화)
  useEffect(() => {
    const timer = setTimeout(() => {
      maintainFocus()
      console.log('🎯 Initial focus set')
    }, 100)
    
    // 모바일 환경 감지
    const mobileDetection = detectMobile()
    const isMobile = mobileDetection?.isMobile ?? false
    
    // 페이지 클릭 시에도 포커스 유지 (모바일에서는 빈도 줄임)
    const handlePageClick = () => {
      try {
        if (!disabled && !isCompleted) {
          const delay = isMobile ? 50 : 10; // 모바일에서는 더 긴 지연
          setTimeout(() => maintainFocus(), delay)
        }
      } catch (error) {
        console.error('❌ Error in handlePageClick:', error)
      }
    }
    
    // 더 강력한 전역 ESC 키 처리 (모든 키보드에서 동작)
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // ESC 키만 로깅 (다른 키는 무시)
      if (event.key === 'Escape') {
        console.log('🎹 ESC key pressed:', event.key);
      }
      
      try {
        // ESC 키 체크 (event.key만 사용)
        if (event.key === 'Escape') {
          console.log('🔥 GLOBAL ESC DETECTED!');
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          
          const currentState = useTypingStore.getState()
          console.log('🔍 Global ESC state check:', {
            isActive: currentState.isActive,
            isPaused: currentState.isPaused,
            isCountingDown: currentState.isCountingDown,
            target: (event.target as HTMLElement)?.tagName || 'unknown'
          });
          
          if (currentState.isActive && !currentState.isPaused) {
            // 첫 번째 ESC: 일시정지
            console.log('⏸️ Global ESC - pausing test')
            if (onPause) {
              console.log('✅ Global calling onPause');
              onPause()
            } else {
              console.log('❌ Global onPause not available');
            }
          } else if (currentState.isPaused) {
            // 두 번째 ESC: 중단
            console.log('⏹️ Global ESC - stopping test')
            if (onRestart) {
              console.log('✅ Global calling onRestart');
              onRestart()
            } else {
              console.log('❌ Global onRestart not available');
            }
          } else if (currentState.isCountingDown) {
            // 카운트다운 중: 즉시 중단
            console.log('⏹️ Global ESC during countdown - stopping test')
            if (onRestart) {
              console.log('✅ Global calling onRestart during countdown');
              onRestart()
            } else {
              console.log('❌ Global onRestart not available during countdown');
            }
          } else {
            console.log('⚠️ Global ESC but no matching state');
          }
        }
      } catch (error) {
        console.error('❌ Error in handleGlobalKeyDown:', error)
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
  }, [])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 브라우저 타입 감지는 한번만 수행

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

