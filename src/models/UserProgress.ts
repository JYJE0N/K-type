import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITestRecord {
  date: Date
  mode: string
  textType: string
  language: string
  duration: number
  wordsTyped: number
  cpm: number
  wpm: number
  accuracy: number
  consistency: number
  mistakes: number
  keystrokes: number
}

export interface ICharacterStats {
  char: string
  totalAttempts: number
  mistakes: number
  averageTime: number
}

export interface IMistakePattern {
  wrong: string
  correct: string
  count: number
}

export interface IUserProgress extends Document {
  userId: string
  username?: string
  email?: string
  
  // 최고 기록
  bestCPM: number
  bestWPM: number
  bestAccuracy: number
  bestConsistency: number
  
  // 누적 통계
  totalTests: number
  totalTime: number
  totalWords: number
  totalKeystrokes: number
  totalMistakes: number
  
  // 평균 통계
  averageCPM: number
  averageWPM: number
  averageAccuracy: number
  averageConsistency: number
  
  // 향상도 추적
  improvementTrend: number[]
  lastTestDate: Date | null
  
  // 약점 분석
  weakCharacters: ICharacterStats[]
  commonMistakes: IMistakePattern[]
  
  // 테스트 기록
  recentTests: ITestRecord[]
  
  // 스트릭
  currentStreak: number
  longestStreak: number
  lastStreakDate: Date | null
  
  createdAt: Date
  updatedAt: Date
  
  // Methods
  addTestRecord(record: ITestRecord): Promise<void>
  updateStreak(): Promise<void>
}

const TestRecordSchema = new Schema<ITestRecord>({
  date: { type: Date, required: true },
  mode: { type: String, required: true },
  textType: { type: String, required: true },
  language: { type: String, required: true },
  duration: { type: Number, required: true },
  wordsTyped: { type: Number, required: true },
  cpm: { type: Number, required: true },
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  consistency: { type: Number, default: 0 },
  mistakes: { type: Number, required: true },
  keystrokes: { type: Number, required: true },
})

const CharacterStatsSchema = new Schema<ICharacterStats>({
  char: { type: String, required: true },
  totalAttempts: { type: Number, default: 0 },
  mistakes: { type: Number, default: 0 },
  averageTime: { type: Number, default: 0 },
})

const MistakePatternSchema = new Schema<IMistakePattern>({
  wrong: { type: String, required: true },
  correct: { type: String, required: true },
  count: { type: Number, default: 1 },
})

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    username: { type: String, sparse: true },
    email: { type: String, sparse: true },
    
    // 최고 기록
    bestCPM: { type: Number, default: 0 },
    bestWPM: { type: Number, default: 0 },
    bestAccuracy: { type: Number, default: 0 },
    bestConsistency: { type: Number, default: 0 },
    
    // 누적 통계
    totalTests: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 },
    totalWords: { type: Number, default: 0 },
    totalKeystrokes: { type: Number, default: 0 },
    totalMistakes: { type: Number, default: 0 },
    
    // 평균 통계
    averageCPM: { type: Number, default: 0 },
    averageWPM: { type: Number, default: 0 },
    averageAccuracy: { type: Number, default: 0 },
    averageConsistency: { type: Number, default: 0 },
    
    // 향상도 추적
    improvementTrend: [{ type: Number }],
    lastTestDate: { type: Date, default: null },
    
    // 약점 분석
    weakCharacters: [CharacterStatsSchema],
    commonMistakes: [MistakePatternSchema],
    
    // 테스트 기록 (최근 50개만 유지)
    recentTests: {
      type: [TestRecordSchema],
      validate: [arrayLimit, '{PATH} exceeds the limit of 50']
    },
    
    // 스트릭
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastStreakDate: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
)

function arrayLimit(val: unknown[]) {
  return val.length <= 50
}

// 인덱스 생성
UserProgressSchema.index({ userId: 1, 'recentTests.date': -1 })
UserProgressSchema.index({ bestWPM: -1 })
UserProgressSchema.index({ totalTests: -1 })

// 가상 속성
UserProgressSchema.virtual('level').get(function() {
  const wpm = this.averageWPM
  if (wpm < 20) return 'Beginner'
  if (wpm < 40) return 'Intermediate'
  if (wpm < 60) return 'Advanced'
  if (wpm < 80) return 'Expert'
  return 'Master'
})

// 메서드
UserProgressSchema.methods.addTestRecord = function(record: ITestRecord) {
  this.recentTests.unshift(record)
  if (this.recentTests.length > 50) {
    this.recentTests = this.recentTests.slice(0, 50)
  }
  
  // 최고 기록 업데이트
  this.bestCPM = Math.max(this.bestCPM, record.cpm)
  this.bestWPM = Math.max(this.bestWPM, record.wpm)
  this.bestAccuracy = Math.max(this.bestAccuracy, record.accuracy)
  this.bestConsistency = Math.max(this.bestConsistency, record.consistency)
  
  // 누적 통계 업데이트
  this.totalTests++
  this.totalTime += record.duration
  this.totalWords += record.wordsTyped
  this.totalKeystrokes += record.keystrokes
  this.totalMistakes += record.mistakes
  
  // 평균 계산
  this.averageCPM = this.totalKeystrokes / (this.totalTime / 60)
  this.averageWPM = this.totalWords / (this.totalTime / 60)
  this.averageAccuracy = ((this.totalKeystrokes - this.totalMistakes) / this.totalKeystrokes) * 100
  
  // 향상도 추적
  this.improvementTrend.unshift(record.wpm)
  if (this.improvementTrend.length > 10) {
    this.improvementTrend = this.improvementTrend.slice(0, 10)
  }
  
  this.lastTestDate = new Date()
  
  return this.save()
}

UserProgressSchema.methods.updateStreak = function() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const lastDate = this.lastStreakDate ? new Date(this.lastStreakDate) : null
  if (lastDate) lastDate.setHours(0, 0, 0, 0)
  
  if (!lastDate) {
    this.currentStreak = 1
  } else {
    const dayDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (dayDiff === 0) {
      // 같은 날
    } else if (dayDiff === 1) {
      // 연속
      this.currentStreak++
    } else {
      // 끊김
      this.currentStreak = 1
    }
  }
  
  this.longestStreak = Math.max(this.longestStreak, this.currentStreak)
  this.lastStreakDate = today
  
  return this.save()
}

// 모델이 이미 컴파일되었는지 확인
const UserProgress: Model<IUserProgress> = mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema)

export default UserProgress