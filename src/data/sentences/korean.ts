import { Sentence, SentenceCollection, ContentSource } from '@/types'

// 퍼블릭 도메인 콘텐츠 소스
export const contentSources: ContentSource[] = [
  {
    id: 'korean-classics',
    name: '한국 고전 문학',
    license: 'public-domain',
    description: '저작권이 만료된 한국 고전 문학 작품들'
  },
  {
    id: 'korean-proverbs',
    name: '한국 속담',
    license: 'public-domain',
    description: '전통적인 한국 속담과 격언'
  },
  {
    id: 'korean-news',
    name: '뉴스 문장',
    license: 'original',
    description: '일반적인 뉴스 문체의 연습용 문장'
  },
  {
    id: 'korean-everyday',
    name: '일상 문장',
    license: 'original',
    description: '일상생활에서 자주 사용되는 문장들'
  }
]

// 문장 데이터
export const koreanSentences: Sentence[] = [
  // 초급 - 매우 쉬운 문장들
  {
    id: 'kr-001',
    text: '안녕하세요.',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['매우짧음', '인사'],
    metadata: {
      wordCount: 1,
      characterCount: 6,
      avgWordLength: 6,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 250
    }
  },
  {
    id: 'kr-002', 
    text: '감사합니다.',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['매우짧음', '인사'],
    metadata: {
      wordCount: 1,
      characterCount: 6,
      avgWordLength: 6,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 250
    }
  },
  {
    id: 'kr-003',
    text: '좋은 하루 보내세요.',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['짧은문장', '인사'],
    metadata: {
      wordCount: 3,
      characterCount: 9,
      avgWordLength: 3,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 220
    }
  },
  {
    id: 'kr-004',
    text: '오늘 날씨가 좋네요.',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['짧은문장', '일상'],
    metadata: {
      wordCount: 3,
      characterCount: 9,
      avgWordLength: 3,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 200
    }
  },
  {
    id: 'kr-005', 
    text: '물 좀 주세요.',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['짧은문장', '일상'],
    metadata: {
      wordCount: 3,
      characterCount: 6,
      avgWordLength: 2,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 240
    }
  },
  {
    id: 'kr-006',
    text: '네, 알겠습니다.',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['짧은문장', '대답'],
    metadata: {
      wordCount: 2,
      characterCount: 7,
      avgWordLength: 3.5,
      punctuationCount: 2,
      numberCount: 0,
      estimatedWPM: 220
    }
  },
  
  // 명언 모음 (중급)
  {
    id: 'kr-020',
    text: '성공은 준비된 자에게 기회가 찾아올 때 이루어진다.',
    category: 'philosophy',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['명언', '성공'],
    metadata: {
      wordCount: 8,
      characterCount: 25,
      avgWordLength: 3.1,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 180
    }
  },
  {
    id: 'kr-021',
    text: '꿈을 꾸는 것은 좋지만 실행하지 않으면 아무것도 아니다.',
    category: 'philosophy',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['명언', '실행력'],
    metadata: {
      wordCount: 9,
      characterCount: 27,
      avgWordLength: 3,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 170
    }
  },
  {
    id: 'kr-022',
    text: '오늘 하루도 최선을 다하며 감사한 마음으로 살아가겠습니다.',
    category: 'philosophy',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['명언', '감사', '긍정'],
    metadata: {
      wordCount: 8,
      characterCount: 29,
      avgWordLength: 3.6,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 160
    }
  },
  {
    id: 'kr-023',
    text: '인생은 짧고 예술은 길다. 시간을 낭비하지 말고 열정적으로 살자.',
    category: 'philosophy',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['명언', '인생', '예술'],
    metadata: {
      wordCount: 11,
      characterCount: 32,
      avgWordLength: 2.9,
      punctuationCount: 2,
      numberCount: 0,
      estimatedWPM: 150
    }
  },
  {
    id: 'kr-024',
    text: '변화를 두려워하지 말고 용기를 내어 새로운 도전을 시작해보자.',
    category: 'philosophy',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-everyday',
    tags: ['명언', '변화', '도전'],
    metadata: {
      wordCount: 10,
      characterCount: 30,
      avgWordLength: 3,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 155
    }
  },
  
  // 중급 - 속담
  {
    id: 'kr-007',
    text: '백문이 불여일견이라는 말이 있듯이, 직접 경험해보는 것이 가장 좋은 학습 방법이다.',
    category: 'classic-literature',
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-proverbs',
    tags: ['속담', '긴문장', '구두점'],
    metadata: {
      wordCount: 14,
      characterCount: 40,
      avgWordLength: 2.9,
      punctuationCount: 3,
      numberCount: 0,
      estimatedWPM: 150
    }
  },
  {
    id: 'kr-008',
    text: '천리 길도 한 걸음부터 시작한다고 하니, 포기하지 말고 꾸준히 노력해봅시다.',
    category: 'classic-literature', 
    difficulty: 'intermediate',
    language: 'ko',
    sourceId: 'korean-proverbs',
    tags: ['속담', '긴문장'],
    metadata: {
      wordCount: 12,
      characterCount: 36,
      avgWordLength: 3,
      punctuationCount: 2,
      numberCount: 0,
      estimatedWPM: 160
    }
  },

  // 고급 - 뉴스/학술
  {
    id: 'kr-009',
    text: '인공지능 기술의 발전으로 우리의 일상생활이 크게 변화하고 있으며, 이러한 변화에 적응하기 위해서는 지속적인 학습과 혁신이 필요하다.',
    category: 'technical',
    difficulty: 'advanced',
    language: 'ko', 
    sourceId: 'korean-news',
    tags: ['기술', '긴문장', '복잡'],
    metadata: {
      wordCount: 20,
      characterCount: 60,
      avgWordLength: 3,
      punctuationCount: 2,
      numberCount: 0,
      estimatedWPM: 120
    }
  },
  {
    id: 'kr-010',
    text: '21세기 디지털 시대에는 정보의 홍수 속에서 올바른 정보를 선별하고 활용하는 능력이 더욱 중요해지고 있습니다.',
    category: 'academic',
    difficulty: 'advanced',
    language: 'ko',
    sourceId: 'korean-news', 
    tags: ['학술', '숫자포함', '긴문장'],
    metadata: {
      wordCount: 18,
      characterCount: 55,
      avgWordLength: 3.1,
      punctuationCount: 1,
      numberCount: 2,
      estimatedWPM: 130
    }
  },

  // 전문가 - 복잡한 문장
  {
    id: 'kr-011',
    text: '경제학에서는 "기회비용"이라는 개념을 통해 선택의 상황에서 포기해야 하는 것의 가치를 설명하며, 이는 합리적 의사결정을 위한 핵심 요소로 여겨진다.',
    category: 'academic',
    difficulty: 'expert',
    language: 'ko',
    sourceId: 'korean-news',
    tags: ['학술', '따옴표', '복잡', '긴문장'],
    metadata: {
      wordCount: 24,
      characterCount: 75,
      avgWordLength: 3.1,
      punctuationCount: 6,
      numberCount: 0,
      estimatedWPM: 100
    }
  }
]

