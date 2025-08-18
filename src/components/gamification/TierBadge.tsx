'use client'

import { TIER_THRESHOLDS, TierType, getTierDisplayName } from '@/utils/gamification'
import { Medal, Award, Trophy, Gem, Crown } from 'lucide-react'

interface TierBadgeProps {
  tier: TierType
  tierPoints: number
  level: number
  size?: 'sm' | 'md' | 'lg'
}

export function TierBadge({ tier, tierPoints, level, size = 'md' }: TierBadgeProps) {
  const tierInfo = TIER_THRESHOLDS[tier]
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-16 h-16 text-sm', 
    lg: 'w-20 h-20 text-base'
  }
  
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9'
  }

  // 등급별 아이콘 컴포넌트
  const getIconComponent = () => {
    const iconProps = { 
      className: `${iconSizes[size]} relative z-10`,
      style: { color: tierInfo.color }
    }
    
    switch (tier) {
      case 'bronze': return <Medal {...iconProps} />
      case 'silver': return <Award {...iconProps} />
      case 'gold': return <Trophy {...iconProps} />
      case 'diamond': return <Gem {...iconProps} />
      case 'platinum': return <Crown {...iconProps} />
      default: return <Medal {...iconProps} />
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 등급 아이콘 */}
      <div 
        className={`${sizeClasses[size]} rounded-full border-2 flex items-center justify-center font-bold relative overflow-hidden`}
        style={{ 
          borderColor: tierInfo.color,
          background: `linear-gradient(135deg, ${tierInfo.color}20, ${tierInfo.color}40)`,
        }}
      >
        {/* 진행률 배경 */}
        <div 
          className="absolute bottom-0 left-0 right-0 opacity-30"
          style={{ 
            backgroundColor: tierInfo.color,
            height: `${tierPoints}%`,
            transition: 'height 0.5s ease-out'
          }}
        />
        
        {/* 아이콘 */}
        {getIconComponent()}
      </div>
      
      {/* 등급명 */}
      <div className="text-center">
        <div 
          className="font-bold text-sm"
          style={{ color: tierInfo.color }}
        >
          {getTierDisplayName(tier)}
        </div>
        <div className="text-xs text-text-secondary">
          Lv.{level}
        </div>
        <div className="text-xs text-text-secondary">
          {tierPoints}/100
        </div>
      </div>
    </div>
  )
}