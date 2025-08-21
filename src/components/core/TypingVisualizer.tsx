'use client'

import { useEffect, useState } from 'react'
import { useTypingStore } from '@/stores/typingStore'

interface TypingVisualizerProps {
  text: string
  currentIndex: number
  className?: string
  windowSize?: number
}

export function TypingVisualizer({ 
  text, 
  currentIndex, 
  className = '',
  windowSize = 5 // 전체 5칸, 중앙(3번째)에 현재 글자
}: TypingVisualizerProps) {
  const [displayChars, setDisplayChars] = useState<string[]>([])
  const [currentPos, setCurrentPos] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [keyPressAnimation, setKeyPressAnimation] = useState(false)
  const [comboCount, setComboCount] = useState(0)
  
  const { isComposing, composingText, userInput } = useTypingStore()
  
  useEffect(() => {
    // 트랜지션 시작
    setIsTransitioning(true)
    
    // 현재 타이핑된 텍스트 + 조합 중인 텍스트를 합쳐서 보여줌
    const typedText = userInput
    const activeText = isComposing ? typedText + composingText : typedText
    
    // 현재 글자가 항상 중앙(세 번째 칸)에 오도록 설계
    const centerPosition = Math.floor(windowSize / 2) // 중앙 인덱스 (2)
    const chars: string[] = new Array(windowSize).fill('')
    
    // 현재 입력 위치 기준으로 배치
    const currentTypingIndex = typedText.length
    
    // 중앙에 현재 글자 배치
    if (isComposing && composingText) {
      // 조합 중인 문자를 중앙에
      chars[centerPosition] = composingText
    } else {
      // 다음에 타이핑할 문자를 중앙에
      chars[centerPosition] = text[currentTypingIndex] || ''
    }
    
    // 중앙 이전 칸들에 이미 타이핑한 문자들 배치
    for (let i = 1; i <= centerPosition; i++) {
      const charIndex = currentTypingIndex - i
      if (charIndex >= 0) {
        chars[centerPosition - i] = typedText[charIndex] || ''
      }
    }
    
    // 중앙 이후 칸들에 다음에 타이핑할 문자들 배치
    for (let i = 1; i < windowSize - centerPosition; i++) {
      const charIndex = currentTypingIndex + i
      if (charIndex < text.length) {
        chars[centerPosition + i] = text[charIndex] || ''
      }
    }
    
    setDisplayChars(chars)
    
    // 현재 위치는 항상 중앙
    setCurrentPos(centerPosition)
    
    // 트랜지션 완료
    setTimeout(() => setIsTransitioning(false), 100)
    
  }, [text, currentIndex, userInput, isComposing, composingText, windowSize])

  // 키 입력시 화려한 애니메이션 트리거
  useEffect(() => {
    if (isComposing || currentIndex > 0) {
      setKeyPressAnimation(true)
      setComboCount(prev => prev + 1)
      
      // 애니메이션 리셋
      setTimeout(() => setKeyPressAnimation(false), 600)
    }
  }, [isComposing, currentIndex])

  // 콤보 카운트 리셋 (2초간 입력 없으면)
  useEffect(() => {
    const timer = setTimeout(() => setComboCount(0), 2000)
    return () => clearTimeout(timer)
  }, [comboCount])

  if (!text || displayChars.length === 0) {
    return null
  }

  return (
    <div className={`typing-visualizer ${className} relative`}>
      {/* 우아한 배경 글로우 */}
      <div className={`absolute inset-0 rounded-3xl transition-all duration-500 ${
        keyPressAnimation && comboCount > 3
          ? 'bg-gradient-to-r from-purple-500/10 via-blue-500/8 to-cyan-500/10' 
          : 'bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01]'
      }`} />
      
      
      <div className="relative flex items-center justify-center gap-4 py-8 px-6">
        {displayChars.map((char, index) => {
          // 중앙(currentPos=2)을 기준으로 상태 결정
          const isComposingChar = isComposing && index === currentPos && composingText
          const isCompletedChar = index < currentPos
          const isCurrentChar = !isComposing && index === currentPos
          const isUpcomingChar = index > currentPos
          
          // 빈 칸 체크
          const isEmpty = !char
          
          // 완료된 문자의 정확성 확인
          const isCorrect = true // TODO: 실제 정확성 데이터 연결
          
          return (
            <div
              key={`${index}-${char}-${currentIndex}-${isComposing}-${Date.now()}`}
              className={`
                relative flex items-center justify-center
                w-16 h-16 rounded-3xl text-2xl font-korean font-medium
                backdrop-blur-xl border transition-all duration-700 ease-out
                ${isComposingChar
                  ? `bg-white/[0.12] text-white shadow-2xl shadow-purple-500/30
                     border-white/30 ring-2 ring-white/20 font-semibold` 
                  : isCompletedChar && char
                    ? isCorrect 
                      ? `bg-blue-500/[0.08] text-blue-100 shadow-lg shadow-blue-500/15
                         border-blue-400/20 font-medium`
                      : `bg-red-500/[0.10] text-red-200 shadow-lg shadow-red-500/20
                         border-red-400/25 font-medium`
                    : isCurrentChar && char
                      ? `bg-cyan-400/[0.06] text-cyan-100 shadow-md shadow-cyan-400/12
                         border-cyan-400/15 ring-1 ring-cyan-300/10 font-medium`
                    : isUpcomingChar && char
                      ? 'bg-white/[0.03] text-gray-300 border-white/8 opacity-50 font-light'
                    : isEmpty
                      ? 'bg-transparent opacity-10 border-transparent'
                      : 'bg-white/[0.02] text-gray-400 border-white/5 opacity-30'
                }
              `}
              style={{
                transform: `
                  translateY(${isComposingChar ? -8 : isCurrentChar ? -4 : isCompletedChar ? -1 : 0}px) 
                  scale(${isComposingChar ? 1.15 : isCurrentChar ? 1.05 : isCompletedChar ? 1.02 : isUpcomingChar ? 0.95 : 0.85})
                `,
                zIndex: isComposingChar ? 30 : isCurrentChar ? 20 : isCompletedChar ? 10 : 5,
                filter: isComposingChar ? 'brightness(1.2) saturate(1.2)' : isCurrentChar ? 'brightness(1.1)' : 'none',
                transition: `all 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                animationDelay: `${Math.abs(index - currentPos) * 60}ms`
              }}
            >
              {/* Character content */}
              <span className="relative z-10 select-none">
                {char === ' ' ? (
                  <span className="opacity-50 text-lg">␣</span>
                ) : (
                  char || ''
                )}
              </span>
              
              {/* 현재 입력 중인 글자에 은은한 에테르 효과 */}
              {isComposingChar && (
                <>
                  {/* 부드러운 온기 */}
                  <div 
                    className="absolute inset-0 rounded-3xl" 
                    style={{ 
                      background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(168, 85, 247, 0.04) 50%, transparent 80%)',
                      animation: 'ethereal-breathe 3s ease-in-out infinite'
                    }}
                  />
                  {/* 은은한 맥동 */}
                  <div 
                    className="absolute inset-0 rounded-3xl" 
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 50%, rgba(168, 85, 247, 0.03) 100%)',
                      animation: 'gentle-pulse 4s ease-in-out infinite'
                    }}
                  />
                  {/* 미세한 루믜연 */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" 
                       style={{ animation: 'subtle-shimmer 6s ease-in-out infinite' }} />
                </>
              )}
              
              {/* 성공적으로 완료된 글자에 아늴한 효과 */}
              {isCompletedChar && char && (
                <>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/[0.06] to-transparent" />
                  {/* 아주 미세한 성공 비지 */}
                  <div 
                    className="absolute inset-0 rounded-3xl" 
                    style={{
                      background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 80%)',
                      animation: 'serene-glow 5s ease-in-out infinite'
                    }}
                  />
                </>
              )}
              
              {/* 현재 글자 (조합 중이 아닌 상태) 효과 */}
              {isCurrentChar && char && (
                <>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400/[0.06] to-transparent" />
                  {/* 다음 글자 예상 빛 */}
                  <div 
                    className="absolute inset-0 rounded-3xl" 
                    style={{
                      background: 'radial-gradient(circle, rgba(34, 211, 238, 0.04) 0%, transparent 70%)',
                      animation: 'whisper-glow 3s ease-in-out infinite'
                    }}
                  />
                </>
              )}
            </div>
          )
        })}
      </div>
      
      {/* 우아한 상태 표시 */}
      <div className="flex justify-center mt-6">
        <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/20">
          
          {/* 상태 텍스트 */}
          <span className="text-sm font-light text-white/70 transition-all duration-500">
            {isComposing ? (
              <span className="text-white/90">
                중앙 조합 <span className="font-mono bg-white/[0.10] px-3 py-1 rounded-full ml-2 text-xs font-medium">{composingText}</span>
                {comboCount > 8 && (
                  <span className="ml-3 px-2 py-1 rounded-full text-xs bg-white/[0.08] text-white/70">
                    COMBO {comboCount}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-white/50">
                시그니처 한글 조합 모드
                {comboCount > 0 && (
                  <span className="ml-3 text-white/40 text-xs">
                    COMBO {comboCount}
                  </span>
                )}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

/* 스타일드 JSX에서 전역 CSS로 이동 */