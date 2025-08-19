/**
 * Korean character decomposition utility for typing visualization
 * Decomposes Hangul characters into constituent jamo (자모)
 */

// 초성 (consonants)
const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
]

// 중성 (vowels)
const JUNGSUNG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
]

// 종성 (final consonants) - empty string for no final consonant
const JONGSUNG = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 
  'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 
  'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
]

/**
 * Check if a character is a complete Hangul syllable
 */
export function isHangulSyllable(char: string): boolean {
  if (char.length !== 1) return false
  const code = char.charCodeAt(0)
  return code >= 0xAC00 && code <= 0xD7A3
}

/**
 * Check if a character is a Hangul jamo
 */
export function isHangulJamo(char: string): boolean {
  if (char.length !== 1) return false
  const code = char.charCodeAt(0)
  return (code >= 0x3131 && code <= 0x314F) || // Compatibility jamo
         (code >= 0x1100 && code <= 0x11FF) || // Jamo (initial consonants)
         (code >= 0xA960 && code <= 0xA97F) || // Extended jamo A
         (code >= 0xD7B0 && code <= 0xD7FF)    // Extended jamo B
}

/**
 * Decompose a complete Hangul character into its constituent jamo
 */
export function decomposeHangul(char: string): string[] {
  if (!isHangulSyllable(char)) {
    // If it's already a jamo or not Hangul, return as is
    return [char]
  }

  const code = char.charCodeAt(0) - 0xAC00
  
  const chosungIndex = Math.floor(code / 588)
  const jungsungIndex = Math.floor((code % 588) / 28)
  const jongsungIndex = code % 28

  const result = [
    CHOSUNG[chosungIndex],
    JUNGSUNG[jungsungIndex]
  ]

  // Add final consonant if exists
  if (jongsungIndex > 0) {
    result.push(JONGSUNG[jongsungIndex])
  }

  return result
}

/**
 * Get the typing visualization for a text, showing jamo decomposition
 * Returns an array of jamo characters
 */
export function getTypingVisualization(text: string): string[] {
  const result: string[] = []
  
  for (const char of text) {
    if (isHangulSyllable(char)) {
      result.push(...decomposeHangul(char))
    } else if (char === ' ') {
      result.push('␣') // Visual space indicator
    } else {
      result.push(char)
    }
  }
  
  return result
}

/**
 * Get sliding window of characters for typing visualization
 * Shows the last N characters with smooth sliding effect
 */
export function getSlidingVisualization(
  text: string, 
  currentIndex: number, 
  windowSize: number = 5
): { chars: string[], currentPosition: number } {
  const jamoArray = getTypingVisualization(text)
  
  // Calculate current position in jamo array
  let jamoIndex = 0
  for (let i = 0; i < Math.min(currentIndex, text.length); i++) {
    const char = text[i]
    if (isHangulSyllable(char)) {
      jamoIndex += decomposeHangul(char).length
    } else {
      jamoIndex += 1
    }
  }
  
  // Create sliding window
  const start = Math.max(0, jamoIndex - Math.floor(windowSize / 2))
  const end = Math.min(jamoArray.length, start + windowSize)
  const chars = jamoArray.slice(start, end)
  
  // Pad with empty spaces if needed
  while (chars.length < windowSize) {
    chars.push('')
  }
  
  const currentPosition = jamoIndex - start
  
  return { chars, currentPosition }
}