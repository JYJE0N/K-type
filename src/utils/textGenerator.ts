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

    console.log(`📝 텍스트 생성 - 타입: ${type}, 목표: ${wordCount}`)

    switch (type) {
      case 'words':
        return this.generateWords(wordCount)
      case 'punctuation':
        return this.generateWithPunctuation(wordCount)
      case 'numbers':
        return this.generateWithNumbers(wordCount)
      case 'sentences':
        return this.generateSentences(Math.ceil(wordCount / 10)) // 레거시 지원
      case 'short-sentences':
        return this.generateSentencesByLength(wordCount * 2, 'short')   // 단문: 글자수 기준 (적은 양)
      case 'medium-sentences':
        return this.generateSentencesByLength(wordCount * 3, 'medium')  // 중문: 글자수 기준 (중간 양)
      case 'long-sentences':
        return this.generateSentencesByLength(wordCount * 4, 'long')    // 장문: 글자수 기준 (많은 양)
      default:
        return this.generateWords(wordCount)
    }
  }

  // 순수 단어만 생성 (구두점, 숫자 제외)
  private generateWords(count: number): string {
    const words = this.languagePack.wordLists.common
    const selectedWords: string[] = []

    console.log(`📝 순수 단어 생성 - 개수: ${count}`)
    console.log(`📝 사용 가능한 단어 수: ${words.length}`)
    console.log(`📝 첫 10개 단어: ${words.slice(0, 10).join(', ')}`)

    for (let i = 0; i < count; i++) {
      const randomWord = words[Math.floor(Math.random() * words.length)]
      selectedWords.push(randomWord)
    }

    const result = selectedWords.join(' ')
    console.log(`📝 생성된 텍스트: ${result.substring(0, 100)}...`)
    return result
  }

  // 구두점 포함 텍스트 생성 (단어 + 구두점 조합)
  private generateWithPunctuation(count: number): string {
    const punctuationWords = this.languagePack.wordLists.punctuation
    const regularWords = this.languagePack.wordLists.common
    const selectedWords: string[] = []

    console.log(`📝 구두점 포함 텍스트 생성 - 개수: ${count}`)

    for (let i = 0; i < count; i++) {
      // 50% 확률로 구두점 포함 단어 선택 (더 높은 확률)
      const usePunctuation = Math.random() < 0.5
      const sourceList = usePunctuation ? punctuationWords : regularWords
      const randomWord = sourceList[Math.floor(Math.random() * sourceList.length)]
      selectedWords.push(randomWord)
    }

    const result = selectedWords.join(' ')
    console.log(`📝 구두점 포함 텍스트: ${result.substring(0, 100)}...`)
    return result
  }

  // 숫자 포함 텍스트 생성 (단어 + 숫자 조합)
  private generateWithNumbers(count: number): string {
    const numberWords = this.languagePack.wordLists.numbers
    const regularWords = this.languagePack.wordLists.common
    const selectedWords: string[] = []

    console.log(`📝 숫자 포함 텍스트 생성 - 개수: ${count}`)

    for (let i = 0; i < count; i++) {
      // 40% 확률로 숫자 포함 단어 선택 (더 높은 확률)
      const useNumbers = Math.random() < 0.4
      const sourceList = useNumbers ? numberWords : regularWords
      const randomWord = sourceList[Math.floor(Math.random() * sourceList.length)]
      selectedWords.push(randomWord)
    }

    const result = selectedWords.join(' ')
    console.log(`📝 숫자 포함 텍스트: ${result.substring(0, 100)}...`)
    return result
  }

  // 문장 생성 (실제 문장 단위로 생성)
  private generateSentences(sentenceCount: number): string {
    console.log(`📝 문장 생성 - 목표 문장 수: ${sentenceCount}`)
    
    // 먼저 새로운 문장 데이터 시스템 사용 시도
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getRandomSentences } = require('@/data/sentences')
      const language = this.languagePack.id === 'korean' ? 'ko' : 'en'
      
      // 랜덤 문장들 가져오기
      const sentences = getRandomSentences(sentenceCount, { language })
      
      if (sentences && sentences.length > 0) {
        const selectedTexts = sentences.map((s: { text: string }) => s.text)
        const result = selectedTexts.join(' ')
        console.log(`📝 새 문장 시스템으로 생성: ${result.substring(0, 50)}...`)
        return result
      }
    } catch (error) {
      console.log('새 문장 시스템을 사용할 수 없습니다. 레거시 방식을 사용합니다.')
    }

    // 레거시 문장 시스템 폴백
    const sentences = this.languagePack.sentences || []
    if (sentences.length === 0) {
      console.log('문장 데이터가 없어 기본 단어로 대체합니다.')
      // 문장이 없으면 기본 단어로 대체 (단어 개수는 문장 수 * 10)
      return this.generateWords(sentenceCount * 10)
    }

    const selectedSentences: string[] = []

    // 정확히 요청된 문장 수만큼 생성
    for (let i = 0; i < sentenceCount; i++) {
      const randomSentence = sentences[Math.floor(Math.random() * sentences.length)]
      selectedSentences.push(randomSentence)
    }

    const result = selectedSentences.join(' ')
    console.log(`📝 레거시 문장 시스템으로 생성: ${result.substring(0, 50)}...`)
    return result
  }

  // 문장 타입별 생성 (글자수 기준)
  private generateSentencesByLength(targetCharCount: number, sentenceType: 'short' | 'medium' | 'long' | 'any'): string {
    console.log(`📝 문장 생성 - 타입: ${sentenceType}, 목표 글자수: ${targetCharCount}`)
    
    // 문장 타입별 데이터 가져오기
    let sentences: string[] = []
    let typeName = ''
    
    switch (sentenceType) {
      case 'short':
        sentences = this.languagePack.shortSentences || []
        typeName = '단문 (속담)'
        break
      case 'medium':
        sentences = this.languagePack.mediumSentences || []
        typeName = '중문 (가사/시)'
        break
      case 'long':
        sentences = this.languagePack.longSentences || []
        typeName = '장문 (책/사설)'
        break
      default:
        sentences = this.languagePack.sentences || []
        typeName = '일반 문장'
        break
    }

    console.log(`📝 ${typeName} 데이터 개수: ${sentences.length}`)

    if (sentences.length === 0) {
      console.log(`${typeName} 데이터가 없어 기본 단어로 대체합니다.`)
      return this.generateWords(Math.ceil(targetCharCount / 3)) // 한글 평균 3글자 = 1단어
    }

    // 목표 글자수에 맞춰 문장들 선택
    const selectedSentences: string[] = []
    let currentCharCount = 0

    while (currentCharCount < targetCharCount) {
      const randomSentence = sentences[Math.floor(Math.random() * sentences.length)]
      selectedSentences.push(randomSentence)
      currentCharCount += randomSentence.length
      
      // 무한 루프 방지
      if (selectedSentences.length > 20) break
    }

    const result = selectedSentences.join(' ')
    console.log(`📝 ${typeName} 생성 완료 - 실제 글자수: ${result.length}, 문장수: ${selectedSentences.length}`)
    console.log(`📝 생성된 텍스트: ${result.substring(0, 100)}...`)
    return result
  }

  // 문장 길이별 필터 조건 생성
  private getSentenceLengthFilter(length: 'short' | 'medium' | 'long') {
    switch (length) {
      case 'short':
        return { minWords: 3, maxWords: 8 }  // 단문: 3-8단어
      case 'medium':
        return { minWords: 9, maxWords: 15 } // 중문: 9-15단어
      case 'long':
        return { minWords: 16, maxWords: 25 } // 장문: 16-25단어
      default:
        return { minWords: 5, maxWords: 15 }
    }
  }

  // 문장 길이별 예상 단어 수
  private getWordsPerSentence(length: 'short' | 'medium' | 'long'): number {
    switch (length) {
      case 'short':
        return 6   // 단문 평균
      case 'medium':
        return 12  // 중문 평균
      case 'long':
        return 20  // 장문 평균
      default:
        return 10
    }
  }

  // 레거시 문장 배열을 길이별로 필터링
  private filterSentencesByLength(sentences: string[], length: 'short' | 'medium' | 'long'): string[] {
    const { minWords, maxWords } = this.getSentenceLengthFilter(length)
    
    return sentences.filter(sentence => {
      const wordCount = sentence.split(/\s+/).length
      return wordCount >= minWords && wordCount <= maxWords
    })
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