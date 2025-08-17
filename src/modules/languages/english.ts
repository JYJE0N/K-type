import { LanguagePack } from '@/types'

export const englishLanguagePack: LanguagePack = {
  id: 'english',
  name: 'English',
  font: 'JetBrains Mono',
  wordLists: {
    // 가장 일반적인 영어 단어 100개
    common: [
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'she', 'or', 'an', 'will',
      'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out',
      'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can',
      'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year',
      'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now',
      'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use',
      'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want',
      'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'water', 'long'
    ],
    
    // 구두점 포함 단어 50개
    punctuation: [
      'hello!', 'world.', 'yes,', 'no.', 'maybe?', "don't", "can't", "won't", "I'm", "you're",
      'well,', 'okay.', 'sure!', 'wait...', 'stop!', 'go!', 'wow!', 'oh,', 'ah!', 'hmm...',
      'hello, world!', 'how are you?', 'fine, thanks.', 'see you later.', 'good morning!',
      'good night.', 'excuse me.', 'thank you!', "you're welcome.", 'sorry!',
      'what time is it?', 'where are you?', 'how much is it?', 'when will you come?', 'why not?',
      'let me think...', 'I agree.', "I don't know.", 'maybe tomorrow.', 'sounds good!',
      'happy birthday!', 'congratulations!', 'good luck!', 'take care.', 'have fun!',
      'nice to meet you.', 'see you soon.', 'talk to you later.', 'have a good day!', 'goodbye!'
    ],
    
    // 숫자 포함 단어 30개
    numbers: [
      '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th',
      'year 2024', 'page 1', 'chapter 2', 'level 3', 'step 4', 'room 5',
      'line 6', 'item 7', 'point 8', 'case 9', 'file 10', 'code 100',
      'price $5', 'cost $10', 'save 50%', 'discount 25%', 'time 9am', 'date 12/25', 'age 30', 'speed 60mph'
    ]
  },
  
  // 퍼블릭 도메인 문장들 (자체 제작)
  sentences: [
    'The quick brown fox jumps over the lazy dog.',
    'Practice makes perfect when learning to type faster.',
    'A journey of a thousand miles begins with a single step.',
    'Knowledge is power, and typing is a valuable skill.',
    'Technology changes rapidly, but basic skills remain important.',
    'Good communication requires clear and accurate writing.',
    'Learning new skills takes time, patience, and dedication.',
    'Every expert was once a beginner who never gave up.',
    'Focus and consistent practice lead to improvement.',
    'The best time to start learning is right now.'
  ]
}