import { Sentence, SentenceCollection, ContentSource } from '@/types'

// 퍼블릭 도메인 콘텐츠 소스  
export const contentSources: ContentSource[] = [
  {
    id: 'shakespeare',
    name: 'Shakespeare Works',
    license: 'public-domain',
    author: 'William Shakespeare',
    year: 1600,
    source: 'Project Gutenberg',
    description: 'Classic works by William Shakespeare'
  },
  {
    id: 'common-phrases',
    name: 'Common English Phrases',
    license: 'original',
    description: 'Everyday English phrases and sentences'
  },
  {
    id: 'technical-writing',
    name: 'Technical Documentation',
    license: 'original', 
    description: 'Programming and technical writing samples'
  },
  {
    id: 'news-sample',
    name: 'News Style Writing',
    license: 'original',
    description: 'News article style sentences'
  }
]

// 영어 문장 데이터
export const englishSentences: Sentence[] = [
  // 초급 - 일상
  {
    id: 'en-001',
    text: 'The quick brown fox jumps over the lazy dog.',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['pangram', 'classic'],
    metadata: {
      wordCount: 9,
      characterCount: 43,
      avgWordLength: 3.9,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 250
    }
  },
  {
    id: 'en-002',
    text: 'Hello, how are you today?',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'en',
    sourceId: 'common-phrases',
    tags: ['greeting', 'short'],
    metadata: {
      wordCount: 5,
      characterCount: 25,
      avgWordLength: 3.4,
      punctuationCount: 2,
      numberCount: 0,
      estimatedWPM: 280
    }
  },

  // 중급 - 문학
  {
    id: 'en-003',
    text: 'To be or not to be, that is the question.',
    category: 'classic-literature',
    difficulty: 'intermediate', 
    language: 'en',
    sourceId: 'shakespeare',
    tags: ['famous', 'shakespeare'],
    metadata: {
      wordCount: 10,
      characterCount: 41,
      avgWordLength: 2.9,
      punctuationCount: 2,
      numberCount: 0,
      estimatedWPM: 220
    }
  },
  {
    id: 'en-004',
    text: 'All the world\'s a stage, and all the men and women merely players.',
    category: 'classic-literature',
    difficulty: 'intermediate',
    language: 'en', 
    sourceId: 'shakespeare',
    tags: ['metaphor', 'shakespeare', 'apostrophe'],
    metadata: {
      wordCount: 13,
      characterCount: 66,
      avgWordLength: 3.8,
      punctuationCount: 3,
      numberCount: 0,
      estimatedWPM: 200
    }
  },

  // 고급 - 기술/뉴스
  {
    id: 'en-005',
    text: 'Machine learning algorithms can process vast amounts of data to identify patterns and make predictions with remarkable accuracy.',
    category: 'technical',
    difficulty: 'advanced',
    language: 'en',
    sourceId: 'technical-writing', 
    tags: ['technology', 'complex', 'long'],
    metadata: {
      wordCount: 18,
      characterCount: 123,
      avgWordLength: 6.1,
      punctuationCount: 1,
      numberCount: 0,
      estimatedWPM: 180
    }
  },
  {
    id: 'en-006',
    text: 'The implementation of sustainable development goals requires coordinated efforts from governments, businesses, and civil society organizations worldwide.',
    category: 'academic',
    difficulty: 'advanced',
    language: 'en',
    sourceId: 'news-sample',
    tags: ['sustainability', 'policy', 'complex'],
    metadata: {
      wordCount: 18,
      characterCount: 140,
      avgWordLength: 6.9,
      punctuationCount: 2,
      numberCount: 0,
      estimatedWPM: 160
    }
  },

  // 전문가 - 복잡한 문장
  {
    id: 'en-007',
    text: 'The interdisciplinary approach to problem-solving, which combines insights from multiple fields of study, has proven particularly effective in addressing complex challenges that require nuanced understanding.',
    category: 'academic',
    difficulty: 'expert',
    language: 'en',
    sourceId: 'technical-writing',
    tags: ['academic', 'complex', 'multidisciplinary'],
    metadata: {
      wordCount: 25,
      characterCount: 180,
      avgWordLength: 6.4,
      punctuationCount: 3,
      numberCount: 0,
      estimatedWPM: 140
    }
  },
  {
    id: 'en-008',
    text: 'In JavaScript, the "this" keyword refers to the object that the function belongs to, but its value can change depending on how the function is called.',
    category: 'technical',
    difficulty: 'expert',
    language: 'en', 
    sourceId: 'technical-writing',
    tags: ['programming', 'quotes', 'technical'],
    metadata: {
      wordCount: 25,
      characterCount: 144,
      avgWordLength: 4.6,
      punctuationCount: 5,
      numberCount: 0,
      estimatedWPM: 150
    }
  }
]

// 영어 문장 컬렉션
export const englishCollections: SentenceCollection[] = [
  {
    id: 'english-beginner',
    name: 'English Basics',
    description: 'Simple sentences for English typing practice',
    category: 'everyday',
    difficulty: 'beginner',
    language: 'en',
    sentences: ['en-001', 'en-002'],
    sourceId: 'common-phrases',
    isDefault: true,
    tags: ['beginner', 'everyday'],
    metadata: {
      totalSentences: 2,
      avgWordLength: 3.7,
      avgSentenceLength: 34,
      estimatedTime: 2
    }
  },
  {
    id: 'shakespeare-classics',
    name: 'Shakespeare Quotes',
    description: 'Famous quotes from William Shakespeare',
    category: 'classic-literature',
    difficulty: 'intermediate',
    language: 'en',
    sentences: ['en-003', 'en-004'], 
    sourceId: 'shakespeare',
    isDefault: false,
    tags: ['literature', 'classic', 'famous'],
    metadata: {
      totalSentences: 2,
      avgWordLength: 3.4,
      avgSentenceLength: 54,
      estimatedTime: 3
    }
  },
  {
    id: 'technical-english',
    name: 'Technical Writing',
    description: 'Advanced technical and academic sentences',
    category: 'technical',
    difficulty: 'advanced',
    language: 'en',
    sentences: ['en-005', 'en-006', 'en-007', 'en-008'],
    sourceId: 'technical-writing',
    isDefault: false,
    tags: ['advanced', 'technical', 'programming'],
    metadata: {
      totalSentences: 4,
      avgWordLength: 6,
      avgSentenceLength: 147,
      estimatedTime: 8
    }
  }
]