'use client'

import { useEffect } from 'react'
import { useUserProgressStore } from '@/stores/userProgressStore'
import { WeaknessAnalysis } from '@/components/stats/WeaknessAnalysis'
import Link from 'next/link'

export default function StatsPage() {
  const {
    bestWPM,
    bestCPM,
    bestAccuracy,
    totalTests,
    totalTime,
    totalWords,
    averageWPM,
    averageCPM,
    averageAccuracy,
    currentStreak,
    longestStreak,
    recentTests,
    getImprovementRate,
    initializeUser,
    fetchProgress
  } = useUserProgressStore()

  useEffect(() => {
    initializeUser().then(() => {
      fetchProgress()
    })
  }, [])

  const improvementRate = getImprovementRate ? getImprovementRate() : 0
  const totalHours = Math.floor(totalTime / 3600)
  const totalMinutes = Math.floor((totalTime % 3600) / 60)

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary">통계 및 분석</h1>
          <Link 
            href="/"
            className="px-4 py-2 bg-typing-accent text-background rounded-lg hover:opacity-90 transition-opacity"
          >
            연습 계속하기
          </Link>
        </div>

        {/* 개요 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* 최고 WPM */}
          <div className="bg-surface rounded-lg p-6 shadow-lg">
            <div className="text-text-secondary text-sm mb-2">최고 WPM</div>
            <div className="text-3xl font-bold text-typing-accent">{bestWPM || 0}</div>
            <div className="text-xs text-text-secondary mt-1">평균: {(averageWPM || 0).toFixed(0)}</div>
          </div>

          {/* 정확도 */}
          <div className="bg-surface rounded-lg p-6 shadow-lg">
            <div className="text-text-secondary text-sm mb-2">최고 정확도</div>
            <div className="text-3xl font-bold text-typing-correct">{(bestAccuracy || 0).toFixed(1)}%</div>
            <div className="text-xs text-text-secondary mt-1">평균: {(averageAccuracy || 0).toFixed(1)}%</div>
          </div>

          {/* 총 테스트 */}
          <div className="bg-surface rounded-lg p-6 shadow-lg">
            <div className="text-text-secondary text-sm mb-2">총 테스트</div>
            <div className="text-3xl font-bold text-text-primary">{totalTests}</div>
            <div className="text-xs text-text-secondary mt-1">{totalWords} 단어</div>
          </div>

          {/* 연속 일수 */}
          <div className="bg-surface rounded-lg p-6 shadow-lg">
            <div className="text-text-secondary text-sm mb-2">연속 일수</div>
            <div className="text-3xl font-bold text-text-primary">{currentStreak}일</div>
            <div className="text-xs text-text-secondary mt-1">최고: {longestStreak}일</div>
          </div>
        </div>

        {/* 향상도 표시 */}
        {improvementRate !== 0 && (
          <div className="bg-surface rounded-lg p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">향상도</h3>
                <p className="text-text-secondary text-sm">최근 5회 vs 이전 5회 평균</p>
              </div>
              <div className={`text-4xl font-bold ${improvementRate > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {improvementRate > 0 ? '↑' : '↓'} {Math.abs(improvementRate || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 약점 분석 */}
          <WeaknessAnalysis />

          {/* 최근 테스트 기록 */}
          <div className="bg-surface rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-text-primary">최근 기록</h2>
            
            {recentTests.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentTests.slice(0, 10).map((test, index) => (
                  <div key={test.id || index} className="p-3 bg-background rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-text-secondary">
                        {new Date(test.date).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {test.mode === 'time' ? `${test.duration}초` : `${test.wordsTyped}단어`}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-text-secondary">WPM:</span>
                        <span className="ml-1 font-bold text-text-primary">{test.wpm}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">정확도:</span>
                        <span className="ml-1 font-bold text-text-primary">{(test.accuracy || 0).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">실수:</span>
                        <span className="ml-1 font-bold text-text-primary">{test.mistakes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary text-center py-8">
                아직 테스트 기록이 없습니다
              </p>
            )}
          </div>
        </div>

        {/* 통계 요약 */}
        <div className="mt-8 bg-surface rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-text-primary">전체 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-text-secondary">총 연습 시간:</span>
              <span className="ml-2 font-bold text-text-primary">
                {totalHours}시간 {totalMinutes}분
              </span>
            </div>
            <div>
              <span className="text-text-secondary">평균 CPM:</span>
              <span className="ml-2 font-bold text-text-primary">{(averageCPM || 0).toFixed(0)}</span>
            </div>
            <div>
              <span className="text-text-secondary">총 타수:</span>
              <span className="ml-2 font-bold text-text-primary">{totalWords * 5}</span>
            </div>
            <div>
              <span className="text-text-secondary">레벨:</span>
              <span className="ml-2 font-bold text-typing-accent">
                {averageWPM < 20 ? '초급' :
                 averageWPM < 40 ? '중급' :
                 averageWPM < 60 ? '고급' :
                 averageWPM < 80 ? '전문가' : '마스터'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}