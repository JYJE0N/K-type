'use client'

import { useStatsStore } from '@/stores/statsStore'
import { useTypingStore } from '@/stores/typingStore'
import { Target, CheckCircle, TrendingUp, Clock, Copy, RotateCcw } from 'lucide-react'

interface TestResultProps {
  onRestart: () => void
  className?: string
}

export function TestResult({ onRestart, className = '' }: TestResultProps) {
  const { liveStats } = useStatsStore()
  const { startTime, endTime } = useTypingStore()

  // 테스트 소요 시간 계산
  const testDuration = startTime && endTime 
    ? (endTime.getTime() - startTime.getTime()) / 1000 
    : liveStats.timeElapsed

  // 성능 등급 계산
  const getPerformanceGrade = (cpm: number) => {
    if (cpm >= 400) return { grade: 'S', color: 'text-yellow-400' }
    if (cpm >= 350) return { grade: 'A+', color: 'text-green-400' }
    if (cpm >= 300) return { grade: 'A', color: 'text-green-500' }
    if (cpm >= 250) return { grade: 'B+', color: 'text-blue-400' }
    if (cpm >= 200) return { grade: 'B', color: 'text-blue-500' }
    if (cpm >= 150) return { grade: 'C+', color: 'text-purple-400' }
    if (cpm >= 100) return { grade: 'C', color: 'text-purple-500' }
    return { grade: 'D', color: 'text-gray-400' }
  }

  const performance = getPerformanceGrade(liveStats.cpm)

  // 등급 색상 통일
  const gradeColor = 'text-accent'

  // 정확도에 따른 피드백
  const getAccuracyFeedback = (accuracy: number) => {
    if (accuracy >= 98) return { text: '완벽합니다!', icon: Target }
    if (accuracy >= 95) return { text: '훌륭합니다!', icon: CheckCircle }
    if (accuracy >= 90) return { text: '좋습니다!', icon: TrendingUp }
    if (accuracy >= 85) return { text: '괜찮습니다', icon: CheckCircle }
    if (accuracy >= 80) return { text: '연습이 필요해요', icon: Clock }
    return { text: '더 천천히 정확하게 연습해보세요', icon: Clock }
  }


  const feedback = getAccuracyFeedback(liveStats.accuracy)
  const FeedbackIcon = feedback.icon

  return (
    <div className={`test-result ${className}`}>
      <div className="card">
        {/* 메인 결과 헤더 */}
        <div className="card-header text-center">
          <div className="flex items-center justify-center gap-4">
            <div className={`text-6xl font-bold ${gradeColor}`}>
              {performance.grade}
            </div>
            <div>
              <h2 className="title-md text-accent">테스트 완료!</h2>
              <div className="flex items-center justify-center gap-2 text-sm text-secondary">
                <FeedbackIcon size={16} />
                <span>{feedback.text}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 주요 통계 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-token-lg">
          <div className="text-center p-token-md">
            <div className="title-lg text-accent mb-token-sm">
              {liveStats.cpm}
            </div>
            <div className="text-sm text-secondary">분당 타수 (CPM)</div>
          </div>
          
          <div className="text-center p-token-md">
            <div className="title-lg text-accent mb-token-sm">
              {liveStats.accuracy}%
            </div>
            <div className="text-sm text-secondary">정확도</div>
          </div>
          
          <div className="text-center p-token-md">
            <div className="title-lg text-accent mb-token-sm">
              {liveStats.wpm}
            </div>
            <div className="text-sm text-secondary">WPM</div>
          </div>
          
          <div className="text-center p-token-md">
            <div className="title-lg text-accent mb-token-sm">
              {Math.round(testDuration)}초
            </div>
            <div className="text-sm text-secondary">소요 시간</div>
          </div>
        </div>


        {/* 액션 버튼 */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onRestart}
            className="btn btn-lg btn-primary"
          >
            <RotateCcw className="w-4 h-4" />
            다시 시작
          </button>
          
          <button
            onClick={() => {
              const resultText = `타이핑 테스트 결과\n\n` +
                `등급: ${performance.grade}\n` +
                `분당 타수: ${liveStats.cpm} CPM\n` +
                `정확도: ${liveStats.accuracy}%\n` +
                `WPM: ${liveStats.wpm}\n` +
                `소요 시간: ${Math.round(testDuration)}초\n\n` +
                `K-Types에서 측정`
              
              navigator.clipboard.writeText(resultText).then(() => {
                alert('결과가 클립보드에 복사되었습니다!')
              })
            }}
            className="btn btn-lg btn-secondary"
          >
            <Copy className="w-4 h-4" />
            결과 복사
          </button>
        </div>
      </div>
    </div>
  )
}