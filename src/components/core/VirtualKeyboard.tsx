'use client'

import { useEffect, useState } from 'react'
import { useTypingStore } from '@/stores/typingStore'
import { useSettingsStore } from '@/stores/settingsStore'

interface KeyData {
  key: string
  shift?: string
  width?: number
  finger?: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb'
  hand?: 'left' | 'right'
}

const KEYBOARD_LAYOUTS = {
  qwerty: [
    // Row 1
    [
      { key: '`', shift: '~', finger: 'pinky', hand: 'left' },
      { key: '1', shift: '!', finger: 'pinky', hand: 'left' },
      { key: '2', shift: '@', finger: 'ring', hand: 'left' },
      { key: '3', shift: '#', finger: 'middle', hand: 'left' },
      { key: '4', shift: '$', finger: 'index', hand: 'left' },
      { key: '5', shift: '%', finger: 'index', hand: 'left' },
      { key: '6', shift: '^', finger: 'index', hand: 'right' },
      { key: '7', shift: '&', finger: 'index', hand: 'right' },
      { key: '8', shift: '*', finger: 'middle', hand: 'right' },
      { key: '9', shift: '(', finger: 'ring', hand: 'right' },
      { key: '0', shift: ')', finger: 'pinky', hand: 'right' },
      { key: '-', shift: '_', finger: 'pinky', hand: 'right' },
      { key: '=', shift: '+', finger: 'pinky', hand: 'right' },
      { key: 'Backspace', width: 2, finger: 'pinky', hand: 'right' },
    ],
    // Row 2
    [
      { key: 'Tab', width: 1.5, finger: 'pinky', hand: 'left' },
      { key: 'q', shift: 'Q', finger: 'pinky', hand: 'left' },
      { key: 'w', shift: 'W', finger: 'ring', hand: 'left' },
      { key: 'e', shift: 'E', finger: 'middle', hand: 'left' },
      { key: 'r', shift: 'R', finger: 'index', hand: 'left' },
      { key: 't', shift: 'T', finger: 'index', hand: 'left' },
      { key: 'y', shift: 'Y', finger: 'index', hand: 'right' },
      { key: 'u', shift: 'U', finger: 'index', hand: 'right' },
      { key: 'i', shift: 'I', finger: 'middle', hand: 'right' },
      { key: 'o', shift: 'O', finger: 'ring', hand: 'right' },
      { key: 'p', shift: 'P', finger: 'pinky', hand: 'right' },
      { key: '[', shift: '{', finger: 'pinky', hand: 'right' },
      { key: ']', shift: '}', finger: 'pinky', hand: 'right' },
      { key: '\\', shift: '|', width: 1.5, finger: 'pinky', hand: 'right' },
    ],
    // Row 3
    [
      { key: 'CapsLock', width: 1.75, finger: 'pinky', hand: 'left' },
      { key: 'a', shift: 'A', finger: 'pinky', hand: 'left' },
      { key: 's', shift: 'S', finger: 'ring', hand: 'left' },
      { key: 'd', shift: 'D', finger: 'middle', hand: 'left' },
      { key: 'f', shift: 'F', finger: 'index', hand: 'left' },
      { key: 'g', shift: 'G', finger: 'index', hand: 'left' },
      { key: 'h', shift: 'H', finger: 'index', hand: 'right' },
      { key: 'j', shift: 'J', finger: 'index', hand: 'right' },
      { key: 'k', shift: 'K', finger: 'middle', hand: 'right' },
      { key: 'l', shift: 'L', finger: 'ring', hand: 'right' },
      { key: ';', shift: ':', finger: 'pinky', hand: 'right' },
      { key: "'", shift: '"', finger: 'pinky', hand: 'right' },
      { key: 'Enter', width: 2.25, finger: 'pinky', hand: 'right' },
    ],
    // Row 4
    [
      { key: 'Shift', width: 2.25, finger: 'pinky', hand: 'left' },
      { key: 'z', shift: 'Z', finger: 'pinky', hand: 'left' },
      { key: 'x', shift: 'X', finger: 'ring', hand: 'left' },
      { key: 'c', shift: 'C', finger: 'middle', hand: 'left' },
      { key: 'v', shift: 'V', finger: 'index', hand: 'left' },
      { key: 'b', shift: 'B', finger: 'index', hand: 'left' },
      { key: 'n', shift: 'N', finger: 'index', hand: 'right' },
      { key: 'm', shift: 'M', finger: 'index', hand: 'right' },
      { key: ',', shift: '<', finger: 'middle', hand: 'right' },
      { key: '.', shift: '>', finger: 'ring', hand: 'right' },
      { key: '/', shift: '?', finger: 'pinky', hand: 'right' },
      { key: 'Shift', width: 2.75, finger: 'pinky', hand: 'right' },
    ],
    // Row 5
    [
      { key: 'Ctrl', width: 1.25, finger: 'pinky', hand: 'left' },
      { key: 'Win', width: 1.25, finger: 'pinky', hand: 'left' },
      { key: 'Alt', width: 1.25, finger: 'thumb', hand: 'left' },
      { key: ' ', width: 6.25, finger: 'thumb', hand: 'left' },
      { key: 'Alt', width: 1.25, finger: 'thumb', hand: 'right' },
      { key: 'Win', width: 1.25, finger: 'pinky', hand: 'right' },
      { key: 'Menu', width: 1.25, finger: 'pinky', hand: 'right' },
      { key: 'Ctrl', width: 1.25, finger: 'pinky', hand: 'right' },
    ],
  ],
  korean: [
    // Row 1
    [
      { key: '`', shift: '~', finger: 'pinky', hand: 'left' },
      { key: '1', shift: '!', finger: 'pinky', hand: 'left' },
      { key: '2', shift: '@', finger: 'ring', hand: 'left' },
      { key: '3', shift: '#', finger: 'middle', hand: 'left' },
      { key: '4', shift: '$', finger: 'index', hand: 'left' },
      { key: '5', shift: '%', finger: 'index', hand: 'left' },
      { key: '6', shift: '^', finger: 'index', hand: 'right' },
      { key: '7', shift: '&', finger: 'index', hand: 'right' },
      { key: '8', shift: '*', finger: 'middle', hand: 'right' },
      { key: '9', shift: '(', finger: 'ring', hand: 'right' },
      { key: '0', shift: ')', finger: 'pinky', hand: 'right' },
      { key: '-', shift: '_', finger: 'pinky', hand: 'right' },
      { key: '=', shift: '+', finger: 'pinky', hand: 'right' },
      { key: 'Backspace', width: 2, finger: 'pinky', hand: 'right' },
    ],
    // Row 2
    [
      { key: 'Tab', width: 1.5, finger: 'pinky', hand: 'left' },
      { key: 'ㅂ', shift: 'ㅃ', finger: 'pinky', hand: 'left' },
      { key: 'ㅈ', shift: 'ㅉ', finger: 'ring', hand: 'left' },
      { key: 'ㄷ', shift: 'ㄸ', finger: 'middle', hand: 'left' },
      { key: 'ㄱ', shift: 'ㄲ', finger: 'index', hand: 'left' },
      { key: 'ㅅ', shift: 'ㅆ', finger: 'index', hand: 'left' },
      { key: 'ㅛ', shift: 'ㅛ', finger: 'index', hand: 'right' },
      { key: 'ㅕ', shift: 'ㅕ', finger: 'index', hand: 'right' },
      { key: 'ㅑ', shift: 'ㅑ', finger: 'middle', hand: 'right' },
      { key: 'ㅐ', shift: 'ㅒ', finger: 'ring', hand: 'right' },
      { key: 'ㅔ', shift: 'ㅖ', finger: 'pinky', hand: 'right' },
      { key: '[', shift: '{', finger: 'pinky', hand: 'right' },
      { key: ']', shift: '}', finger: 'pinky', hand: 'right' },
      { key: '\\', shift: '|', width: 1.5, finger: 'pinky', hand: 'right' },
    ],
    // Row 3
    [
      { key: 'CapsLock', width: 1.75, finger: 'pinky', hand: 'left' },
      { key: 'ㅁ', shift: 'ㅁ', finger: 'pinky', hand: 'left' },
      { key: 'ㄴ', shift: 'ㄴ', finger: 'ring', hand: 'left' },
      { key: 'ㅇ', shift: 'ㅇ', finger: 'middle', hand: 'left' },
      { key: 'ㄹ', shift: 'ㄹ', finger: 'index', hand: 'left' },
      { key: 'ㅎ', shift: 'ㅎ', finger: 'index', hand: 'left' },
      { key: 'ㅗ', shift: 'ㅗ', finger: 'index', hand: 'right' },
      { key: 'ㅓ', shift: 'ㅓ', finger: 'index', hand: 'right' },
      { key: 'ㅏ', shift: 'ㅏ', finger: 'middle', hand: 'right' },
      { key: 'ㅣ', shift: 'ㅣ', finger: 'ring', hand: 'right' },
      { key: ';', shift: ':', finger: 'pinky', hand: 'right' },
      { key: "'", shift: '"', finger: 'pinky', hand: 'right' },
      { key: 'Enter', width: 2.25, finger: 'pinky', hand: 'right' },
    ],
    // Row 4
    [
      { key: 'Shift', width: 2.25, finger: 'pinky', hand: 'left' },
      { key: 'ㅋ', shift: 'ㅋ', finger: 'pinky', hand: 'left' },
      { key: 'ㅌ', shift: 'ㅌ', finger: 'ring', hand: 'left' },
      { key: 'ㅊ', shift: 'ㅊ', finger: 'middle', hand: 'left' },
      { key: 'ㅍ', shift: 'ㅍ', finger: 'index', hand: 'left' },
      { key: 'ㅠ', shift: 'ㅠ', finger: 'index', hand: 'left' },
      { key: 'ㅜ', shift: 'ㅜ', finger: 'index', hand: 'right' },
      { key: 'ㅡ', shift: 'ㅡ', finger: 'index', hand: 'right' },
      { key: ',', shift: '<', finger: 'middle', hand: 'right' },
      { key: '.', shift: '>', finger: 'ring', hand: 'right' },
      { key: '/', shift: '?', finger: 'pinky', hand: 'right' },
      { key: 'Shift', width: 2.75, finger: 'pinky', hand: 'right' },
    ],
    // Row 5
    [
      { key: 'Ctrl', width: 1.25, finger: 'pinky', hand: 'left' },
      { key: 'Win', width: 1.25, finger: 'pinky', hand: 'left' },
      { key: 'Alt', width: 1.25, finger: 'thumb', hand: 'left' },
      { key: ' ', width: 6.25, finger: 'thumb', hand: 'left' },
      { key: 'Alt', width: 1.25, finger: 'thumb', hand: 'right' },
      { key: '한/영', width: 1.25, finger: 'pinky', hand: 'right' },
      { key: 'Menu', width: 1.25, finger: 'pinky', hand: 'right' },
      { key: 'Ctrl', width: 1.25, finger: 'pinky', hand: 'right' },
    ],
  ],
}

