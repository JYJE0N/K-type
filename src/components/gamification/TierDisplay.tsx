"use client";

import { useUserProgressStore } from "@/stores/userProgressStore";
import { defaultTierSystem, getTierColor, formatProgress, type TierConfig } from "@/utils/tierSystem";
import { useEffect, useState } from "react";
import { Trophy, TrendingUp, Target, Users, Award } from "lucide-react";

interface TierDisplayProps {
  compact?: boolean;
  showProgress?: boolean;
  className?: string;
}

export function TierDisplay({ 
  compact = false, 
  showProgress = true, 
  className = "" 
}: TierDisplayProps) {
  const {
    averageCPM,
    averageAccuracy,
    totalTests,
    averageWPM
  } = useUserProgressStore();

  const [currentTier, setCurrentTier] = useState<TierConfig | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [promotionCheck, setPromotionCheck] = useState<any>(null);

  // 일관성 계산 (간단한 버전)
  const averageConsistency = Math.max(0, 100 - (Math.abs(averageCPM - averageWPM * 5) / averageCPM) * 100) || 85;

  useEffect(() => {
    const stats = {
      averageCPM: averageCPM || 0,
      averageAccuracy: averageAccuracy || 0,
      averageConsistency,
      totalTests: totalTests || 0
    };

    const tier = defaultTierSystem.calculateCurrentTier(stats);
    const prog = defaultTierSystem.calculateProgress(stats);
    const promotion = defaultTierSystem.canPromote(stats);

    setCurrentTier(tier);
    setProgress(prog);
    setPromotionCheck(promotion);
  }, [averageCPM, averageAccuracy, averageConsistency, totalTests]);

  if (!currentTier) return null;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2"
          style={{
            background: getTierColor(currentTier, 'gradient'),
            borderColor: currentTier.color
          }}
        >
          {currentTier.icon}
        </div>
        <div>
          <div className="font-semibold text-primary" style={{ color: currentTier.color }}>
            {currentTier.name}
          </div>
          <div className="text-xs text-secondary">
            {currentTier.rewards.title}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-interactive-primary" />
          <h2 className="card-title">현재 티어</h2>
        </div>
      </div>

      <div className="card-content">
        {/* 현재 티어 표시 */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full text-4xl font-bold border-4 mb-4 shadow-lg"
            style={{
              background: getTierColor(currentTier, 'gradient'),
              borderColor: currentTier.color
            }}
          >
            {currentTier.icon}
          </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: currentTier.color }}>
            {currentTier.name}
          </h3>
          <p className="text-secondary text-sm mb-1">
            {currentTier.rewards.title}
          </p>
          <p className="text-muted text-xs">
            {currentTier.description}
          </p>
        </div>

        {/* 승급 가능 여부 */}
        {promotionCheck?.canPromote ? (
          <div className="bg-feedback-success bg-opacity-10 border border-feedback-success border-opacity-20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-feedback-success" />
              <span className="font-semibold text-feedback-success">승급 가능!</span>
            </div>
            <p className="text-sm text-secondary">
              모든 조건을 만족했습니다. 다음 테스트에서 {promotionCheck.nextTier?.name} 티어로 승급할 수 있습니다!
            </p>
          </div>
        ) : promotionCheck?.missingRequirements && (
          <div className="bg-interactive-secondary bg-opacity-10 border border-interactive-secondary border-opacity-20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-interactive-secondary" />
              <span className="font-semibold text-interactive-secondary">승급 조건</span>
            </div>
            <div className="space-y-1">
              {promotionCheck.missingRequirements.map((req: string, index: number) => (
                <p key={index} className="text-xs text-secondary">
                  • {req}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* 진행률 표시 */}
        {showProgress && progress && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-interactive-primary" />
              <span className="font-semibold text-primary">다음 티어까지</span>
            </div>

            {/* CPM 진행률 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">CPM</span>
                <span className="text-sm font-medium">
                  {Math.round(progress.cpm.current)} / {progress.cpm.required}
                </span>
              </div>
              <div className="w-full bg-background-elevated rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, progress.cpm.progress)}%`,
                    backgroundColor: formatProgress(progress.cpm.progress).color
                  }}
                ></div>
              </div>
            </div>

            {/* 정확도 진행률 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">정확도</span>
                <span className="text-sm font-medium">
                  {progress.accuracy.current.toFixed(1)}% / {progress.accuracy.required}%
                </span>
              </div>
              <div className="w-full bg-background-elevated rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, progress.accuracy.progress)}%`,
                    backgroundColor: formatProgress(progress.accuracy.progress).color
                  }}
                ></div>
              </div>
            </div>

            {/* 일관성 진행률 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">일관성</span>
                <span className="text-sm font-medium">
                  {progress.consistency.current.toFixed(1)}% / {progress.consistency.required}%
                </span>
              </div>
              <div className="w-full bg-background-elevated rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, progress.consistency.progress)}%`,
                    backgroundColor: formatProgress(progress.consistency.progress).color
                  }}
                ></div>
              </div>
            </div>

            {/* 테스트 횟수 진행률 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">테스트 횟수</span>
                <span className="text-sm font-medium">
                  {progress.tests.current} / {progress.tests.required}
                </span>
              </div>
              <div className="w-full bg-background-elevated rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, progress.tests.progress)}%`,
                    backgroundColor: formatProgress(progress.tests.progress).color
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* 모든 티어 미리보기 */}
        <div className="mt-8 pt-6 border-t border-interactive-primary border-opacity-10">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-text-tertiary" />
            <span className="font-medium text-secondary">모든 티어</span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {defaultTierSystem.getAllTiers().map((tier) => (
              <div
                key={tier.id}
                className={`text-center p-3 rounded-lg border-2 transition-all duration-200 ${
                  tier.id === currentTier.id
                    ? 'border-interactive-primary bg-interactive-primary bg-opacity-10'
                    : 'border-background-elevated bg-background-elevated hover:border-interactive-secondary'
                }`}
              >
                <div
                  className="text-2xl mb-1"
                  style={{ 
                    filter: tier.id === currentTier.id ? 'none' : 'grayscale(70%)',
                    opacity: tier.id === currentTier.id ? 1 : 0.7
                  }}
                >
                  {tier.icon}
                </div>
                <div className="text-xs font-medium text-primary">
                  {tier.name}
                </div>
                <div className="text-xs text-muted mt-1">
                  {tier.minCPM}+ CPM
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}