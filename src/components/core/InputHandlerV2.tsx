'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useTypingStore } from '@/stores/typingStore'
import { IMEHandler, isKoreanJamo, getBrowserType } from '@/utils/koreanIME'

interface InputHandlerV2Props {
  onKeyPress: (key: string) => void
  onBackspace: () => void
  onTestStart: () => void
  onCompositionChange?: (isComposing: boolean) => void
  disabled?: boolean
  className?: string
}

export function InputHandlerV2({
  onKeyPress,
  onBackspace,
  onTestStart,
  onCompositionChange,
  disabled = false,
  className = ''
}: InputHandlerV2Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const imeHandler = useRef(new IMEHandler())
  const processedInputRef = useRef<Set<string>>(new Set())
  const browserType = useRef(getBrowserType())
  
  // State for test start
  const [testStarted, setTestStarted] = useState(false)
  const [showStartHint, setShowStartHint] = useState(true)
  
  const { isCompleted, isActive } = useTypingStore()

  // Focus management
  const maintainFocus = useCallback(() => {
    if (inputRef.current && !disabled && !isCompleted) {
      inputRef.current.focus()
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
    // Skip Korean jamo
    if (isKoreanJamo(char)) {
      console.log(`🔤 Skipping Korean jamo: "${char}"`)
      return
    }

    // Check for duplicate processing
    const charId = `${char}-${Date.now()}`
    if (processedInputRef.current.has(charId)) {
      console.log(`⚠️ Duplicate character detected, skipping: "${char}"`)
      return
    }

    // Auto-start test on first character
    if (!testStarted) {
      handleTestStart()
    }

    // Process the character
    console.log(`✅ Processing character: "${char}" (${char.charCodeAt(0)})`)
    onKeyPress(char)
    
    // Mark as processed (clear after 100ms to prevent memory leak)
    processedInputRef.current.add(charId)
    setTimeout(() => {
      processedInputRef.current.delete(charId)
    }, 100)
  }, [testStarted, handleTestStart, onKeyPress])

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
      
      // Only process if it's not a Korean jamo and is a valid character
      if (lastChar && lastChar.charCodeAt(0) >= 32 && !isKoreanJamo(lastChar)) {
        processCharacter(lastChar)
      }
      
      // Clear input to prevent accumulation
      target.value = ''
    }
  }, [disabled, isCompleted, processCharacter])

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || isCompleted) return

    const key = event.key
    
    // Handle backspace
    if (key === 'Backspace') {
      event.preventDefault()
      console.log('🔙 Backspace pressed')
      onBackspace()
      
      // Clear input field
      if (inputRef.current) {
        inputRef.current.value = ''
      }
      return
    }
    
    // Handle Enter and Tab as special characters
    if (key === 'Enter' || key === 'Tab') {
      event.preventDefault()
      
      // Auto-start if needed
      if (!testStarted) {
        handleTestStart()
      }
      
      // Convert to actual character
      const specialChar = key === 'Enter' ? '\n' : '\t'
      processCharacter(specialChar)
      return
    }
    
    // Handle Space explicitly (more reliable than composition)
    if (key === ' ') {
      event.preventDefault()
      
      // Auto-start if needed
      if (!testStarted) {
        handleTestStart()
      }
      
      processCharacter(' ')
      return
    }
    
    // For other single characters, let composition or input event handle it
    // This prevents double processing
    if (key.length === 1 && !imeHandler.current.isComposing()) {
      // For non-IME languages, we can process immediately
      const charCode = key.charCodeAt(0)
      if (charCode < 128 && charCode >= 32) { // ASCII printable characters
        event.preventDefault()
        
        // Auto-start if needed
        if (!testStarted) {
          handleTestStart()
        }
        
        processCharacter(key)
      }
    }
  }, [disabled, isCompleted, testStarted, handleTestStart, onBackspace, processCharacter])

  // Composition event handlers (for IME)
  const handleCompositionStart = useCallback((event: React.CompositionEvent) => {
    console.log('🎭 Composition started:', event.data)
    imeHandler.current.startComposition()
    onCompositionChange?.(true)
    
    // Hide start hint when user starts typing
    if (showStartHint) {
      setShowStartHint(false)
    }
  }, [onCompositionChange, showStartHint])

  const handleCompositionUpdate = useCallback((event: React.CompositionEvent) => {
    console.log('🎭 Composition update:', event.data)
    imeHandler.current.updateComposition(event.data || '')
  }, [])

  const handleCompositionEnd = useCallback((event: React.CompositionEvent) => {
    console.log('🎭 Composition ended:', event.data)
    
    const composedText = event.data || ''
    const newChars = imeHandler.current.endComposition(composedText)
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
  }, [testStarted, handleTestStart, processCharacter, onCompositionChange])

  // Handle click to focus
  const handleContainerClick = useCallback(() => {
    maintainFocus()
    
    // Hide hint when clicked
    if (showStartHint) {
      setShowStartHint(false)
    }
  }, [maintainFocus, showStartHint])

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

  // Initial focus
  useEffect(() => {
    const timer = setTimeout(() => maintainFocus(), 100)
    return () => clearTimeout(timer)
  }, [maintainFocus])

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
      className={`input-handler-v2 ${className} relative cursor-text`} 
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
        tabIndex={0}
        aria-label="Typing input field"
      />
      
      {/* Start hint overlay */}
      {!disabled && !isCompleted && !testStarted && showStartHint && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 bg-background bg-opacity-60 backdrop-blur-sm transition-opacity duration-300">
          <div className="text-center animate-pulse">
            <p className="text-lg mb-2 text-text-primary">
              클릭하거나 타이핑을 시작하세요
            </p>
            <p className="text-sm text-text-secondary">
              첫 번째 문자를 입력하면 자동으로 시작됩니다
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <kbd className="bg-surface px-2 py-1 rounded text-xs font-mono border border-text-secondary border-opacity-20">
                Space
              </kbd>
              <kbd className="bg-surface px-2 py-1 rounded text-xs font-mono border border-text-secondary border-opacity-20">
                Enter
              </kbd>
              <kbd className="bg-surface px-2 py-1 rounded text-xs font-mono border border-text-secondary border-opacity-20">
                Tab
              </kbd>
              <span className="text-xs text-text-secondary">특수키 지원</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}