'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import type { TypingSession, TestMode, TextType } from '@/types'

interface TestRecord {
  id: string
  date: Date
  mode: TestMode
  textType: TextType
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

interface CharacterStats {
  char: string
  totalAttempts: number
  mistakes: number
  averageTime: number
}

interface UserProgress {
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
  improvementTrend: number[] // 최근 10개 테스트의 WPM
  lastTestDate: Date | null
  
  // 약점 분석
  weakCharacters: CharacterStats[]
  commonMistakes: Array<{ wrong: string; correct: string; count: number }>
  
  // 테스트 기록
  recentTests: TestRecord[]
  
  // 스트릭 (연속 일수)
  currentStreak: number
  longestStreak: number
  lastStreakDate: Date | null
}

interface UserProgressStore extends UserProgress {
  // User ID
  userId: string | null
  isLoading: boolean
  error: string | null
  
  // Actions
  initializeUser: () => Promise<void>
  fetchProgress: () => Promise<void>
  recordTest: (session: TypingSession) => Promise<void>
  updateCharacterStats: (char: string, isCorrect: boolean, time: number) => void
  updateMistakePattern: (wrong: string, correct: string) => void
  syncWithServer: () => Promise<void>
  resetProgress: () => Promise<void>
  getWeakestCharacters: (limit?: number) => CharacterStats[]
  getImprovementRate: () => number
  updateStreak: () => void
}

const initialState: UserProgress = {
  bestCPM: 0,
  bestWPM: 0,
  bestAccuracy: 0,
  bestConsistency: 0,
  totalTests: 0,
  totalTime: 0,
  totalWords: 0,
  totalKeystrokes: 0,
  totalMistakes: 0,
  averageCPM: 0,
  averageWPM: 0,
  averageAccuracy: 0,
  averageConsistency: 0,
  improvementTrend: [],
  lastTestDate: null,
  weakCharacters: [],
  commonMistakes: [],
  recentTests: [],
  currentStreak: 0,
  longestStreak: 0,
  lastStreakDate: null,
}

const API_BASE = '/api/progress'

export const useUserProgressStore = create<UserProgressStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      userId: null,
      isLoading: false,
      error: null,

      initializeUser: async () => {
        const state = get()
        if (state.userId) return

        // localStorage에서 userId 확인 또는 새로 생성
        let userId = localStorage.getItem('ktypes-user-id')
        
        if (!userId) {
          try {
            const response = await axios.get(API_BASE)
            userId = response.data.userId
            localStorage.setItem('ktypes-user-id', userId)
          } catch (error) {
            console.error('Failed to initialize user:', error)
            // 오프라인 모드일 때 임시 ID 생성
            userId = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            localStorage.setItem('ktypes-user-id', userId)
          }
        }

        set({ userId })
        await get().fetchProgress()
      },

      fetchProgress: async () => {
        const { userId } = get()
        if (!userId) return

        set({ isLoading: true, error: null })

        try {
          const response = await axios.get(API_BASE, {
            params: { userId }
          })

          if (response.data.progress) {
            const progress = response.data.progress
            set({
              bestCPM: progress.bestCPM || 0,
              bestWPM: progress.bestWPM || 0,
              bestAccuracy: progress.bestAccuracy || 0,
              bestConsistency: progress.bestConsistency || 0,
              totalTests: progress.totalTests || 0,
              totalTime: progress.totalTime || 0,
              totalWords: progress.totalWords || 0,
              totalKeystrokes: progress.totalKeystrokes || 0,
              totalMistakes: progress.totalMistakes || 0,
              averageCPM: progress.averageCPM || 0,
              averageWPM: progress.averageWPM || 0,
              averageAccuracy: progress.averageAccuracy || 0,
              averageConsistency: progress.averageConsistency || 0,
              improvementTrend: progress.improvementTrend || [],
              lastTestDate: progress.lastTestDate ? new Date(progress.lastTestDate) : null,
              weakCharacters: progress.weakCharacters || [],
              commonMistakes: progress.commonMistakes || [],
              recentTests: progress.recentTests || [],
              currentStreak: progress.currentStreak || 0,
              longestStreak: progress.longestStreak || 0,
              lastStreakDate: progress.lastStreakDate ? new Date(progress.lastStreakDate) : null,
            })
          }
        } catch (error) {
          console.error('Failed to fetch progress:', error)
          set({ error: 'Failed to load progress data' })
        } finally {
          set({ isLoading: false })
        }
      },

