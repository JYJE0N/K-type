"use client";

import { TestResultChart } from './TestResultChart';
import { useStatsStore } from '@/stores/statsStore';
import { useTypingStore } from '@/stores/typingStore';

interface TestResultSectionProps {
  className?: string;
  primaryMetric: 'cpm' | 'wpm';
  onMetricChange: (metric: 'cpm' | 'wpm') => void;
}

export function TestResultSection({ 
  className = '', 
  primaryMetric, 
  onMetricChange 
}: TestResultSectionProps) {
  const { liveStats } = useStatsStore();
  const { isCompleted, targetText, userInput, mistakes } = useTypingStore();

  // 테스트 결과 데이터가 있는지 확인
  const hasStatsData = liveStats && 
    (liveStats.cpm > 0 || liveStats.wpm > 0);

  if (!hasStatsData) {
    return (
      <div className={`stats-card ${className}`}>
        <h3 className="stats-subtitle">테스트 결과</h3>
        <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
          <p>아직 완료된 테스트가 없습니다</p>
          <p className="stats-caption mt-2">타이핑 테스트를 완료하면 결과가 표시됩니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <TestResultChart
        data={{
          cpm: liveStats.cpm || 0,
          wpm: liveStats.wpm || 0,
          accuracy: liveStats.accuracy || 0,
          timeElapsed: liveStats.timeElapsed || 0,
          targetText: targetText || '',
          userInput: userInput || '',
          mistakes: mistakes || []
        }}
        primaryMetric={primaryMetric}
        onMetricToggle={onMetricChange}
      />
    </div>
  );
}