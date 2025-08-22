"use client";

import dynamic from 'next/dynamic';
import { ImprovementSuggestions } from './ImprovementSuggestions';
import { Clock, BarChart3 } from 'lucide-react';

// 차트 컴포넌트를 동적으로 로드 (SSR 문제 방지)
const DynamicHistoryGraph = dynamic(
  () =>
    import("./HistoryGraph").then((mod) => ({
      default: mod.HistoryGraph,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-background rounded animate-pulse"></div>
    ),
  }
);

interface RecentRecordsSectionProps {
  className?: string;
  hasRecentTests: boolean;
  primaryMetric: 'cpm' | 'wpm';
}

export function RecentRecordsSection({
  className = '',
  hasRecentTests,
  primaryMetric
}: RecentRecordsSectionProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* 최근 기록 히스토리 */}
      <div className="stats-card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5" style={{ color: 'var(--color-interactive-primary)' }} />
          <h3 className="stats-subtitle">최근 기록</h3>
        </div>
        
        {hasRecentTests ? (
          <div className="h-64">
            <DynamicHistoryGraph primaryMetric={primaryMetric} />
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center" 
               style={{ color: 'var(--color-text-secondary)' }}>
            <Clock className="w-8 h-8 mb-3 opacity-50" />
            <p className="stats-description">
              아직 기록이 없습니다
            </p>
            <p className="stats-caption mt-1">
              타이핑 테스트를 완료하면 기록이 쌓입니다
            </p>
          </div>
        )}
      </div>

      {/* AI 개선 제안 */}
      <div className="stats-card">
        <ImprovementSuggestions />
      </div>
    </div>
  );
}