      recordTest: async (session: TypingSession) => {
        // newRecord를 먼저 생성
        const newRecord: TestRecord = {
          id: `test-${Date.now()}`,
          date: new Date(),
          mode: session.mode,
          textType: session.textType,
          language: session.language,
          duration: session.duration,
          wordsTyped: session.wordsTyped,
          cpm: session.cpm,
          wpm: session.wpm,
          accuracy: session.accuracy,
          consistency: session.consistency || 0,
          mistakes: session.mistakes.length,
          keystrokes: session.keystrokes.length,
        }

        set((state) => {
          // 최근 테스트 기록 업데이트 (최대 50개 유지)
          const recentTests = [newRecord, ...state.recentTests].slice(0, 50)

          // 최고 기록 업데이트
          const bestCPM = Math.max(state.bestCPM, session.cpm)
          const bestWPM = Math.max(state.bestWPM, session.wpm)
          const bestAccuracy = Math.max(state.bestAccuracy, session.accuracy)
          const bestConsistency = Math.max(state.bestConsistency, session.consistency || 0)

          // 누적 통계 업데이트
          const totalTests = state.totalTests + 1
          const totalTime = state.totalTime + session.duration
          const totalWords = state.totalWords + session.wordsTyped
          const totalKeystrokes = state.totalKeystrokes + session.keystrokes.length
          const totalMistakes = state.totalMistakes + session.mistakes.length

          // 평균 통계 계산
          const averageCPM = totalKeystrokes / (totalTime / 60)
          const averageWPM = totalWords / (totalTime / 60)
          const averageAccuracy = ((totalKeystrokes - totalMistakes) / totalKeystrokes) * 100
          const averageConsistency = recentTests.reduce((sum, t) => sum + t.consistency, 0) / recentTests.length

          // 향상도 추적 업데이트 (최근 10개)
          const improvementTrend = [session.wpm, ...state.improvementTrend].slice(0, 10)

          return {
            ...state,
            bestCPM,
            bestWPM,
            bestAccuracy,
            bestConsistency,
            totalTests,
            totalTime,
            totalWords,
            totalKeystrokes,
            totalMistakes,
            averageCPM,
            averageWPM,
            averageAccuracy,
            averageConsistency,
            improvementTrend,
            lastTestDate: new Date(),
            recentTests,
          }
        })

        // 스트릭 업데이트
        get().updateStreak()

        // 서버에 저장
        const { userId } = get()
        if (userId && !userId.startsWith('offline-')) {
          try {
            await axios.post(API_BASE, {
              userId,
              testRecord: newRecord
            })
          } catch (error) {
            console.error('Failed to save test to server:', error)
            // 서버 저장 실패해도 로컬은 유지
          }
        }
      },

      updateCharacterStats: (char: string, isCorrect: boolean, time: number) => {
        set((state) => {
          const weakCharacters = [...state.weakCharacters]
          const existingIndex = weakCharacters.findIndex(c => c.char === char)

          if (existingIndex >= 0) {
            const stats = weakCharacters[existingIndex]
            stats.totalAttempts++
            if (!isCorrect) stats.mistakes++
            stats.averageTime = (stats.averageTime * (stats.totalAttempts - 1) + time) / stats.totalAttempts
          } else {
            weakCharacters.push({
              char,
              totalAttempts: 1,
              mistakes: isCorrect ? 0 : 1,
              averageTime: time,
            })
          }

          // 실수율이 높은 순으로 정렬
          weakCharacters.sort((a, b) => {
            const errorRateA = a.mistakes / a.totalAttempts
            const errorRateB = b.mistakes / b.totalAttempts
            return errorRateB - errorRateA
          })

          return { ...state, weakCharacters: weakCharacters.slice(0, 50) } // 최대 50개 문자만 추적
        })
      },

