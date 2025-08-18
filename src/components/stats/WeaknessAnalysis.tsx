'use client'

import { useEffect, useState } from 'react'
import { useUserProgressStore } from '@/stores/userProgressStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export function WeaknessAnalysis() {
  const { 
    weakCharacters, 
    commonMistakes, 
    getWeakestCharacters,
    totalTests,
    averageAccuracy 
  } = useUserProgressStore()
  
  const [showDetails, setShowDetails] = useState(false)
  
  // 가장 약한 문자들 가져오기
  const weakestChars = getWeakestCharacters ? getWeakestCharacters(10) : []
  
  // 차트 데이터 준비
  const chartData = weakestChars.map(char => ({
    char: char.char === ' ' ? '⎵' : char.char,
    errorRate: ((char.mistakes / char.totalAttempts) * 100).toFixed(1),
    attempts: char.totalAttempts,
    mistakes: char.mistakes,
    avgTime: char.averageTime.toFixed(0)
  }))
  
  // 색상 결정 (에러율에 따라)
  const getBarColor = (errorRate: number) => {
    if (errorRate > 30) return '#ef4444' // 빨강
    if (errorRate > 20) return '#f97316' // 주황
    if (errorRate > 10) return '#eab308' // 노랑
    return '#22c55e' // 초록
  }
  
  if (totalTests === 0) {
    return (
      <div className="bg-surface rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-text-primary">약점 분석</h2>
        <p className="text-text-secondary text-center py-8">
          타이핑 테스트를 완료하면 약점 분석이 표시됩니다
        </p>
      </div>
    )
  }
  
  return (
    <div className="bg-surface rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-text-primary">약점 분석</h2>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-typing-accent hover:text-text-primary transition-colors"
        >
          {showDetails ? '간단히 보기' : '자세히 보기'}
        </button>
      </div>
      
      {/* 전체 정확도 */}
      <div className="mb-6 p-4 bg-background rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">전체 정확도</span>
          <span className={`text-2xl font-bold ${
            averageAccuracy >= 95 ? 'text-green-500' :
            averageAccuracy >= 90 ? 'text-yellow-500' :
            'text-red-500'
          }`}>
            {averageAccuracy.toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 w-full bg-surface rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              averageAccuracy >= 95 ? 'bg-green-500' :
              averageAccuracy >= 90 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${averageAccuracy}%` }}
          />
        </div>
      </div>
      
      {/* 약한 문자 차트 */}
      {chartData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-text-primary">자주 틀리는 문자</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--text-secondary)" opacity={0.1} />
              <XAxis 
                dataKey="char" 
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-primary)', fontSize: 14, fontWeight: 'bold' }}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                label={{ value: '오류율 (%)', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--surface)', 
                  border: '1px solid var(--text-secondary)',
                  borderRadius: '8px',
                  padding: '8px'
                }}
                labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                formatter={(value: any, name: string) => {
                  if (name === 'errorRate') return [`${value}%`, '오류율']
                  return [value, name]
                }}
              />
              <Bar dataKey="errorRate" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(parseFloat(entry.errorRate))} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          {showDetails && (
            <div className="mt-4 space-y-2">
              {chartData.map((char, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-background rounded">
                  <span className="font-mono text-lg text-text-primary">
                    {char.char}
                  </span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-text-secondary">
                      시도: {char.attempts}회
                    </span>
                    <span className="text-text-secondary">
                      실수: {char.mistakes}회
                    </span>
                    <span className={`font-bold ${getBarColor(parseFloat(char.errorRate))}`}>
                      {char.errorRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* 자주 틀리는 패턴 */}
      {commonMistakes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-text-primary">자주 틀리는 패턴</h3>
          <div className="space-y-2">
            {commonMistakes.slice(0, showDetails ? 10 : 5).map((mistake, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-background rounded">
                <div className="flex items-center gap-3">
                  <span className="text-text-secondary text-sm">#{index + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-typing-incorrect line-through">
                      {mistake.wrong || '(빈칸)'}
                    </span>
                    <span className="text-text-secondary">→</span>
                    <span className="font-mono text-typing-correct">
                      {mistake.correct === ' ' ? '⎵' : mistake.correct}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-text-secondary">
                  {mistake.count}회
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 개선 제안 */}
      <div className="mt-6 p-4 bg-typing-accent bg-opacity-10 rounded-lg border border-typing-accent border-opacity-30">
        <h4 className="font-semibold text-typing-accent mb-2">💡 개선 제안</h4>
        <ul className="space-y-1 text-sm text-text-secondary">
          {averageAccuracy < 90 && (
            <li>• 정확도가 낮습니다. 속도보다 정확성에 집중해보세요</li>
          )}
          {weakestChars.length > 0 && parseFloat(chartData[0]?.errorRate) > 20 && (
            <li>• &quot;{chartData[0].char}&quot; 문자 연습이 필요합니다</li>
          )}
          {commonMistakes.length > 5 && (
            <li>• 반복되는 실수 패턴이 많습니다. 천천히 타이핑해보세요</li>
          )}
          {weakestChars.some(c => c.char === ' ') && (
            <li>• 스페이스바 타이밍을 개선해보세요</li>
          )}
        </ul>
      </div>
    </div>
  )
}