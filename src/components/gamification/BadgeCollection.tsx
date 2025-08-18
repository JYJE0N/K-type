'use client'

import { IBadge } from '@/models/UserProgress'
import { BADGES } from '@/utils/gamification'
import { 
  User, PersonStanding, Bike, Zap, Rocket,
  Target, Crosshair, CheckCircle,
  Calendar, CalendarDays, Trophy,
  Sprout, Flame, Dumbbell,
  Crown, TrendingUp
} from 'lucide-react'

interface BadgeCollectionProps {
  badges: IBadge[]
  maxDisplay?: number
}

export function BadgeCollection({ badges, maxDisplay = 6 }: BadgeCollectionProps) {
  const displayBadges = badges.slice(0, maxDisplay)
  const remainingCount = Math.max(0, badges.length - maxDisplay)

  // 뱃지 아이콘 컴포넌트 가져오기
  const getIconComponent = (iconName: string) => {
    const iconProps = { className: "w-6 h-6 text-white" }
    
    switch (iconName) {
      case 'Walking': return <User {...iconProps} />
      case 'PersonStanding': return <PersonStanding {...iconProps} />
      case 'Bike': return <Bike {...iconProps} />
      case 'Zap': return <Zap {...iconProps} />
      case 'Rocket': return <Rocket {...iconProps} />
      case 'Target': return <Target {...iconProps} />
      case 'Crosshair': return <Crosshair {...iconProps} />
      case 'CheckCircle': return <CheckCircle {...iconProps} />
      case 'Calendar': return <Calendar {...iconProps} />
      case 'CalendarDays': return <CalendarDays {...iconProps} />
      case 'Trophy': return <Trophy {...iconProps} />
      case 'Sprout': return <Sprout {...iconProps} />
      case 'Flame': return <Flame {...iconProps} />
      case 'Dumbbell': return <Dumbbell {...iconProps} />
      case 'Crown': return <Crown {...iconProps} />
      case 'TrendingUp': return <TrendingUp {...iconProps} />
      default: return <Trophy {...iconProps} />
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {displayBadges.map((badge, index) => (
        <div
          key={badge.id}
          className="group relative"
        >
          {/* 뱃지 */}
          <div 
            className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 
                       border-2 border-yellow-300 flex items-center justify-center
                       shadow-lg hover:shadow-xl transition-all duration-300
                       hover:scale-110 cursor-pointer"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            {getIconComponent(badge.icon)}
          </div>
          
          {/* 툴팁 */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200
                         bg-background border border-text-secondary border-opacity-20 
                         rounded-lg p-2 shadow-lg z-10 whitespace-nowrap">
            <div className="text-sm font-semibold text-typing-accent">
              {badge.name}
            </div>
            <div className="text-xs text-text-secondary">
              {badge.description}
            </div>
            {badge.value && (
              <div className="text-xs text-text-secondary">
                달성값: {badge.value}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* 나머지 뱃지 개수 표시 */}
      {remainingCount > 0 && (
        <div className="w-12 h-12 rounded-full bg-surface border-2 border-text-secondary 
                       border-opacity-30 flex items-center justify-center">
          <span className="text-sm font-semibold text-text-secondary">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  )
}