/**
 * 🏆 동적 티어 시스템
 * 하드코딩 없는 완전 설정 가능한 티어 및 승급 시스템
 */

// ===============================
// 1. 티어 정의 시스템
// ===============================

export interface TierConfig {
  id: string
  name: string
  icon: string
  color: string
  gradient: [string, string]
  minCPM: number
  minAccuracy: number
  minConsistency: number
  requiredTests: number
  description: string
  rewards: {
    title: string
    badge?: string
    theme?: string
  }
}

export interface TierRequirements {
  cpm: {
    current: number
    required: number
    progress: number
  }
  accuracy: {
    current: number
    required: number
    progress: number
  }
  consistency: {
    current: number
    required: number
    progress: number
  }
  tests: {
    current: number
    required: number
    progress: number
  }
}

// ===============================
// 2. 기본 티어 설정 (동적 수정 가능)
// ===============================

export const DEFAULT_TIERS: TierConfig[] = [
  {
    id: 'bronze',
    name: '브론즈',
    icon: '🥉',
    color: '#CD7F32',
    gradient: ['#CD7F32', '#B8860B'],
    minCPM: 0,
    minAccuracy: 0,
    minConsistency: 0,
    requiredTests: 0,
    description: '타이핑 여정의 시작',
    rewards: {
      title: '새내기 타이피스트',
    }
  },
  {
    id: 'silver',
    name: '실버',
    icon: '🥈',
    color: '#C0C0C0',
    gradient: ['#C0C0C0', '#A9A9A9'],
    minCPM: 150,
    minAccuracy: 85,
    minConsistency: 70,
    requiredTests: 5,
    description: '기초를 다진 타이피스트',
    rewards: {
      title: '기초 마스터',
      badge: 'silver-achiever'
    }
  },
  {
    id: 'gold',
    name: '골드',
    icon: '🥇',
    color: '#FFD700',
    gradient: ['#FFD700', '#FFA500'],
    minCPM: 250,
    minAccuracy: 90,
    minConsistency: 80,
    requiredTests: 10,
    description: '숙련된 타이핑 실력자',
    rewards: {
      title: '골든 핑거',
      badge: 'gold-master',
      theme: 'gold-theme'
    }
  },
  {
    id: 'platinum',
    name: '플래티넘',
    icon: '💎',
    color: '#E5E4E2',
    gradient: ['#E5E4E2', '#BFBFBF'],
    minCPM: 350,
    minAccuracy: 93,
    minConsistency: 85,
    requiredTests: 15,
    description: '전문가 수준의 타이핑',
    rewards: {
      title: '플래티넘 엘리트',
      badge: 'platinum-elite',
      theme: 'platinum-theme'
    }
  },
  {
    id: 'diamond',
    name: '다이아몬드',
    icon: '💠',
    color: '#B9F2FF',
    gradient: ['#B9F2FF', '#87CEEB'],
    minCPM: 450,
    minAccuracy: 95,
    minConsistency: 90,
    requiredTests: 25,
    description: '최고 수준의 타이핑 마스터',
    rewards: {
      title: '다이아몬드 마스터',
      badge: 'diamond-legend',
      theme: 'diamond-theme'
    }
  },
  {
    id: 'master',
    name: '마스터',
    icon: '👑',
    color: '#FF6B35',
    gradient: ['#FF6B35', '#F7931E'],
    minCPM: 550,
    minAccuracy: 97,
    minConsistency: 93,
    requiredTests: 50,
    description: '타이핑계의 전설',
    rewards: {
      title: '타이핑 레전드',
      badge: 'master-legend',
      theme: 'master-theme'
    }
  }
]

// ===============================
// 3. 티어 계산 로직
// ===============================

export class TierSystem {
  private tiers: TierConfig[]
  
  constructor(customTiers?: TierConfig[]) {
    this.tiers = customTiers || DEFAULT_TIERS
    // 티어를 minCPM 기준으로 정렬
    this.tiers.sort((a, b) => a.minCPM - b.minCPM)
  }