      updateMistakePattern: (wrong: string, correct: string) => {
        set((state) => {
          const commonMistakes = [...state.commonMistakes]
          const existingIndex = commonMistakes.findIndex(
            m => m.wrong === wrong && m.correct === correct
          )

          if (existingIndex >= 0) {
            commonMistakes[existingIndex].count++
          } else {
            commonMistakes.push({ wrong, correct, count: 1 })
          }

          // 빈도 순으로 정렬
          commonMistakes.sort((a, b) => b.count - a.count)

          return { ...state, commonMistakes: commonMistakes.slice(0, 30) } // 최대 30개 패턴만 추적
        })
      },

      getWeakestCharacters: (limit = 10) => {
        const { weakCharacters } = get()
        return weakCharacters
          .filter(c => c.totalAttempts >= 5) // 최소 5번 이상 시도한 문자만
          .slice(0, limit)
      },

      getImprovementRate: () => {
        const { improvementTrend } = get()
        if (improvementTrend.length < 2) return 0

        const recent = improvementTrend.slice(0, 5)
        const older = improvementTrend.slice(5, 10)

        if (older.length === 0) return 0

        const recentAvg = recent.reduce((sum, wpm) => sum + wpm, 0) / recent.length
        const olderAvg = older.reduce((sum, wpm) => sum + wpm, 0) / older.length

        return ((recentAvg - olderAvg) / olderAvg) * 100
      },

      updateStreak: () => {
        set((state) => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const lastDate = state.lastStreakDate ? new Date(state.lastStreakDate) : null
          if (lastDate) lastDate.setHours(0, 0, 0, 0)

          let currentStreak = state.currentStreak
          let longestStreak = state.longestStreak

          if (!lastDate) {
            // 첫 번째 테스트
            currentStreak = 1
          } else {
            const dayDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
            
            if (dayDiff === 0) {
              // 같은 날 - 스트릭 유지
            } else if (dayDiff === 1) {
              // 연속된 날 - 스트릭 증가
              currentStreak++
            } else {
              // 연속이 끊김 - 스트릭 리셋
              currentStreak = 1
            }
          }

          longestStreak = Math.max(longestStreak, currentStreak)

          return {
            ...state,
            currentStreak,
            longestStreak,
            lastStreakDate: today,
          }
        })
      },

      syncWithServer: async () => {
        const state = get()
        const { userId } = state
        
        if (!userId || userId.startsWith('offline-')) return

        try {
          // 약점 분석 데이터 서버에 업데이트
          await axios.put(API_BASE, {
            userId,
            characterStats: state.weakCharacters,
            mistakePatterns: state.commonMistakes
          })
        } catch (error) {
          console.error('Failed to sync with server:', error)
        }
      },

      resetProgress: async () => {
        const { userId } = get()
        
        if (userId && !userId.startsWith('offline-')) {
          try {
            await axios.delete(`${API_BASE}?userId=${userId}`)
          } catch (error) {
            console.error('Failed to reset progress on server:', error)
          }
        }
        
        set(initialState)
      },
    }),
    {
      name: 'user-progress',
      partialize: (state) => ({
        bestCPM: state.bestCPM,
        bestWPM: state.bestWPM,
        bestAccuracy: state.bestAccuracy,
        bestConsistency: state.bestConsistency,
        totalTests: state.totalTests,
        totalTime: state.totalTime,
        totalWords: state.totalWords,
        totalKeystrokes: state.totalKeystrokes,
        totalMistakes: state.totalMistakes,
        averageCPM: state.averageCPM,
        averageWPM: state.averageWPM,
        averageAccuracy: state.averageAccuracy,
        averageConsistency: state.averageConsistency,
        improvementTrend: state.improvementTrend,
        lastTestDate: state.lastTestDate,
        weakCharacters: state.weakCharacters,
        commonMistakes: state.commonMistakes,
        recentTests: state.recentTests,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastStreakDate: state.lastStreakDate,
      }),
    }
  )
)