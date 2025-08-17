// 성능 모니터링 유틸리티

export interface PerformanceMetrics {
  inputLatency: number
  renderTime: number
  memoryUsage: number
  timestamp: number
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private lastInputTime = 0
  private renderStartTime = 0

  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor()
    }
    return this.instance
  }

  // 입력 지연시간 측정 시작
  startInputMeasurement(): void {
    this.lastInputTime = performance.now()
  }

  // 입력 지연시간 측정 완료
  endInputMeasurement(): number {
    const now = performance.now()
    const latency = now - this.lastInputTime
    return latency
  }

  // 렌더링 시간 측정 시작
  startRenderMeasurement(): void {
    this.renderStartTime = performance.now()
  }

  // 렌더링 시간 측정 완료
  endRenderMeasurement(): number {
    const now = performance.now()
    const renderTime = now - this.renderStartTime
    return renderTime
  }

  // 메모리 사용량 측정
  measureMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory
      return memory ? memory.usedJSHeapSize / 1024 / 1024 : 0 // MB 단위
    }
    return 0
  }

  // 전체 메트릭 수집
  collectMetrics(): PerformanceMetrics {
    const inputLatency = this.endInputMeasurement()
    const renderTime = this.endRenderMeasurement()
    const memoryUsage = this.measureMemoryUsage()
    const timestamp = Date.now()

    const metrics: PerformanceMetrics = {
      inputLatency,
      renderTime,
      memoryUsage,
      timestamp
    }

    this.metrics.push(metrics)
    
    // 최근 100개 메트릭만 유지
    if (this.metrics.length > 100) {
      this.metrics.shift()
    }

    return metrics
  }

  // 평균 성능 지표 계산
  getAverageMetrics(): PerformanceMetrics | null {
    if (this.metrics.length === 0) return null

    const totals = this.metrics.reduce(
      (acc, metric) => ({
        inputLatency: acc.inputLatency + metric.inputLatency,
        renderTime: acc.renderTime + metric.renderTime,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
        timestamp: acc.timestamp + metric.timestamp
      }),
      { inputLatency: 0, renderTime: 0, memoryUsage: 0, timestamp: 0 }
    )

    return {
      inputLatency: totals.inputLatency / this.metrics.length,
      renderTime: totals.renderTime / this.metrics.length,
      memoryUsage: totals.memoryUsage / this.metrics.length,
      timestamp: totals.timestamp / this.metrics.length
    }
  }

  // 성능 경고 확인
  checkPerformanceWarnings(): string[] {
    const warnings: string[] = []
    const recent = this.metrics.slice(-10) // 최근 10개 측정값

    if (recent.length < 5) return warnings

    const avgInputLatency = recent.reduce((sum, m) => sum + m.inputLatency, 0) / recent.length
    const avgRenderTime = recent.reduce((sum, m) => sum + m.renderTime, 0) / recent.length
    const avgMemoryUsage = recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length

    // 입력 지연시간 경고 (데스크톱: 50ms, 모바일: 100ms)
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const inputLatencyThreshold = isMobile ? 100 : 50

    if (avgInputLatency > inputLatencyThreshold) {
      warnings.push(`입력 지연시간이 높습니다: ${avgInputLatency.toFixed(1)}ms`)
    }

    // 렌더링 시간 경고 (16.67ms = 60fps)
    if (avgRenderTime > 16.67) {
      warnings.push(`렌더링 시간이 길어 끊김이 발생할 수 있습니다: ${avgRenderTime.toFixed(1)}ms`)
    }

    // 메모리 사용량 경고 (100MB)
    if (avgMemoryUsage > 100) {
      warnings.push(`메모리 사용량이 높습니다: ${avgMemoryUsage.toFixed(1)}MB`)
    }

    return warnings
  }

  // 메트릭 리셋
  reset(): void {
    this.metrics = []
    this.lastInputTime = 0
    this.renderStartTime = 0
  }

  // 디버그용 메트릭 출력
  logMetrics(): void {
    if (process.env.NODE_ENV === 'development') {
      const avg = this.getAverageMetrics()
      const warnings = this.checkPerformanceWarnings()
      
      console.group('🔧 Performance Metrics')
      console.log('📊 Average Metrics:', avg)
      console.log('⚠️ Warnings:', warnings)
      console.log('📈 Recent Metrics:', this.metrics.slice(-5))
      console.groupEnd()
    }
  }
}

// 성능 최적화 유틸리티
export class PerformanceOptimizer {
  // 디바운스 함수
  static debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  // 스로틀 함수
  static throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0
    return (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        lastCall = now
        func(...args)
      }
    }
  }

  // requestAnimationFrame을 이용한 최적화
  static scheduleUpdate(callback: () => void): void {
    requestAnimationFrame(callback)
  }

  // 배치 업데이트 처리
  static batchUpdates<T>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => void,
    onComplete?: () => void
  ): void {
    let index = 0

    const processBatch = () => {
      const batch = items.slice(index, index + batchSize)
      if (batch.length > 0) {
        processor(batch)
        index += batchSize
        
        // 다음 배치를 다음 프레임에 처리
        requestAnimationFrame(processBatch)
      } else if (onComplete) {
        onComplete()
      }
    }

    processBatch()
  }
}

// 전역 성능 모니터 인스턴스
export const performanceMonitor = PerformanceMonitor.getInstance()