// 문장 컬렉션
export const koreanCollections: SentenceCollection[] = [
  {
    id: 'korean-beginner',
    name: '한국어 초급',
    description: '한국어 타이핑 연습을 시작하는 분들을 위한 기본 문장들',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'ko',
    sentences: ['kr-001', 'kr-002', 'kr-003', 'kr-004', 'kr-005', 'kr-006'],
    sourceId: 'korean-everyday',
    isDefault: true,
    tags: ['초심자', '일상'],
    metadata: {
      totalSentences: 6,
      avgWordLength: 2.8,
      avgSentenceLength: 7,
      estimatedTime: 3
    }
  },
  {
    id: 'korean-proverbs',
    name: '한국 속담',
    description: '전통적인 한국 속담과 격언으로 배우는 타이핑',
    category: 'classic-literature', 
    difficulty: 'intermediate',
    language: 'ko',
    sentences: ['kr-007', 'kr-008'],
    sourceId: 'korean-proverbs',
    isDefault: false,
    tags: ['속담', '문화'],
    metadata: {
      totalSentences: 2,
      avgWordLength: 3,
      avgSentenceLength: 38,
      estimatedTime: 5
    }
  },
  {
    id: 'korean-quotes',
    name: '한국어 명언',
    description: '동기부여가 되는 명언과 격언 모음',
    category: 'philosophy',
    difficulty: 'intermediate',
    language: 'ko',
    sentences: ['kr-020', 'kr-021', 'kr-022', 'kr-023', 'kr-024'],
    sourceId: 'korean-everyday',
    isDefault: false,
    tags: ['명언', '철학', '동기부여'],
    metadata: {
      totalSentences: 5,
      avgWordLength: 3.1,
      avgSentenceLength: 28,
      estimatedTime: 6
    }
  },
  {
    id: 'korean-advanced',
    name: '한국어 고급',
    description: '복잡한 문장 구조와 전문 용어가 포함된 고급 문장들',
    category: 'academic',
    difficulty: 'advanced',
    language: 'ko', 
    sentences: ['kr-009', 'kr-010', 'kr-011'],
    sourceId: 'korean-news',
    isDefault: false,
    tags: ['고급', '학술', '기술'],
    metadata: {
      totalSentences: 3,
      avgWordLength: 3.1,
      avgSentenceLength: 63,
      estimatedTime: 10
    }
  }
]