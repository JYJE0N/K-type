import { LanguagePack, TextType } from '@/types'

interface TextGenerationOptions {
  wordCount?: number
  includeCapitalization?: boolean
  includePunctuation?: boolean
  includeNumbers?: boolean
}

export class TextGenerator {
  private languagePack: LanguagePack

  constructor(languagePack: LanguagePack) {
    this.languagePack = languagePack
  }

  // 메인 텍스트 생성 함수
  generateText(type: TextType, options: TextGenerationOptions = {}): string {
    const { wordCount = 50 } = options

    switch (type) {
      case 'words':
        return this.generateWords(wordCount)
      case 'punctuation':
        return this.generateWithPunctuation(wordCount)
      case 'numbers':
        return this.generateWithNumbers(wordCount)
      case 'sentences':
        return this.generateSentences(wordCount)
      default:
        return this.generateWords(wordCount)
    }
  }

  // 기본 단어 생성
  private generateWords(count: number): string {
    const words = this.languagePack.wordLists.common
    const selectedWords: string[] = []

    for (let i = 0; i < count; i++) {
      const randomWord = words[Math.floor(Math.random() * words.length)]
      selectedWords.push(randomWord)
    }

    return selectedWords.join(' ')
  }

  // 구두점 포함 텍스트 생성
  private generateWithPunctuation(count: number): string {
    const punctuationWords = this.languagePack.wordLists.punctuation
    const regularWords = this.languagePack.wordLists.common
    const selectedWords: string[] = []

    for (let i = 0; i < count; i++) {
      // 30% 확률로 구두점 포함 단어 선택
      const usePunctuation = Math.random() < 0.3
      const sourceList = usePunctuation ? punctuationWords : regularWords
      const randomWord = sourceList[Math.floor(Math.random() * sourceList.length)]
      selectedWords.push(randomWord)
    }

    return selectedWords.join(' ')
  }

  // 숫자 포함 텍스트 생성
  private generateWithNumbers(count: number): string {
    const numberWords = this.languagePack.wordLists.numbers
    const regularWords = this.languagePack.wordLists.common
    const selectedWords: string[] = []

    for (let i = 0; i < count; i++) {
      // 25% 확률로 숫자 포함 단어 선택
      const useNumbers = Math.random() < 0.25
      const sourceList = useNumbers ? numberWords : regularWords
      const randomWord = sourceList[Math.floor(Math.random() * sourceList.length)]
      selectedWords.push(randomWord)
    }

    return selectedWords.join(' ')
  }

  // 문장 생성
  private generateSentences(wordCount: number): string {
    const sentences = this.languagePack.sentences || []
    if (sentences.length === 0) {
      // 문장이 없으면 기본 단어로 대체
      return this.generateWords(wordCount)
    }

    const selectedSentences: string[] = []
    let currentWordCount = 0

    while (currentWordCount < wordCount) {
      const randomSentence = sentences[Math.floor(Math.random() * sentences.length)]
      selectedSentences.push(randomSentence)
      
      // 대략적인 단어 수 계산 (공백 기준)
      currentWordCount += randomSentence.split(' ').length
    }

    const result = selectedSentences.join(' ')
    
    // 목표 단어 수에 맞게 자르기
    const words = result.split(' ')
    if (words.length > wordCount) {
      return words.slice(0, wordCount).join(' ')
    }

    return result
  }

  // 커스텀 텍스트 검증
  static validateCustomText(text: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!text || text.trim().length === 0) {
      errors.push('텍스트가 비어있습니다.')
    }

    if (text.length < 10) {
      errors.push('텍스트가 너무 짧습니다. (최소 10자)')
    }

    if (text.length > 10000) {
      errors.push('텍스트가 너무 깁니다. (최대 10,000자)')
    }

    // 지원하지 않는 문자 확인
    const unsupportedChars = text.match(/[^\w\s\p{Script=Hangul}.,!?;:'"()\-]/gu)
    if (unsupportedChars && unsupportedChars.length > 0) {
      errors.push(`지원하지 않는 문자가 포함되어 있습니다: ${[...new Set(unsupportedChars)].join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // 텍스트 난이도 분석
  static analyzeTextDifficulty(text: string, languageId: string): {
    difficulty: 'easy' | 'medium' | 'hard'
    factors: string[]
  } {
    const factors: string[] = []
    let difficultyScore = 0

    // 문자 길이
    if (text.length > 500) {
      difficultyScore += 1
      factors.push('긴 텍스트')
    }

    // 구두점 포함
    const punctuationCount = (text.match(/[.,!?;:'"()]/g) || []).length
    if (punctuationCount > text.length * 0.1) {
      difficultyScore += 1
      factors.push('구두점 많음')
    }

    // 숫자 포함
    const numberCount = (text.match(/\d/g) || []).length
    if (numberCount > 0) {
      difficultyScore += 1
      factors.push('숫자 포함')
    }

    // 언어별 추가 분석
    if (languageId === 'korean') {
      // 한글 복잡도 (받침 있는 글자)
      const complexKorean = (text.match(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g) || []).length
      if (complexKorean > text.length * 0.3) {
        difficultyScore += 1
        factors.push('복잡한 한글')
      }
    } else if (languageId === 'english') {
      // 영어 복잡도 (긴 단어, 대소문자 혼합)
      const longWords = text.split(' ').filter(word => word.length > 7).length
      if (longWords > 0) {
        difficultyScore += 1
        factors.push('긴 영어 단어')
      }

      const hasCapitals = /[A-Z]/.test(text)
      if (hasCapitals) {
        difficultyScore += 1
        factors.push('대소문자 혼합')
      }
    }

    let difficulty: 'easy' | 'medium' | 'hard'
    if (difficultyScore <= 1) {
      difficulty = 'easy'
    } else if (difficultyScore <= 3) {
      difficulty = 'medium'
    } else {
      difficulty = 'hard'
    }

    return { difficulty, factors }
  }
}