  /**
   * 현재 통계를 기반으로 티어 계산
   */
  calculateCurrentTier(stats: {
    averageCPM: number
    averageAccuracy: number
    averageConsistency: number
    totalTests: number
  }): TierConfig {
    // 역순으로 확인 (가장 높은 티어부터)
    for (let i = this.tiers.length - 1; i >= 0; i--) {
      const tier = this.tiers[i]
      
      if (this.meetsRequirements(stats, tier)) {
        return tier
      }
    }
    
    // 조건을 만족하는 티어가 없으면 첫 번째 티어 (브론즈)
    return this.tiers[0]
  }

  /**
   * 다음 티어까지의 진행률 계산
   */
  calculateProgress(stats: {
    averageCPM: number
    averageAccuracy: number
    averageConsistency: number
    totalTests: number
  }): TierRequirements | null {
    const currentTier = this.calculateCurrentTier(stats)
    const nextTier = this.getNextTier(currentTier.id)
    
    if (!nextTier) return null // 이미 최고 티어
    
    return {
      cpm: {
        current: stats.averageCPM,
        required: nextTier.minCPM,
        progress: Math.min(100, (stats.averageCPM / nextTier.minCPM) * 100)
      },
      accuracy: {
        current: stats.averageAccuracy,
        required: nextTier.minAccuracy,
        progress: Math.min(100, (stats.averageAccuracy / nextTier.minAccuracy) * 100)
      },
      consistency: {
        current: stats.averageConsistency,
        required: nextTier.minConsistency,
        progress: Math.min(100, (stats.averageConsistency / nextTier.minConsistency) * 100)
      },
      tests: {
        current: stats.totalTests,
        required: nextTier.requiredTests,
        progress: Math.min(100, (stats.totalTests / nextTier.requiredTests) * 100)
      }
    }
  }

  /**
   * 승급 가능 여부 확인
   */
  canPromote(stats: {
    averageCPM: number
    averageAccuracy: number
    averageConsistency: number
    totalTests: number
  }): { canPromote: boolean; nextTier?: TierConfig; missingRequirements?: string[] } {
    const currentTier = this.calculateCurrentTier(stats)
    const nextTier = this.getNextTier(currentTier.id)
    
    if (!nextTier) {
      return { canPromote: false }
    }
    
    const missingRequirements: string[] = []
    
    if (stats.averageCPM < nextTier.minCPM) {
      missingRequirements.push(`CPM ${nextTier.minCPM - stats.averageCPM}타 부족`)
    }
    if (stats.averageAccuracy < nextTier.minAccuracy) {
      missingRequirements.push(`정확도 ${(nextTier.minAccuracy - stats.averageAccuracy).toFixed(1)}% 부족`)
    }
    if (stats.averageConsistency < nextTier.minConsistency) {
      missingRequirements.push(`일관성 ${(nextTier.minConsistency - stats.averageConsistency).toFixed(1)}% 부족`)
    }
    if (stats.totalTests < nextTier.requiredTests) {
      missingRequirements.push(`테스트 ${nextTier.requiredTests - stats.totalTests}회 부족`)
    }
    
    return {
      canPromote: missingRequirements.length === 0,
      nextTier,
      missingRequirements: missingRequirements.length > 0 ? missingRequirements : undefined
    }
  }

  /**
   * 승급전 시뮬레이션
   */
  simulatePromotion(currentStats: {
    averageCPM: number
    averageAccuracy: number  
    averageConsistency: number
    totalTests: number
  }, testResult: {
    cpm: number
    accuracy: number
    consistency: number
  }): {
    beforeTier: TierConfig
    afterTier: TierConfig
    promoted: boolean
    newStats: typeof currentStats
  } {
    const beforeTier = this.calculateCurrentTier(currentStats)
    
    // 새로운 통계 계산 (가중 평균)
    const totalTests = currentStats.totalTests + 1
    const weight = totalTests > 10 ? 0.1 : 1 / totalTests // 최근 10회는 10% 가중치
    
    const newStats = {
      averageCPM: currentStats.averageCPM * (1 - weight) + testResult.cpm * weight,
      averageAccuracy: currentStats.averageAccuracy * (1 - weight) + testResult.accuracy * weight,
      averageConsistency: currentStats.averageConsistency * (1 - weight) + testResult.consistency * weight,
      totalTests
    }
    
    const afterTier = this.calculateCurrentTier(newStats)
    
    return {
      beforeTier,
      afterTier,
      promoted: beforeTier.id !== afterTier.id,
      newStats
    }
  }

