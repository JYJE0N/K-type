'use client'

import { useEffect, useState, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useStatsStore } from '@/stores/statsStore'
import { useTypingStore } from '@/stores/typingStore'

interface CPMDataPoint {
  time: number
  cpm: number
  raw: number
  errors: number
}

export function CPMGraph() {
  const [data, setData] = useState<CPMDataPoint[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)
  
  const { isActive, isPaused, isCompleted, startTime, mistakes } = useTypingStore()

  useEffect(() => {
    if (isActive && !isPaused && !isCompleted) {
      if (!startTimeRef.current) {
        startTimeRef.current = startTime || new Date()
      }

      // 매 초마다 데이터 포인트 추가
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000)
          
          // 최신 store 값을 가져오기 위해 setData 내부에서 직접 접근
          setData(prev => {
            const currentStats = useStatsStore.getState()
            const currentTyping = useTypingStore.getState()
            
            const newPoint: CPMDataPoint = {
              time: elapsed,
              cpm: Math.round(currentStats.liveStats.cpm || 0),
              raw: Math.round(currentStats.liveStats.rawCpm || currentStats.liveStats.cpm || 0),
              errors: currentTyping.mistakes.length
            }
            
            console.log('📈 그래프 데이터 추가:', {
              elapsed,
              cpm: newPoint.cpm,
              raw: newPoint.raw,
              errors: newPoint.errors
            })
            
            // 최대 60개 데이터 포인트 유지 (1분)
            const newData = [...prev, newPoint]
            if (newData.length > 60) {
              return newData.slice(-60)
            }
            return newData
          })
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      
      if (!isActive && !isCompleted) {
        // 테스트 리셋 시에만 데이터 삭제 (완료 시에는 유지)
        setData([])
        startTimeRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isPaused, isCompleted, startTime])

  // 항상 그래프를 표시 (테스트 완료 후에도 결과 유지)
  // 데이터가 전혀 없을 때만 빈 상태 표시
  const isEmpty = data.length === 0

  const maxCpm = data.length > 0 
    ? Math.max(...data.map(d => Math.max(d.cpm, d.raw)), 200)
    : 200
  const avgCpm = data.length > 0 
    ? Math.round(data.reduce((sum, d) => sum + d.cpm, 0) / data.length)
    : 0

  return (
    <div className="flex flex-col" style={{ height: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-sm)' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded"></div>
            <span className="text-sm text-primary font-medium">CPM</span>
          </div>
          <div className="text-sm text-secondary">
            평균: <span className="font-semibold text-accent">{avgCpm}</span>
          </div>
        </div>
      </div>
      
      <div className="relative bg-background rounded-lg p-3 border border-text-secondary border-opacity-10" style={{ height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={isEmpty ? [
              {time: 0, cpm: 0, raw: 0, errors: 0},
              {time: 30, cpm: 0, raw: 0, errors: 0},
              {time: 60, cpm: 0, raw: 0, errors: 0}
            ] : data} 
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorCpm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.7}/>
                <stop offset="50%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="2 4" 
              stroke="var(--text-secondary)" 
              opacity={0.15}
              strokeWidth={0.5}
            />
            
            <XAxis 
              dataKey="time" 
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              tickFormatter={(value) => `${value}s`}
            />
            
            <YAxis 
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              domain={[0, maxCpm]}
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--surface)', 
                border: '1px solid var(--text-secondary)',
                borderRadius: '8px',
                padding: '8px'
              }}
              labelStyle={{ color: 'var(--text-primary)' }}
              itemStyle={{ color: 'var(--text-primary)' }}
              formatter={(value: number, name: string) => {
                if (name === 'cpm') return [`${value} CPM`, '실제']
                if (name === 'raw') return [`${value} CPM`, 'Raw']
                return [value, name]
              }}
              labelFormatter={(label) => `${label}초`}
            />
            
            <Area 
              type="monotoneX" 
              dataKey="cpm" 
              stroke="var(--color-accent)" 
              fillOpacity={1} 
              fill="url(#colorCpm)"
              strokeWidth={3}
              name="cpm"
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* 빈 상태 오버레이 */}
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-secondary bg-surface bg-opacity-90 px-4 py-2 rounded-lg backdrop-blur-sm border border-text-secondary border-opacity-10">
              <div className="text-sm">타이핑 시작 대기 중</div>
              <div className="caption text-muted" style={{ marginTop: 'var(--spacing-xs)' }}>실시간 CPM이 여기에 표시됩니다</div>
            </div>
          </div>
        )}
      </div>
      
      {data.length > 0 && (
        <div className="flex justify-between" style={{ marginTop: 'var(--spacing-sm)' }}>
          <div className="text-sm text-secondary">
            현재: <span className="text-accent font-semibold">{data[data.length - 1].cpm}</span> <span className="text-muted">CPM</span>
          </div>
          <div className="text-sm text-secondary">
            최고: <span className="text-accent font-semibold">{Math.max(...data.map(d => d.cpm))}</span> <span className="text-muted">CPM</span>
          </div>
          <div className="text-sm text-secondary">
            정확도: <span className="text-accent font-semibold">{(useStatsStore.getState().liveStats.accuracy || 0).toFixed(1)}%</span>
          </div>
        </div>
      )}
    </div>
  )
}