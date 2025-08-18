'use client'

import { useEffect, useState, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useStatsStore } from '@/stores/statsStore'
import { useTypingStore } from '@/stores/typingStore'

interface WPMDataPoint {
  time: number
  wpm: number
  raw: number
  errors: number
}

export function WPMGraph() {
  const [data, setData] = useState<WPMDataPoint[]>([])
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
            
            const newPoint: WPMDataPoint = {
              time: elapsed,
              wpm: Math.round(currentStats.liveStats.wpm || 0),
              raw: Math.round(currentStats.liveStats.rawWpm || currentStats.liveStats.wpm || 0),
              errors: currentTyping.mistakes.length
            }
            
            console.log('📈 그래프 데이터 추가:', {
              elapsed,
              wpm: newPoint.wpm,
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
      
      if (!isActive) {
        // 테스트 종료 시 리셋
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

  if (!isActive || data.length < 2) {
    return null
  }

  const maxWpm = Math.max(...data.map(d => Math.max(d.wpm, d.raw)), 100)
  const avgWpm = data.length > 0 
    ? Math.round(data.reduce((sum, d) => sum + d.wpm, 0) / data.length)
    : 0

  return (
    <div className="bg-surface rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-text-primary">실시간 WPM</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-typing-accent rounded"></div>
            <span className="text-text-secondary">WPM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-typing-incorrect rounded"></div>
            <span className="text-text-secondary">Raw</span>
          </div>
          <div className="text-text-primary">
            평균: <span className="font-bold">{avgWpm}</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e2b714" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#e2b714" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorRaw" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ca4754" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#ca4754" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="var(--text-secondary)" 
            opacity={0.1} 
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
            domain={[0, maxWpm]}
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
              if (name === 'wpm') return [`${value} WPM`, '실제']
              if (name === 'raw') return [`${value} WPM`, 'Raw']
              return [value, name]
            }}
            labelFormatter={(label) => `${label}초`}
          />
          
          <Area 
            type="monotone" 
            dataKey="raw" 
            stroke="#ca4754" 
            fillOpacity={1} 
            fill="url(#colorRaw)"
            strokeWidth={1}
            name="raw"
          />
          
          <Area 
            type="monotone" 
            dataKey="wpm" 
            stroke="#e2b714" 
            fillOpacity={1} 
            fill="url(#colorWpm)"
            strokeWidth={2}
            name="wpm"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {data.length > 0 && (
        <div className="mt-3 flex justify-between text-xs text-text-secondary">
          <div>
            현재: <span className="text-typing-accent font-bold">{data[data.length - 1].wpm}</span> WPM
          </div>
          <div>
            최고: <span className="text-typing-accent font-bold">{Math.max(...data.map(d => d.wpm))}</span> WPM
          </div>
          <div>
            정확도: <span className="text-typing-accent font-bold">{(useStatsStore.getState().liveStats.accuracy || 0).toFixed(1)}%</span>
          </div>
        </div>
      )}
    </div>
  )
}