  // ===============================
  // 헬퍼 메소드들
  // ===============================

  private meetsRequirements(stats: {
    averageCPM: number
    averageAccuracy: number
    averageConsistency: number
    totalTests: number
  }, tier: TierConfig): boolean {
    return (
      stats.averageCPM >= tier.minCPM &&
      stats.averageAccuracy >= tier.minAccuracy &&
      stats.averageConsistency >= tier.minConsistency &&
      stats.totalTests >= tier.requiredTests
    )
  }

  private getNextTier(currentTierId: string): TierConfig | null {
    const currentIndex = this.tiers.findIndex(tier => tier.id === currentTierId)
    if (currentIndex === -1 || currentIndex === this.tiers.length - 1) {
      return null
    }
    return this.tiers[currentIndex + 1]
  }

  /**
   * 모든 티어 정보 반환
   */
  getAllTiers(): TierConfig[] {
    return [...this.tiers]
  }

  /**
   * 특정 티어 정보 반환
   */
  getTier(tierId: string): TierConfig | null {
    return this.tiers.find(tier => tier.id === tierId) || null
  }

  /**
   * 커스텀 티어 추가
   */
  addCustomTier(tier: TierConfig): void {
    this.tiers.push(tier)
    this.tiers.sort((a, b) => a.minCPM - b.minCPM)
  }

  /**
   * 티어 설정 수정
   */
  updateTier(tierId: string, updates: Partial<TierConfig>): boolean {
    const index = this.tiers.findIndex(tier => tier.id === tierId)
    if (index === -1) return false
    
    this.tiers[index] = { ...this.tiers[index], ...updates }
    this.tiers.sort((a, b) => a.minCPM - b.minCPM)
    return true
  }
}

// ===============================
// 4. 기본 티어 시스템 인스턴스
// ===============================

export const defaultTierSystem = new TierSystem()

// ===============================
// 5. 티어 유틸리티 함수들
// ===============================

/**
 * 티어 색상 가져오기
 */
export function getTierColor(tier: TierConfig, variant: 'solid' | 'gradient' = 'solid'): string {
  if (variant === 'gradient') {
    return `linear-gradient(135deg, ${tier.gradient[0]}, ${tier.gradient[1]})`
  }
  return tier.color
}

/**
 * 티어 진행률을 시각적으로 표현
 */
export function formatProgress(progress: number): {
  percentage: string
  color: string
  description: string
} {
  const percentage = `${Math.round(progress)}%`
  
  let color = '#gray'
  let description = '시작 단계'
  
  if (progress >= 90) {
    color = '#22c55e'
    description = '거의 달성!'
  } else if (progress >= 70) {
    color = '#f59e0b'  
    description = '순조한 진행'
  } else if (progress >= 40) {
    color = '#3b82f6'
    description = '진행 중'
  }
  
  return { percentage, color, description }
}

/**
 * 승급 축하 메시지 생성
 */
export function generatePromotionMessage(fromTier: TierConfig, toTier: TierConfig): {
  title: string
  message: string
  celebration: string
} {
  return {
    title: `🎉 ${toTier.name} 티어 승급!`,
    message: `${fromTier.name}에서 ${toTier.name}으로 승급하셨습니다!\n새로운 타이틀: ${toTier.rewards.title}`,
    celebration: `${toTier.icon} ${toTier.description}`
  }
}