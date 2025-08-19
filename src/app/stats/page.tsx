'use client'

import { useEffect, useState } from 'react'
import { useUserProgressStore } from '@/stores/userProgressStore'
import { useStatsStore } from '@/stores/statsStore'
import { useTypingStore } from '@/stores/typingStore'
import { ImprovementSuggestions } from '@/components/stats/ImprovementSuggestions'
import { TestResult } from '@/components/core/TestResult'
import { Layout } from '@/components/ui/Layout'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { TrendingUp, TrendingDown } from 'lucide-react'

// 차트 컴포넌트를 동적으로 로드 (SSR 문제 방지)
const DynamicHistoryGraph = dynamic(() => import('@/components/stats/HistoryGraph').then(mod => ({ default: mod.HistoryGraph })), {
  ssr: false,
  loading: () => <div className="h-64 bg-background rounded animate-pulse"></div>
})

export default function StatsPage() {
  const router = useRouter()
  const { isCompleted } = useTypingStore()
  const { liveStats } = useStatsStore()
  const [showLatestResult, setShowLatestResult] = useState(false)
  const [showImprovementRate, setShowImprovementRate] = useState(false)
  const [hasRecentTests, setHasRecentTests] = useState(false)
  const [primaryMetric, setPrimaryMetric] = useState<'cpm' | 'wpm'>('cpm')
  
  // 클라이언트에서만 조건부 렌더링 상태 결정
  useEffect(() => {
    setShowLatestResult(isCompleted && liveStats.cpm > 0)
  }, [isCompleted, liveStats.cpm])
  
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

  // 향상도와 최근 테스트 표시 여부 결정
  useEffect(() => {
    setShowImprovementRate(improvementRate !== 0)
    setHasRecentTests(recentTests.length > 0)
  }, [improvementRate, recentTests.length])

  // 재도전 핸들러
  const handleRestart = () => {
    router.push('/')
  }

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto px-4 py-8 lg:px-8 font-korean">
        {/* 즉시 결과 표시 (방금 완료한 테스트가 있는 경우) */}
        {showLatestResult && (
          <div className="mb-8">
            <TestResult onRestart={handleRestart} />
          </div>
        )}

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
          {/* 최고 CPM/WPM - 전환 가능 */}
          <div className="bg-surface rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-text-secondary text-sm">
                최고 {primaryMetric.toUpperCase()}
              </div>
              <button
                onClick={() => setPrimaryMetric(primaryMetric === 'cpm' ? 'wpm' : 'cpm')}
                className="text-xs text-typing-accent hover:opacity-80 transition-opacity px-2 py-1 rounded border border-typing-accent border-opacity-30"
              >
                {primaryMetric === 'cpm' ? 'WPM' : 'CPM'}
              </button>
            </div>
            <div className="text-3xl font-bold text-typing-accent">
              {primaryMetric === 'cpm' ? (bestCPM || 0) : (bestWPM || 0)}
            </div>
            <div className="text-xs text-text-secondary mt-1">
              평균: {primaryMetric === 'cpm' ? (averageCPM || 0).toFixed(0) : (averageWPM || 0).toFixed(0)}
            </div>
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
        {showImprovementRate && (
          <div className="card mb-8">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="title-md text-primary mb-2">성과 향상도</h3>
                  <p className="text-sm text-secondary">최근 5회 vs 이전 5회 평균 비교</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    improvementRate > 0 
                      ? 'bg-green-100 text-green-600' 
                      : improvementRate < 0 
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {improvementRate > 0 ? (
                      <TrendingUp className="w-6 h-6" />
                    ) : improvementRate < 0 ? (
                      <TrendingDown className="w-6 h-6" />
                    ) : (
                      <span className="text-lg">─</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      improvementRate > 0 
                        ? 'text-green-600' 
                        : improvementRate < 0 
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}>
                      {improvementRate > 0 ? '+' : ''}{improvementRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-secondary">
                      {improvementRate > 0 ? '향상' : improvementRate < 0 ? '하락' : '동일'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 성과 추이 그래프 */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">성과 추이</h2>
            </div>
            <div className="card-content" style={{ minHeight: '320px' }}>
              <DynamicHistoryGraph />
            </div>
          </div>

          {/* 최근 테스트 기록 */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">최근 기록</h2>
            </div>
            <div className="card-content">
              {hasRecentTests ? (
                <div className="max-h-96 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  {recentTests.slice(0, 10).map((test, index) => (
                    <div key={test.id || index} className="bg-background rounded-lg" style={{ padding: 'var(--spacing-md)' }}>
                      <div className="flex justify-between items-start" style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <div className="text-sm text-secondary">
                          {new Date(test.date).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Asia/Seoul'
                          })}
                        </div>
                        <div className="caption text-secondary">
                          {test.mode === 'time' ? (
                            <span className="px-2 py-1 bg-surface rounded text-xs border border-text-secondary border-opacity-20">
                              {test.duration}초
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-surface rounded text-xs border border-text-secondary border-opacity-20">
                              {(() => {
                                // textType 기반으로 구분
                                if (test.textType && (test.textType.includes('sentence') || test.textType.includes('문장'))) {
                                  return `${test.target || test.wordsTyped}문장`
                                } else {
                                  return `${test.target || test.wordsTyped}단어`
                                }
                              })()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-secondary">CPM:</span>
                          <span className="ml-1 font-semibold text-primary">{test.cpm || Math.round(test.wpm * 5)}</span>
                        </div>
                        <div>
                          <span className="text-secondary">정확도:</span>
                          <span className="ml-1 font-semibold text-primary">{(test.accuracy || 0).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-secondary">실수:</span>
                          <span className="ml-1 font-semibold text-primary">{test.mistakes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center" style={{ padding: 'var(--spacing-2xl) 0' }}>
                  <p className="text-secondary">아직 테스트 기록이 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 개선 제안 섹션 */}
        <div className="mt-8">
          <ImprovementSuggestions />
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
    </Layout>
  )
}