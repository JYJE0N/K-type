'use client'

import { getTierColor, type TierConfig } from '@/utils/tierSystem'

interface TierBadgeProps {
  tier: TierConfig
  progress?: number
  level?: number
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
}

export function TierBadge({ 
  tier, 
  progress = 0, 
  level = 1, 
  size = 'md',
  showProgress = true
}: TierBadgeProps) {
  
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

  // 티어 아이콘 렌더링 (이모지 사용)
  const renderTierIcon = () => {
    return (
      <span 
        className={`${iconSizes[size]} flex items-center justify-center relative z-10`}
        style={{ 
          fontSize: size === 'lg' ? '2rem' : size === 'md' ? '1.5rem' : '1rem',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
        }}
      >
        {tier.icon}
      </span>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 등급 아이콘 */}
      <div 
        className={`${sizeClasses[size]} rounded-full border-3 flex items-center justify-center font-bold relative overflow-hidden transition-all duration-300 hover:scale-105`}
        style={{ 
          borderColor: tier.color,
          background: getTierColor(tier, 'gradient'),
          boxShadow: `0 4px 12px ${tier.color}30`
        }}
      >
        {/* 진행률 배경 */}
        {showProgress && (
          <div 
            className="absolute bottom-0 left-0 right-0 opacity-40 transition-all duration-700"
            style={{ 
              backgroundColor: tier.color,
              height: `${Math.min(100, progress)}%`,
            }}
          />
        )}
        
        {/* 아이콘 */}
        {renderTierIcon()}
        
        {/* 레벨 표시 (작은 크기에서는 숨김) */}
        {size !== 'sm' && level && (
          <div 
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: tier.color, color: 'white' }}
          >
            {level}
          </div>
        )}
      </div>
      
      {/* 등급명 */}
      <div className="text-center">
        <div 
          className="font-bold text-sm"
          style={{ color: tier.color }}
        >
          {tier.name}
        </div>
        {size === 'sm' && level && (
          <div className="text-xs text-text-secondary">
            Lv.{level}
          </div>
        )}
        {showProgress && size !== 'sm' && (
          <div className="text-xs text-text-secondary">
            {Math.round(progress)}/100
          </div>
        )}
        {size === 'lg' && (
          <div className="text-xs text-muted mt-1">
            {tier.rewards.title}
          </div>
        )}
      </div>
    </div>
  )
}