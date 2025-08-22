"use client";

import { TierDisplay } from '@/components/gamification/TierDisplay';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { TierBadge, PercentileTierBadge } from '@/components/ui/TierBadge';
import { defaultTierSystem } from '@/utils/tierSystem';
import { useUserProgressStore } from '@/stores/userProgressStore';

interface TierSectionProps {
  className?: string;
  bestCPM?: number;
  bestWPM?: number;
  improvementRate: number;
  totalTests: number;
  primaryMetric: 'cpm' | 'wpm';
  mounted: boolean;
}

export function TierSection({
  className = '',
  bestCPM,
  bestWPM,
  improvementRate,
  totalTests,
  primaryMetric,
  mounted
}: TierSectionProps) {
  const { averageSpeed } = useUserProgressStore();

  // 현재 사용자의 티어 정보 계산
  const currentStats = {
    averageCPM: primaryMetric === 'cpm' ? (bestCPM || 0) : (averageSpeed || 0),
    averageAccuracy: 90, // 임시값 - 실제로는 평균 정확도 사용
    averageConsistency: 80, // 임시값 - 실제로는 평균 일관성 사용
    totalTests: totalTests || 0
  };

  const currentTier = defaultTierSystem.calculateCurrentTier(currentStats);
  const progress = defaultTierSystem.calculateProgress(currentStats);
  const currentPercentile = progress?.ranking.percentile || 50;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* 티어 시스템 */}
      <div className="stats-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="stats-subtitle">현재 티어</h3>
          <PercentileTierBadge 
            tier={currentTier}
            currentPercentile={Math.round(currentPercentile)}
            size="lg"
          />
        </div>
        
        <div className="text-center mb-6">
          <div className="stats-metric-large mb-2" style={{ color: currentTier.color }}>
            {currentTier.name}
          </div>
          <div className="stats-description mb-4">
            {currentTier.description}
          </div>
          <div className="stats-caption">
            {mounted ? (
              <>상위 {100 - currentPercentile}% • {progress?.ranking.current || 0}위 / {progress?.ranking.total || 1000}명</>
            ) : (
              <>상위 50% • 0위 / 1000명</>
            )}
          </div>
        </div>

        {/* 다음 티어까지의 진행률 */}
        {mounted && progress && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="stats-description">다음 티어까지</span>
              <span className="stats-body font-semibold">
                {Math.round((progress.percentile.progress + progress.tests.progress) / 2)}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.round((progress.percentile.progress + progress.tests.progress) / 2)}%`,
                  backgroundColor: currentTier.color
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 티어 시스템 */}
      <div className="stats-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="stats-subtitle">티어 시스템</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {defaultTierSystem.getAllTiers().map((tier) => {
            const isCurrentTier = tier.id === currentTier.id;
            const isAchieved = currentPercentile >= tier.minPercentile;
            
            return (
              <div 
                key={tier.id}
                className="relative p-3 rounded-lg border transition-all duration-300"
                style={{
                  backgroundColor: isCurrentTier ? `${tier.color}20` : 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  opacity: isAchieved || isCurrentTier ? 1 : 0.3,
                  filter: isAchieved || isCurrentTier ? 'none' : 'grayscale(1)'
                }}
              >
                {/* 현재 티어 표시 */}
                {isCurrentTier && (
                  <div 
                    className="absolute bottom-2 right-2 px-1 py-0.5 rounded text-xs font-bold"
                    style={{ 
                      backgroundColor: tier.color,
                      color: 'black'
                    }}
                  >
                    CURRENT
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-lg">
                    {tier.icon}
                  </div>
                  <div 
                    className="font-bold text-sm"
                    style={{ color: isAchieved ? tier.color : 'var(--color-text-secondary)' }}
                  >
                    {tier.name}
                  </div>
                </div>
                
                <div className="text-xs mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  상위 {tier.maxPercentile !== undefined ? `${100 - tier.maxPercentile}-${100 - tier.minPercentile}%` : `${100 - tier.minPercentile}%+`}
                </div>
                
                <div className="text-xs leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
                  {tier.description}
                </div>
                
                {/* 달성 상태 */}
                {isAchieved && !isCurrentTier && (
                  <div 
                    className="absolute bottom-2 right-2 px-1 py-0.5 rounded text-xs font-bold"
                    style={{ 
                      backgroundColor: 'var(--color-interactive-primary)',
                      color: 'black'
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}