const FINGER_COLORS = {
  pinky: 'bg-red-500',
  ring: 'bg-orange-500',
  middle: 'bg-yellow-500',
  index: 'bg-green-500',
  thumb: 'bg-blue-500',
}

interface VirtualKeyboardProps {
  nextChar?: string
  showFingerHints?: boolean
  className?: string
}

export function VirtualKeyboard({ 
  nextChar, 
  showFingerHints = true,
  className = '' 
}: VirtualKeyboardProps) {
  const { language } = useSettingsStore()
  const { getCurrentChar, isActive } = useTypingStore()
  const [highlightKey, setHighlightKey] = useState<string>('')
  const [isShiftNeeded, setIsShiftNeeded] = useState(false)

  const currentChar = nextChar || getCurrentChar()
  const layout = language === 'korean' ? KEYBOARD_LAYOUTS.korean : KEYBOARD_LAYOUTS.qwerty

  useEffect(() => {
    if (!currentChar || !isActive) {
      setHighlightKey('')
      setIsShiftNeeded(false)
      return
    }

    // 특수 문자 처리
    if (currentChar === ' ') {
      setHighlightKey(' ')
      setIsShiftNeeded(false)
      return
    }

    if (currentChar === '\n') {
      setHighlightKey('Enter')
      setIsShiftNeeded(false)
      return
    }

    if (currentChar === '\t') {
      setHighlightKey('Tab')
      setIsShiftNeeded(false)
      return
    }

    // 대문자나 Shift가 필요한 문자 확인
    let foundKey = ''
    let needShift = false

    for (const row of layout) {
      for (const keyData of row) {
        if (keyData.key === currentChar) {
          foundKey = keyData.key
          needShift = false
          break
        }
        if (keyData.shift === currentChar) {
          foundKey = keyData.key
          needShift = true
          break
        }
      }
      if (foundKey) break
    }

    // 한글 처리
    if (!foundKey && language === 'korean') {
      // 한글 자모 매핑
      const koreanMap: { [key: string]: string } = {
        'ㅂ': 'q', 'ㅈ': 'w', 'ㄷ': 'e', 'ㄱ': 'r', 'ㅅ': 't',
        'ㅛ': 'y', 'ㅕ': 'u', 'ㅑ': 'i', 'ㅐ': 'o', 'ㅔ': 'p',
        'ㅁ': 'a', 'ㄴ': 's', 'ㅇ': 'd', 'ㄹ': 'f', 'ㅎ': 'g',
        'ㅗ': 'h', 'ㅓ': 'j', 'ㅏ': 'k', 'ㅣ': 'l',
        'ㅋ': 'z', 'ㅌ': 'x', 'ㅊ': 'c', 'ㅍ': 'v',
        'ㅠ': 'b', 'ㅜ': 'n', 'ㅡ': 'm',
        'ㅃ': 'Q', 'ㅉ': 'W', 'ㄸ': 'E', 'ㄲ': 'R', 'ㅆ': 'T',
        'ㅒ': 'O', 'ㅖ': 'P'
      }

      // 한글 문자를 자모로 분해
      const code = currentChar.charCodeAt(0)
      if (code >= 0xAC00 && code <= 0xD7A3) {
        // 완성형 한글
        const base = code - 0xAC00
        const cho = Math.floor(base / (21 * 28))
        const jung = Math.floor((base % (21 * 28)) / 28)
        const jong = base % 28

        const choList = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
        const jungList = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'
        
        const firstJamo = choList[cho]
        if (koreanMap[firstJamo]) {
          foundKey = firstJamo
          needShift = firstJamo === firstJamo.toUpperCase()
        }
      } else if (koreanMap[currentChar]) {
        // 자모
        foundKey = currentChar
        needShift = currentChar === currentChar.toUpperCase()
      }
    }

    setHighlightKey(foundKey || currentChar)
    setIsShiftNeeded(needShift)
  }, [currentChar, isActive, language, layout])

  const getKeyClass = (keyData: KeyData) => {
    const baseClass = 'relative flex items-center justify-center rounded border transition-all duration-150'
    const sizeClass = keyData.width ? `flex-${Math.floor(keyData.width * 10)}` : 'flex-10'
    
    let colorClass = 'bg-surface border-text-secondary border-opacity-20'
    let textClass = 'text-text-secondary text-xs'

    // 하이라이트 처리
    if (highlightKey && (keyData.key === highlightKey || keyData.shift === highlightKey)) {
      colorClass = 'bg-typing-accent border-typing-accent'
      textClass = 'text-background font-bold'
    } else if (showFingerHints && keyData.finger) {
      // 손가락 힌트 색상 (약하게)
      const fingerColor = FINGER_COLORS[keyData.finger]
      colorClass = `bg-surface border-text-secondary border-opacity-20 hover:${fingerColor} hover:bg-opacity-20`
    }

    // Shift 키 하이라이트
    if (isShiftNeeded && keyData.key === 'Shift') {
      colorClass = 'bg-typing-accent border-typing-accent bg-opacity-50'
      textClass = 'text-background'
    }

    return `${baseClass} ${sizeClass} ${colorClass} ${textClass} h-12`
  }

  const getKeyLabel = (keyData: KeyData) => {
    if (keyData.key === ' ') return '⎵'
    if (keyData.key === 'Backspace') return '⌫'
    if (keyData.key === 'Enter') return '⏎'
    if (keyData.key === 'Tab') return '⇥'
    if (keyData.key === 'CapsLock') return '⇪'
    if (keyData.key === 'Shift') return '⇧'
    if (keyData.key === 'Ctrl') return 'Ctrl'
    if (keyData.key === 'Alt') return 'Alt'
    if (keyData.key === 'Win') return '⊞'
    if (keyData.key === 'Menu') return '☰'
    if (keyData.key === '한/영') return '한/영'
    
    return keyData.key
  }

  if (!isActive) return null

  return (
    <div className={`virtual-keyboard ${className} p-4 bg-surface rounded-lg shadow-lg`}>
      <div className="space-y-2">
        {layout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {row.map((keyData, keyIndex) => (
              <div
                key={`${rowIndex}-${keyIndex}`}
                className={getKeyClass(keyData as KeyData)}
                style={{ flex: keyData.width || 1 }}
              >
                <span className="select-none">
                  {getKeyLabel(keyData as KeyData)}
                </span>
                {keyData.shift && keyData.key.length === 1 && (
                  <span className="absolute top-1 right-1 text-xs opacity-50">
                    {keyData.shift}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {showFingerHints && (
        <div className="mt-4 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-500 rounded"></span>
            <span>새끼</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-orange-500 rounded"></span>
            <span>약지</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-yellow-500 rounded"></span>
            <span>중지</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded"></span>
            <span>검지</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-blue-500 rounded"></span>
            <span>엄지</span>
          </div>
        </div>
      )}
    </div>
  )
}