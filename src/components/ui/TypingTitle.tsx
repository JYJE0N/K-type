'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface TypingTitleProps {
  text: string
  className?: string
  typingSpeed?: number
  cursorBlinkSpeed?: number
}

export function TypingTitle({ 
  text, 
  className = '', 
  typingSpeed = 150,
  cursorBlinkSpeed = 1000 
}: TypingTitleProps) {
  const router = useRouter()
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  const handleClick = () => {
    router.push('/')
  }

  // 타이핑 효과
  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, typingSpeed)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, text, typingSpeed])

  // 커서 깜빡임 효과
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev)
    }, cursorBlinkSpeed)

    return () => clearInterval(cursorTimer)
  }, [cursorBlinkSpeed])

  return (
    <button 
      onClick={handleClick}
      className={`typing-title cursor-pointer hover:opacity-90 transition-opacity duration-200 ${className}`}
      title="메인 페이지로 이동"
    >
      <span className="text-4xl font-bold bg-gradient-to-r from-interactive-primary via-interactive-secondary to-interactive-primary bg-clip-text text-transparent leading-tight">
        {displayedText}
      </span>
      <span className={`inline-block w-0.5 bg-interactive-primary ml-1 transition-opacity duration-100 ${
        showCursor ? 'opacity-100' : 'opacity-0'
      }`} style={{ 
        height: '2.25rem', // text-4xl에 맞는 높이 (36px)
        verticalAlign: 'baseline',
        marginBottom: '0.125rem' // 텍스트 베이스라인과 정렬
      }} />
    </button>
  )
}