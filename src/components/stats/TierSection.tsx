"use client";

import { TierDisplay } from '@/components/gamification/TierDisplay';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* 티어 시스템 */}
      <div className="stats-card">
        <TierDisplay />
      </div>

      {/* 최고 기록 & 성과 */}
      <div className="stats-card">
        <h3 className="stats-subtitle">최고 기록 & 성과</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="stats-metric-medium mb-1">
              {primaryMetric === "cpm" ? bestCPM || 0 : bestWPM || 0}
            </div>
            <div className="stats-description">
              최고 {primaryMetric.toUpperCase()}
            </div>
          </div>
          
          <div className="text-center">
            <div className={`stats-metric-medium mb-1 ${
              !mounted ? "stats-improvement-neutral"
              : (improvementRate || 0) > 0 ? "stats-improvement-positive"
              : (improvementRate || 0) < 0 ? "stats-improvement-negative"
              : "stats-improvement-neutral"
            }`}>
              {!mounted ? "0.0" : (improvementRate || 0).toFixed(1)}%
            </div>
            <div className="stats-description flex items-center justify-center gap-1">
              성과 향상도
              {!mounted ? null : (improvementRate || 0) > 0 ? (
                <TrendingUp className="w-4 h-4 stats-improvement-positive" />
              ) : (improvementRate || 0) < 0 ? (
                <TrendingDown className="w-4 h-4 stats-improvement-negative" />
              ) : null}
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="stats-metric-small mb-1">{totalTests}회</div>
          <div className="stats-description">총 테스트 완료</div>
          <div className="stats-caption">
            꾸준한 연습으로 실력을 향상시키고 있습니다
          </div>
        </div>
      </div>
    </div>
  );
}